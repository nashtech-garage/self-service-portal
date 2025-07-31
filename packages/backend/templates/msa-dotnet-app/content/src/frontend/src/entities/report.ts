export interface AssetReport {
  states: AssetState[];
  categories: AssetCategory[];
}

export interface AssetState {
  id?: number;
  name?: string;
}

export interface AssetCategory {
  id?: number;
  name?: string;
  total?: number;
  [stateId: `${number}`]: number;
}
