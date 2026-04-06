export type AssetCondition = 'good' | 'damaged' | 'missing';

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
  assetType: string;
  assetValue: number;
}

export interface HandoverAssetPayload {
  employeeId: string;
  assetList: string;
}

export interface UpdateAssetConditionPayload {
  assetCondition: AssetCondition;
}
