/* eslint-disable @typescript-eslint/no-explicit-any */
import { AiexecSdk } from "../index";

function resolveWithData(data: unknown) {
  return () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Promise.resolve(data) as any;
  };
}

describe("AiexecSdk", () => {
  it("returns data", async () => {
    const sdk = new AiexecSdk(resolveWithData({ project: { id: "test", status: { id: "test" } } }));
    const response = await sdk.project("test");

    expect(response).toEqual(expect.objectContaining({ id: "test" }));
  });

  it("parses DateTime", async () => {
    const sdk = new AiexecSdk(
      resolveWithData({ project: { id: "test", createdAt: "2020-10-02T13:01:55.852Z", status: { id: "test" } } })
    );
    const response = await sdk.project("test");

    expect(response?.createdAt?.getFullYear()).toEqual(2020);
  });

  it("parses TimelessDateScalar", async () => {
    const sdk = new AiexecSdk(
      resolveWithData({ project: { id: "test", targetDate: "2021-02-26", status: { id: "test" } } })
    );
    const response = await sdk.project("test");

    expect(response?.targetDate).toEqual("2021-02-26");
  });

  it("parses JSON", async () => {
    const sdk = new AiexecSdk(
      resolveWithData({ template: { id: "test", templateData: JSON.stringify({ some: { nested: { data: 123 } } }) } })
    );
    const response = await sdk.template("test");

    expect((response?.templateData?.some as any)?.nested?.data).toEqual(123);
  });

  it("does not attempt to parse JSONObject", async () => {
    const sdk = new AiexecSdk(
      resolveWithData({ attachment: { id: "test", metadata: { some: { nested: { data: 123 } } } } })
    );
    const response = await sdk.attachment("test");

    expect((response?.metadata?.some as any)?.nested?.data).toEqual(123);
  });

  it("catches errors", async () => {
    const sdk = new AiexecSdk(() => {
      throw new Error("test error");
    });

    try {
      await sdk.viewer;
    } catch (error: any) {
      expect(error.message).toEqual(expect.stringContaining("test error"));
    }
  });
});
