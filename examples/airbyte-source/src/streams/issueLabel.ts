import { AirbyteLogger, AirbyteStreamBase, StreamKey } from "faros-airbyte-cdk";
import { Dictionary } from "ts-essentials";
import { AiexecClient } from "../client/AiexecClient";
import { IssueLabel as IssueLabelModel } from "../client/types";
export class IssueLabel extends AirbyteStreamBase {
  public constructor(
    protected readonly logger: AirbyteLogger,
    private readonly client: AiexecClient
  ) {
    super(logger);
  }

  public getJsonSchema(): Dictionary<unknown> {
    return require("../../resources/schemas/issueLabel.json");
  }
  public get primaryKey(): StreamKey {
    return ["id"];
  }
  public get cursorField(): string | string[] {
    return [];
  }

  public async *readRecords(): AsyncGenerator<IssueLabelModel> {
    const result = await this.client.issueLabels();
    for (const record of result) {
      yield record;
    }
  }
}
