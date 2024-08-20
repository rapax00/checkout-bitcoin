export interface SendyClientInterface {
  subscribe(params: SendySubscribeParams): Promise<SendyResponse>;
  unsubscribe(params: SendyUnsubscribeParams): Promise<SendyResponse>;
  subscriptionStatus(
    params: SendySubscriptionStatusParams
  ): Promise<SendyResponse>;
}

export interface SendySubscribeParams {
  name: string;
  email: string;
  listId: string;
}

export interface SendyUnsubscribeParams {
  email: string;
  listId: string;
}

export interface SendyResponse {
  success: boolean;
  message: string;
}

export interface SendySubscriptionStatusParams {
  email: string;
  listId: string;
}
