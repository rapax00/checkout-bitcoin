export interface OrderUserData {
  fullname: string;
  email: string;
  newsletter?: boolean;
}

export interface OrderRequestData extends OrderUserData {
  ticketQuantity: number;
}

export interface OrderRequestReturn {
  pr: string;
  eventReferenceId: string;
}

export interface OrderClaimReturn {
  claim: boolean;
}
