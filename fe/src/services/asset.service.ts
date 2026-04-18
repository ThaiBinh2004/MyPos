import api from '@/lib/axios';
import type {
  Asset,
  AssetHandover,
  AssetFilters,
  CreateAssetPayload,
  AssignAssetPayload,
  HandoverAssetPayload,
  UpdateAssetConditionPayload,
  PaginatedResponse,
} from '@/types';

export async function getAssets(filters?: AssetFilters): Promise<PaginatedResponse<Asset>> {
  const { data } = await api.get<PaginatedResponse<Asset>>('/hr/assets', { params: filters });
  return data;
}

export async function getAsset(id: string): Promise<Asset> {
  const { data } = await api.get<Asset>(`/hr/assets/${id}`);
  return data;
}

export async function createAsset(payload: CreateAssetPayload): Promise<Asset> {
  const { data } = await api.post<Asset>('/hr/assets', payload);
  return data;
}

export async function updateAssetCondition(
  id: string,
  payload: UpdateAssetConditionPayload
): Promise<Asset> {
  const { data } = await api.patch<Asset>(`/hr/assets/${id}/condition`, payload);
  return data;
}

export async function assignAsset(id: string, payload: AssignAssetPayload): Promise<Asset> {
  const { data } = await api.patch<Asset>(`/hr/assets/${id}/assign`, payload);
  return data;
}

export async function getAssetHandovers(employeeId?: string): Promise<AssetHandover[]> {
  const { data } = await api.get<AssetHandover[]>('/hr/assets/handovers', {
    params: employeeId ? { employeeId } : undefined,
  });
  return data;
}

export async function createHandover(payload: HandoverAssetPayload): Promise<AssetHandover> {
  const { data } = await api.post<AssetHandover>('/hr/assets/handovers', payload);
  return data;
}
