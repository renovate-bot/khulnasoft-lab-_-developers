import { AirbyteLogger, AirbyteStreamBase, StreamKey } from "faros-airbyte-cdk";
import { Dictionary } from "ts-essentials";
import { AiexecClient } from "../client/AiexecClient";
import { Comment as Model } from "../client/types";

export class Comment extends AirbyteStreamBase {
  public constructor(
    protected readonly logger: AirbyteLogger,
    private readonly client: AiexecClient
  ) {
    super(logger);
  }

  public getJsonSchema(): Dictionary<unknown> {
    return require("../../resources/schemas/comment.json");
  }
  public get primaryKey(): StreamKey {
    return ["id"];
  }
  public get cursorField(): string | string[] {
    return [];
  }

  public async *readRecords(): AsyncGenerator<Model> {
    const result = await this.client.comments();
    for (const record of result) {
      yield record;
    }
  }
}
