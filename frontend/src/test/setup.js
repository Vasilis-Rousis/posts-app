import "@testing-library/jest-dom";
import { vi, afterEach } from "vitest";

// Create localStorage mock
const createLocalStorageMock = () => {
  let store = {};

  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = String(value);
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index) => Object.keys(store)[index] || null),
  };
};

global.localStorage = createLocalStorageMock();

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock window.location
Object.defineProperty(window, "location", {
  value: {
    href: "http://localhost:3000",
    origin: "http://localhost:3000",
    reload: vi.fn(),
  },
  writable: true,
});

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});
