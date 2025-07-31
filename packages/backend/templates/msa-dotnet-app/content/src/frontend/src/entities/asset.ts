export interface Asset {
  id?: number;
  code?: string;
  name?: string;
  categoryId?: number;
  categoryName?: string;
  installedDate?: string;
  state?: number;
  specification?: string;
  locationId?: number;
  locationName?: string;
  history?: AssignmentHistory[];
}

export interface AssignmentHistory {
  date?: string;
  returnDate?: string;
  assignedToId?: number;
  assignedToUsername?: string;
  assignedById?: number;
  assignedByUsername?: string;
}

export interface BasicAsset {
  id?: number;
  code?: string;
  name?: string;
  categoryId?: number;
  categoryName?: string;
  state?: number;
}

export interface CreateAsset {
  name: string;
  categoryId: number;
  specification: string;
  installedDate: string;
  state: number;
}

export interface EditAsset {
  id: number;
  name: string;
  specification: string;
  installedDate: string;
  state: number;
}

export interface DetailEditAsset {
  id?: number;
  name?: string;
  categoryId?: number;
  categoryName?: string;
  specifications?: string;
  installedDate?: string;
  state?: number;
}
