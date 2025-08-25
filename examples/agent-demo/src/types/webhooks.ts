/**
 * Basic types that align with webhooks targeted at agents: https://aiexec.khulnasoft.com/developers/agents#webhooks
 */

export type AgentNotificationWebhook = {
  type: "AppUserNotification";
  appUserId: string;
  notification: Notification;
  webhookId: string;
};

export enum NotificationType {
  issueMention = "issueMention",
  issueCommentMention = "issueCommentMention",
  issueAssignedToYou = "issueAssignedToYou",
  issueNewComment = "issueNewComment",
}

export type Notification = {
  type: NotificationType;
  issueId?: string;
  issue?: NotificationIssue;
  commentId?: string;
  comment?: NotificationComment;
  parentCommentId?: string;
  parentComment?: NotificationComment;
};

export type NotificationIssue = {
  id: string;
  title: string;
  description: string;
};

export type NotificationComment = {
  id: string;
  body: string;
  userId: string;
  issueId: string;
};
