import { vi } from 'vitest';

export const mockChromeStorage = {
  local: {
    get: vi.fn().mockResolvedValue({}),
    set: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined),
    clear: vi.fn().mockResolvedValue(undefined)
  }
};

export const mockChromeRuntime = {
  sendMessage: vi.fn().mockResolvedValue(undefined),
  onMessage: {
    addListener: vi.fn(),
    removeListener: vi.fn()
  },
  id: 'test-extension-id'
};

export const mockChromeTabs = {
  query: vi.fn().mockResolvedValue([]),
  sendMessage: vi.fn().mockResolvedValue(undefined)
};

export function resetChromeMocks() {
  mockChromeStorage.local.get.mockResolvedValue({});
  mockChromeStorage.local.set.mockResolvedValue(undefined);
  mockChromeStorage.local.remove.mockResolvedValue(undefined);
  mockChromeStorage.local.clear.mockResolvedValue(undefined);
  mockChromeRuntime.sendMessage.mockResolvedValue(undefined);
  mockChromeTabs.query.mockResolvedValue([]);
  mockChromeTabs.sendMessage.mockResolvedValue(undefined);
}
