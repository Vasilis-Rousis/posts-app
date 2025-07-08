import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AuthProvider, useAuth } from "./AuthContext";
import axios from "axios";

// Mock axios
vi.mock("axios", () => ({
  default: {
    post: vi.fn(),
    defaults: {
      headers: {
        common: {},
      },
    },
  },
}));

// Simple test component that uses auth
const TestComponent = () => {
  const { user, isAuthenticated, loading } = useAuth();

  return (
    <div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="authenticated">{isAuthenticated.toString()}</div>
      <div data-testid="user">{user?.name || "no-user"}</div>
    </div>
  );
};

// Interactive test component
const InteractiveTestComponent = () => {
  const { login, register, logout } = useAuth();
  const [result, setResult] = React.useState("");

  const handleLogin = async () => {
    try {
      const res = await login("test@example.com", "password");
      setResult(res.success ? "login-success" : "login-error");
    } catch (err) {
      setResult("login-error");
    }
  };

  const handleRegister = async () => {
    try {
      const res = await register(
        "John Doe",
        "johndoe",
        "john@example.com",
        "password"
      );
      setResult(res.success ? "register-success" : "register-error");
    } catch (err) {
      setResult("register-error");
    }
  };

  return (
    <div>
      <TestComponent />
      <button onClick={handleLogin}>Login</button>
      <button onClick={handleRegister}>Register</button>
      <button onClick={logout}>Logout</button>
      <div data-testid="result">{result}</div>
    </div>
  );
};

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Clear axios defaults
    if (axios.defaults?.headers?.common) {
      delete axios.defaults.headers.common["Authorization"];
    }
  });

  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("initializes with loading state", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Should eventually stop loading
    await waitFor(
      () => {
        expect(screen.getByTestId("loading")).toHaveTextContent("false");
      },
      { timeout: 2000 }
    );

    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
    expect(screen.getByTestId("user")).toHaveTextContent("no-user");
  });

  it("initializes from localStorage when token and user exist", async () => {
    const mockUser = { id: 1, name: "John Doe", email: "john@example.com" };
    const mockToken = "mock-token";

    // Set localStorage before rendering
    localStorage.setItem("token", mockToken);
    localStorage.setItem("user", JSON.stringify(mockUser));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(
      () => {
        expect(screen.getByTestId("loading")).toHaveTextContent("false");
      },
      { timeout: 2000 }
    );

    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
      expect(screen.getByTestId("user")).toHaveTextContent("John Doe");
    });
  });

  it("handles corrupted localStorage data gracefully", async () => {
    localStorage.setItem("token", "valid-token");
    localStorage.setItem("user", "invalid-json-data");

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(
      () => {
        expect(screen.getByTestId("loading")).toHaveTextContent("false");
      },
      { timeout: 2000 }
    );

    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
    expect(screen.getByTestId("user")).toHaveTextContent("no-user");

    // Should clean up corrupted data
    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });

  it("handles successful login", async () => {
    const user = userEvent.setup();
    const mockUser = { id: 1, name: "John Doe", email: "john@example.com" };
    const mockToken = "mock-token";

    axios.post.mockResolvedValueOnce({
      data: {
        user: mockUser,
        token: mockToken,
      },
    });

    render(
      <AuthProvider>
        <InteractiveTestComponent />
      </AuthProvider>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    // Click login
    await user.click(screen.getByText("Login"));

    // Wait for success
    await waitFor(
      () => {
        expect(screen.getByTestId("result")).toHaveTextContent("login-success");
      },
      { timeout: 2000 }
    );

    // Check authentication state
    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
      expect(screen.getByTestId("user")).toHaveTextContent("John Doe");
    });
  });

  it("handles login error", async () => {
    const user = userEvent.setup();

    axios.post.mockRejectedValueOnce({
      response: {
        data: {
          message: "Invalid credentials",
        },
      },
    });

    render(
      <AuthProvider>
        <InteractiveTestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    await user.click(screen.getByText("Login"));

    await waitFor(
      () => {
        expect(screen.getByTestId("result")).toHaveTextContent("login-error");
      },
      { timeout: 2000 }
    );

    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
  });

  it("handles successful registration", async () => {
    const user = userEvent.setup();
    const mockUser = { id: 1, name: "John Doe", email: "john@example.com" };
    const mockToken = "mock-token";

    axios.post.mockResolvedValueOnce({
      data: {
        user: mockUser,
        token: mockToken,
      },
    });

    render(
      <AuthProvider>
        <InteractiveTestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    await user.click(screen.getByText("Register"));

    await waitFor(
      () => {
        expect(screen.getByTestId("result")).toHaveTextContent(
          "register-success"
        );
      },
      { timeout: 2000 }
    );

    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
      expect(screen.getByTestId("user")).toHaveTextContent("John Doe");
    });
  });

  it("handles registration error", async () => {
    const user = userEvent.setup();

    axios.post.mockRejectedValueOnce({
      response: {
        data: {
          message: "Email already exists",
        },
      },
    });

    render(
      <AuthProvider>
        <InteractiveTestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    await user.click(screen.getByText("Register"));

    await waitFor(
      () => {
        expect(screen.getByTestId("result")).toHaveTextContent(
          "register-error"
        );
      },
      { timeout: 2000 }
    );

    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
  });

  it("handles logout", async () => {
    const user = userEvent.setup();
    const mockUser = { id: 1, name: "John Doe", email: "john@example.com" };
    const mockToken = "mock-token";

    // Start with authenticated state
    localStorage.setItem("token", mockToken);
    localStorage.setItem("user", JSON.stringify(mockUser));

    render(
      <AuthProvider>
        <InteractiveTestComponent />
      </AuthProvider>
    );

    // Wait for authenticated state
    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    });

    // Logout
    await user.click(screen.getByText("Logout"));

    // Should be logged out
    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
    expect(screen.getByTestId("user")).toHaveTextContent("no-user");
    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });

  it("calls logout callbacks on logout", async () => {
    const user = userEvent.setup();
    const mockCallback = vi.fn();

    const TestWithCallback = () => {
      const { registerLogoutCallback, logout } = useAuth();

      React.useEffect(() => {
        registerLogoutCallback(mockCallback);
      }, [registerLogoutCallback]);

      return <button onClick={logout}>Logout</button>;
    };

    render(
      <AuthProvider>
        <TestWithCallback />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Logout")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Logout"));

    expect(mockCallback).toHaveBeenCalled();
  });
});
