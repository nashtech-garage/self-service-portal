export interface ReturningRequest {
  id: number;
  assetCode: string;
  assetName: string;
  requestedBy: string;
  acceptedBy: string | null;
  assignedDate: string | null;
  returnedDate: string | null;
  state: number; // 1: WaitingForReturning, 2: Completed
}
