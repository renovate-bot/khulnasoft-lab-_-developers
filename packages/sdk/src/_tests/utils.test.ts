import { serializeUserAgent } from "../utils";

describe("serializeUserAgent", () => {
  it("handles empty", async () => {
    const result = serializeUserAgent({});
    expect(result).toEqual("");
  });

  it("handles one property", async () => {
    const result = serializeUserAgent({ "@aiexec/sdk": "0.1.2" });
    expect(result).toEqual("@aiexec/sdk@0.1.2");
  });

  it("handles multiple properties", async () => {
    const result = serializeUserAgent({
      "@aiexec/sdk": "0.1.2",
      "@aiexec/dfl": "1.2.3",
    });
    expect(result).toEqual("@aiexec/sdk@0.1.2 @aiexec/dfl@1.2.3");
  });

  it("handles uri encoding of value", async () => {
    const result = serializeUserAgent({
      "test/@1];a": '@/22]";qwed',
    });
    expect(result).toEqual("test/@1];a@%40%2F22%5D%22%3Bqwed");
  });
});
