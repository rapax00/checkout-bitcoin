export interface OrderUserData {
  fullname: string;
  email: string;
  newsletter?: boolean;
}

export interface OrderRequest extends OrderUserData {
  qty: number;
}

export interface Order extends OrderRequest {
  total: number;
  pr: string;
  orderReferenceId: string;
}
