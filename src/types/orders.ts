export interface OrderUserData {
  fullname: string;
  email: string;
  newsletter?: boolean;
}

export interface OrderRequest extends OrderUserData {
  ticketQuantity: number;
  totalMiliSats: number;
}

export interface Order extends OrderRequest {
  totalMiliSats: number;
  pr: string;
  eventReferenceId: string;
}
