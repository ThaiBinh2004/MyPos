export type AssetCondition = 'good' | 'damaged' | 'missing';

export type OffboardingStatus =
  | 'INITIATED'
  | 'ASSETS_PENDING'
  | 'ASSETS_CONFIRMED'
  | 'PENDING_APPROVAL'
  | 'COMPLETED'
  | 'SETTLED';

export type AssetReturnStatus = 'PENDING' | 'RETURNED_GOOD' | 'RETURNED_DAMAGED' | 'MISSING';

export interface OffboardingAssetReturn {
  returnId: string;
  assetId: string;
  assetName: string;
  assetType: string;
  assetValue: number;
  returnStatus: AssetReturnStatus;
  returnDate?: string;
  notes?: string;
  compensationAmount: number;
}

export interface Offboarding {
  offboardingId: string;
  employeeId: string;
  employeeName: string;
  employeeBranchId: string;
  employeeBranchName: string;
  employeePosition: string;
  initiatedById: string;
  initiatedByName: string;
  reason: string;
  lastWorkingDate: string;
  status: OffboardingStatus;
  directorNote?: string;
  approvedById?: string;
  approvedByName?: string;
  approvedDate?: string;
  employeeConfirmed?: boolean;
  employeeConfirmedAt?: string;
  settlementMethod?: string;
  settlementNote?: string;
  settledAt?: string;
  settledByName?: string;
  createdAt: string;
  assetReturns: OffboardingAssetReturn[];
}

export interface InitiateOffboardingPayload {
  employeeId: string;
  initiatedByEmployeeId: string;
  reason: string;
  lastWorkingDate: string;
}

export interface ConfirmAssetReturnPayload {
  returnStatus: AssetReturnStatus;
  notes?: string;
  compensationAmount?: number;
}

export interface Asset {
  assetId: string;
  assetName: string;
  assetType: string;
  employeeId?: string;
  employeeName?: string;
  handoverDate?: string;
  assetCondition: AssetCondition;
  assetValue: number;
}

export interface AssetHandover {
  handoverId: string;
  employeeId: string;
  employeeName: string;
  issueDate: string;
  assetList: string;
  assetCondition: AssetCondition;
  approvedBy?: string;
}

export interface AssetFilters {
  search?: string;
  employeeId?: string;
  assetCondition?: AssetCondition;
  page?: number;
  pageSize?: number;
}

export interface CreateAssetPayload {
  assetName: string;
  assetValue: number;
  employeeId?: string;
  handoverDate?: string;
}

export interface AssignAssetPayload {
  employeeId?: string;
  handoverDate?: string;
}

export interface HandoverAssetPayload {
  employeeId: string;
  assetList: string;
}

export interface UpdateAssetConditionPayload {
  assetCondition: AssetCondition;
}
