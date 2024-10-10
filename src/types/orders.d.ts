export interface OrderUserData {
  fullname: string;
  email: string;
  newsletter?: boolean;
}

export interface OrderRequestData extends OrderUserData {
  ticketQuantity: number;
  code?: string;
}

export interface OrderRequestReturn {
  pr: string;
  verify: string;
  eventReferenceId: string;
}

export interface OrderClaimReturn {
  claim: boolean;
}
