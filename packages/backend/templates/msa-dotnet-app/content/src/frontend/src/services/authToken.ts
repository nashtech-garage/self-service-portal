import { store, type RootState } from '@store';

export const getAccessToken = () => {
  const state = store.getState() as RootState;
  return state.auth.user?.accessToken;
};