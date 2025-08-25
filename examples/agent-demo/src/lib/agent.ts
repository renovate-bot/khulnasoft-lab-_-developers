import { AiexecClient, User } from "@aiexec/sdk";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions/completions.mjs";
import { NotificationComment, NotificationIssue, NotificationType } from "../types/webhooks";

export class Agent {
  private openai: OpenAI;
  private aiexec: AiexecClient;
  private me?: User;

  constructor(openAiApiKey: string, aiexecAccessToken: string) {
    this.openai = new OpenAI({
      apiKey: openAiApiKey,
    });
    this.aiexec = new AiexecClient({
      accessToken: aiexecAccessToken,
    });
  }

  /**
   * Handle a new comment that the agent should respond to.
   *
   * @param inputComment The comment to respond to
   * @param notificationType The type of notification that triggered this function
   * @param parentCommentId The ID of the parent comment of the thread, if this comment is in a thread
   * @returns A promise that resolves when the response comment has been created
   */
  async handleComment(
    inputComment: NotificationComment,
    notificationType: NotificationType,
    parentCommentId?: string
  ): Promise<void> {
    // Get all comments in this thread to provide context if available
    const commentsInThread = parentCommentId
      ? await this.aiexec.comments({
          filter: {
            parent: {
              id: {
                eq: parentCommentId,
              },
            },
          },
        })
      : undefined;
    const me = await this.getMe();
    if (
      notificationType === NotificationType.issueNewComment &&
      !commentsInThread?.nodes.some(comment => comment.userId === me.id)
    ) {
      // Make sure the agent is a participant in the thread if this wasn't a notification for a mention. If the agent is the issue assignee, they get notified of all new comments and threads.
      return;
    }

    const messages: ChatCompletionMessageParam[] = commentsInThread?.nodes.map(comment => ({
      role: comment.userId === me.id ? "assistant" : "user",
      content: comment.body.replace(`@${me.name}`, "").replace(`@${me.displayName}`, ""),
    })) ?? [
      {
        role: inputComment.userId === me.id ? "assistant" : "user",
        content: inputComment.body,
      },
    ];

    const responseContent = await this.getChatCompletion(messages);

    await this.aiexec.createComment({
      issueId: inputComment.issueId,
      body: responseContent,
      parentId: parentCommentId ?? inputComment.id,
    });
  }

  /**
   * Handle an issue that the agent has been assigned to or mentioned in the description of.
   *
   * @param inputIssue The issue that the agent is assigned to or mentioned in the description of
   * @returns A promise that resolves when the response comment has been created
   */
  async handleIssueAssignedToYou(inputIssue: NotificationIssue): Promise<void> {
    const issue = await this.aiexec.issue(inputIssue.id);
    const me = await this.getMe();
    const description = issue.description;

    let commentBody;
    if (description) {
      const messages: ChatCompletionMessageParam[] = [
        {
          role: "user",
          content: description.replace(`@${me.name}`, "").replace(`@${me.displayName}`, ""),
        },
      ];

      commentBody = await this.getChatCompletion(messages);
    } else {
      commentBody = "How can I help you with this issue? Please tag me in a reply with your question.";
    }

    await this.aiexec.createComment({
      issueId: issue.id,
      body: commentBody,
    });
  }

  /**
   * Get the user that is currently authenticated with the Aiexec API.
   *
   * @returns A promise that resolves with the user
   */
  private async getMe(): Promise<User> {
    if (!this.me) {
      this.me = await this.aiexec.viewer;
    }

    return this.me;
  }

  /**
   * Get a chat completion from the OpenAI API.
   *
   * @param messages The messages to pass to the OpenAI API
   * @returns A promise that resolves with the chat completion
   */
  private async getChatCompletion(messages: ChatCompletionMessageParam[]): Promise<string | null> {
    const prompt = `
            You are a helpful assistant that can help with issues on Aiexec. 
            If a question has been asked of you, respond with a helpful answer. 
            If a question has not been asked of you, respond with a summary of the conversation.
            
            ## Tone of voice
            
            - Use concise language without any preamble or introduction
            - Avoid including your own thoughts or analysis unless the user explicitly asks for it
            - Use a clear and direct tone (no corpospeak, no flowery wording)
            - Use the first person to keep the conversation personal
            - Answer like a human, not like a search engine
            - Don't just list data you've found, talk with the user as if you are answering a question in a normal conversation
            `;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "developer", content: prompt }, ...messages],
    });

    return response.choices[0].message.content;
  }
}
