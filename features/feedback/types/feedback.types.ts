export type FeedbackType = 'suggestion' | 'complaint';
export type FeedbackStatus = 'new' | 'reviewed' | 'resolved';

export interface CreateFeedbackPayload {
  customer_name: string;
  customer_phone: string;
  feedback_type: FeedbackType;
  message: string;
  turnstile_token?: string;
}

export interface FeedbackSubmissionResult {
  success: boolean;
  message: string;
  error?: string;
}
