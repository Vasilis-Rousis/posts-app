import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import axios from "axios";

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Use useRef to avoid re-renders and dependency issues
  const onLogoutCallbacksRef = useRef([]);

  const registerLogoutCallback = (callback) => {
    onLogoutCallbacksRef.current = [...onLogoutCallbacksRef.current, callback];
  };

  const unregisterLogoutCallback = (callback) => {
    onLogoutCallbacksRef.current = onLogoutCallbacksRef.current.filter(
      (cb) => cb !== callback
    );
  };

  // Initialize auth state from localStorage on app start
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          // Set axios default header for future requests
          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${storedToken}`;
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        // Clear corrupted data
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(
        "http://localhost:3001/api/auth/login",
        {
          email,
          password,
        }
      );

      const { user: userData, token: userToken } = response.data;

      // Store in state
      setUser(userData);
      setToken(userToken);

      // Store in localStorage for persistence
      localStorage.setItem("token", userToken);
      localStorage.setItem("user", JSON.stringify(userData));

      axios.defaults.headers.common["Authorization"] = `Bearer ${userToken}`;


      return { success: true, user: userData };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message || "Login failed. Please try again.",
      };
    }
  };

  const register = async (name, username, email, password) => {
    try {
      const response = await axios.post(
        "http://localhost:3001/api/auth/register",
        {
          name,
          username,
          email,
          password,
        }
      );

      const { user: userData, token: userToken } = response.data;

      // Store in state
      setUser(userData);
      setToken(userToken);

      // Store in localStorage for persistence
      localStorage.setItem("token", userToken);
      localStorage.setItem("user", JSON.stringify(userData));

      axios.defaults.headers.common["Authorization"] = `Bearer ${userToken}`;

      return { success: true, user: userData };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Registration failed. Please try again.",
      };
    }
  };

  const logout = () => {
    // Execute all logout callbacks
    onLogoutCallbacksRef.current.forEach((callback) => {
      try {
        callback();
      } catch (error) {
        console.error("Error in logout callback:", error);
      }
    });

    setUser(null);
    setToken(null);

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    delete axios.defaults.headers.common["Authorization"];
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    registerLogoutCallback,
    unregisterLogoutCallback,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
