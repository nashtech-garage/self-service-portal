export class BaseStorageService {
  private readonly storage: Storage;
  private readonly ACCESS_TOKEN_KEY = "access_token";
  private readonly REFRESH_TOKEN_KEY = "refresh_token";

  constructor(storage: Storage) {
    this.storage = storage;
  }

  setToken(tokens: { accessToken: string; refreshToken: string }) {
    this.storage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken);
    this.storage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
  }

  getAccessToken(): string | null {
    return this.storage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return this.storage.getItem(this.REFRESH_TOKEN_KEY);
  }

  clearToken() {
    this.storage.removeItem(this.ACCESS_TOKEN_KEY);
    this.storage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  setItem<T>(key: string, value: T) {
    this.storage.setItem(key, JSON.stringify(value));
  }

  getItem<T>(key: string): T | null {
    const item = this.storage.getItem(key);
    return item ? (JSON.parse(item) as T) : null;
  }

  removeItem(key: string) {
    this.storage.removeItem(key);
  }

  clear() {
    this.storage.clear();
  }

  // Optional: Add TTL support
  setItemWithExpiry<T>(key: string, value: T, ttlInSeconds: number) {
    const data = {
      value,
      expiry: Date.now() + ttlInSeconds * 1000,
    };
    this.setItem(key, data);
  }

  getItemWithExpiry<T>(key: string): T | null {
    const item = this.getItem<{ value: T; expiry: number }>(key);
    if (!item) {
      return null;
    }
    if (Date.now() > item.expiry) {
      this.removeItem(key);
      return null;
    }
    return item.value;
  }
}

export const LocalStorageService = new BaseStorageService(localStorage);
export const SessionStorageService = new BaseStorageService(sessionStorage);
