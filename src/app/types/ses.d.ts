export interface SESClientInterface {
  sendEmailOrder(email: string, orderId: string);
  sendEmailNewsletter(email: string);
}
