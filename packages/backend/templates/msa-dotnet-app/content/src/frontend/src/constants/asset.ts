export const ASSET_STATUS_ENUMS = {
  available: 1,
  notAvailable: 2,
  assigned: 3,
  waitingForRecycling: 4,
  recycled: 5,
};

export const ASSET_STATUS_NAMES = {
  [ASSET_STATUS_ENUMS.available]: "Available",
  [ASSET_STATUS_ENUMS.notAvailable]: "Not available",
  [ASSET_STATUS_ENUMS.assigned]: "Assigned",
  [ASSET_STATUS_ENUMS.waitingForRecycling]: "Waiting for recycling",
  [ASSET_STATUS_ENUMS.recycled]: "Recycled",
};

export const ASSET_STATUS_OPTIONS = [
  {
    value: ASSET_STATUS_ENUMS.available,
    name: ASSET_STATUS_NAMES[ASSET_STATUS_ENUMS.available],
  },
  {
    value: ASSET_STATUS_ENUMS.notAvailable,
    name: ASSET_STATUS_NAMES[ASSET_STATUS_ENUMS.notAvailable],
  },
  {
    value: ASSET_STATUS_ENUMS.assigned,
    name: ASSET_STATUS_NAMES[ASSET_STATUS_ENUMS.assigned],
  },
  {
    value: ASSET_STATUS_ENUMS.waitingForRecycling,
    name: ASSET_STATUS_NAMES[ASSET_STATUS_ENUMS.waitingForRecycling],
  },
  {
    value: ASSET_STATUS_ENUMS.recycled,
    name: ASSET_STATUS_NAMES[ASSET_STATUS_ENUMS.recycled],
  },
];

export const ASSET_CREATE_STATE = {
  available: 1,
  notAvailable: 2,
};

export const ASSET_EDIT_STATE = {
  available: 1,
  notAvailable: 2,
  waitingForRecycling: 4,
  recycled: 5,
};

export const ASSET_CREATE_STATE_NAMES = {
  [ASSET_CREATE_STATE.available]: "Available",
  [ASSET_CREATE_STATE.notAvailable]: "Not available",
};

export const ASSET_CREATE_STATE_OPTIONS = [
  {
    value: ASSET_CREATE_STATE.available,
    name: ASSET_CREATE_STATE_NAMES[ASSET_CREATE_STATE.available],
  },
  {
    value: ASSET_CREATE_STATE.notAvailable,
    name: ASSET_CREATE_STATE_NAMES[ASSET_CREATE_STATE.notAvailable],
  },
];

export const ASSET_EDIT_STATE_NAMES = {
  [ASSET_EDIT_STATE.available]: "Available",
  [ASSET_EDIT_STATE.notAvailable]: "Not available",
  [ASSET_EDIT_STATE.waitingForRecycling]: "Waiting for recycling",
  [ASSET_EDIT_STATE.recycled]: "Recycled",
};

export const ASSET_EDIT_STATE_OPTIONS = [
  {
    value: ASSET_EDIT_STATE.available,
    name: ASSET_EDIT_STATE_NAMES[ASSET_EDIT_STATE.available],
  },
  {
    value: ASSET_EDIT_STATE.notAvailable,
    name: ASSET_EDIT_STATE_NAMES[ASSET_EDIT_STATE.notAvailable],
  },
  {
    value: ASSET_EDIT_STATE.waitingForRecycling,
    name: ASSET_EDIT_STATE_NAMES[ASSET_EDIT_STATE.waitingForRecycling],
  },
  {
    value: ASSET_EDIT_STATE.recycled,
    name: ASSET_EDIT_STATE_NAMES[ASSET_EDIT_STATE.recycled],
  },
];
