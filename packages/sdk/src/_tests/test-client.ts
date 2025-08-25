/* eslint-disable no-console */
import dotenv from "dotenv";
import execa, { ExecaChildProcess } from "execa";
import getPort from "get-port";
import { AiexecClient } from "../index";
import * as net from "net";

const log = "client:test-client";

/** Load environment variables */
dotenv.config();

/** Initialize mock server variable */
let mockServer: ExecaChildProcess;

export async function startClient(Client: typeof AiexecClient = AiexecClient): Promise<AiexecClient> {
  /** Determine whether to use production or a mock server */
  if (Boolean(process.env.E2E)) {
    console.log(log, "Using Aiexec API production endpoint for end-to-end test");

    /** Create Aiexec client with production server endpoint */
    return new Client({
      apiKey: process.env.API_KEY,
    });
  } else {
    /** Get a port for the mock server */
    const serverPort = await getPort();

    /** Start the mock server */
    try {
      console.log(log, `Using mock server on http://localhost:${serverPort}/graphql`);
      mockServer = execa("graphql-faker", ["packages/sdk/src/schema.graphql", `-p ${serverPort}`]);
    } catch (error) {
      console.error(log, error);
      throw new Error(`${log} Failed to start the mock server`);
    }

    /** Wait for mock server to start */
    const timeout = 100;
    async function clientReady(port: number, attempts: number): Promise<void> {
      return new Promise((resolve, reject) => {
        const connection = net
          .createConnection({ port, timeout })
          .on("error", (e: NodeJS.ErrnoException) => {
            if (e.code === "ECONNREFUSED" && attempts > 1) {
              setTimeout(() => resolve(clientReady(port, attempts - 1)), timeout);
            } else {
              connection.end();
              reject(new Error(`Failed to connect: ${e}`));
            }
          })
          .on("timeout", () => {
            connection.end();
            reject(new Error(`Timed out connecting to port ${port} after ${timeout} milliseconds`));
          })
          .on("connect", () => {
            connection.end();
            resolve();
          });
      });
    }
    await clientReady(serverPort, 50);

    /** Create Aiexec client with mock server endpoint */
    return new Client({
      apiKey: "test",
      apiUrl: `http://localhost:${serverPort}/graphql`,
    });
  }
}

export function stopClient(): void {
  /** Kill the mock server */
  try {
    if (mockServer) {
      mockServer.kill("SIGTERM", {
        forceKillAfterTimeout: 2000,
      });
    }
  } catch (error) {
    console.error(log, error);
    throw new Error(`${log} Failed to kill the mock server`);
  }
}
