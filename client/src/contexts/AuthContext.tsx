//client/src/contexts/AuthContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";
import { login as apiLogin, register as apiRegister } from "../api/auth";
import { User } from "../../../shared/types/user";

type AuthContextType = {
  isAuthenticated: boolean;
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem("accessToken");
    console.log("Initial auth check, token exists:", !!token);
    return !!token;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const userData = localStorage.getItem("userData");
    const parsedUser = userData ? JSON.parse(userData) : null;
    console.log("Initial user data:", parsedUser);
    return parsedUser;
  });

  const login = async (email: string, password: string) => {
    try {
      const response = await apiLogin(email, password);
      console.log("Login response:", response);
      const { accessToken, refreshToken, ...userData } = response;
      setAuthData(accessToken, refreshToken, userData);
    } catch (error: unknown) {
      console.error("Login error:", error);
      resetAuth();
      throw new Error(typeof error === "string" ? error : (error as Error)?.message || "Login failed");
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const response = await apiRegister(email, password);
      console.log("Register response:", response);
      const { accessToken, refreshToken, ...userData } = response;
      setAuthData(accessToken, refreshToken, userData);
    } catch (error: unknown) {
      console.error("Registration error:", error);
      resetAuth();
      throw new Error(typeof error === "string" ? error : (error as Error)?.message || "Registration failed");
    }
  };

  const logout = () => {
    console.log("Logging out");
    resetAuth();
    window.location.reload();
  };

  const resetAuth = () => {
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userData");
    setCurrentUser(null);
    setIsAuthenticated(false);
    console.log("Auth reset completed");
  };

  const setAuthData = (accessToken: string, refreshToken: string, userData: User) => {
    if (accessToken && refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("userData", JSON.stringify(userData));
      setCurrentUser(userData);
      setIsAuthenticated(true);
      console.log("Auth data set, user:", userData);
    } else {
      throw new Error("Neither refreshToken nor accessToken was returned.");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}