import { printComment, printLines } from "@aiexec/codegen-doc";
import { Sdk } from "@aiexec/codegen-sdk";

/**
 * Prints code required before tests
 */
function printBeforeSuite(): string {
  return printLines([
    printComment(["Initialize Aiexec client variable"]),
    `let client: ${Sdk.NAMESPACE}.AiexecClient`,
    "\n",
  ]);
}

/**
 * Prints the hook to call before each test runs
 * Sets jest fake timers
 */
function printBeforeEach(): string {
  return printLines([
    `beforeEach(() => {
      jest.useFakeTimers()
    })`,
    "\n",
  ]);
}

/**
 * Prints the hook to call before all tests run
 * Starts the mock server
 */
function printBeforeAll(): string {
  return printLines([
    `beforeAll(async () => {
      client = await startClient()
    })`,
    "\n",
  ]);
}

/**
 * Prints the hook to call after all test have run
 * Kills the mock server
 */
function printAfterAll(): string {
  return printLines([
    `afterAll(() => {
      stopClient()
    })`,
    "\n",
  ]);
}

/**
 * Print all jest hooks
 */
export function printTestHooks(): string {
  return printLines([printBeforeSuite(), printBeforeEach(), printBeforeAll(), printAfterAll()]);
}
