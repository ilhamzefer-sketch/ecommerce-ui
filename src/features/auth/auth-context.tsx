import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { getCurrentUser } from "../account/account-api";
import { normalizeRoles, type UserProfileResponse } from "../account/account-types";
import * as authApi from "./auth-api";
import type { AuthResponse, LoginRequest } from "./auth-types";
import { AuthContext, type AuthContextValue, type AuthSession, type AuthStatus, type LogoutMode } from "./auth-context-value";

const emptySession: AuthSession = {
  accessToken: null
};

function sessionFromResponse(response: AuthResponse): AuthSession {
  return {
    accessToken: response.accessToken ?? null,
    accessTokenExpiresAt: response.accessTokenExpiresAt,
    refreshTokenExpiresAt: response.refreshTokenExpiresAt,
    tokenType: response.tokenType,
    message: response.message
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("booting");
  const [session, setSession] = useState<AuthSession>(emptySession);
  const [user, setUser] = useState<UserProfileResponse | null>(null);

  const clearSession = useCallback(() => {
    setSession(emptySession);
    setUser(null);
    setStatus("anonymous");
  }, []);

  const loadUser = useCallback(async (accessToken: string) => {
    const profile = await getCurrentUser(accessToken);
    setUser(profile);
  }, []);

  const applyAuthResponse = useCallback(
    async (response: AuthResponse) => {
      const nextSession = sessionFromResponse(response);
      if (!nextSession.accessToken) {
        clearSession();
        return;
      }

      setSession(nextSession);
      await loadUser(nextSession.accessToken);
      setStatus("authenticated");
    },
    [clearSession, loadUser]
  );

  const refresh = useCallback(async () => {
    const response = await authApi.refreshSession();
    await applyAuthResponse(response);
  }, [applyAuthResponse]);

  const login = useCallback(
    async (request: LoginRequest) => {
      const response = await authApi.login(request);
      await applyAuthResponse(response);
    },
    [applyAuthResponse]
  );

  const reloadUser = useCallback(async () => {
    if (!session.accessToken) {
      clearSession();
      return;
    }

    await loadUser(session.accessToken);
  }, [clearSession, loadUser, session.accessToken]);

  const logout = useCallback(
    async (mode: LogoutMode = "current") => {
      let warning: string | undefined;

      try {
        if (mode === "all") {
          await authApi.logoutAll();
        } else {
          await authApi.logout();
        }
      } catch {
        warning =
          "Backend çıxış sorğusunu təsdiqləmədi. Bu brauzerdə sessiya təhlükəsiz şəkildə təmizləndi.";
      } finally {
        clearSession();
      }

      return warning;
    },
    [clearSession]
  );

  useEffect(() => {
    let isMounted = true;

    authApi
      .refreshSession()
      .then(async (response) => {
        if (!isMounted) {
          return;
        }
        await applyAuthResponse(response);
      })
      .catch(() => {
        if (isMounted) {
          clearSession();
        }
      });

    return () => {
      isMounted = false;
    };
  }, [applyAuthResponse, clearSession]);

  const roles = useMemo(() => normalizeRoles(user?.roles), [user?.roles]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      session,
      user,
      roles,
      login,
      refresh,
      reloadUser,
      clearSession,
      logout
    }),
    [clearSession, login, logout, refresh, reloadUser, roles, session, status, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
