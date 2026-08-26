import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { api, setAuthToken, removeAuthToken } from "@/lib/api";
import type { Profile } from "@/types/database";
import type { Role } from "@/lib/constants";

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
}

export interface UserSession {
  access_token: string;
  token_type: string;
  user: SessionUser;
}

interface AuthContextType {
  session: UserSession | null;
  user: SessionUser | null;
  profile: Profile | null;
  role: Role | null;
  loading: boolean;
  isMockMode: boolean;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role?: Role,
    extras?: { phone?: string; interestedCourse?: string; education?: string; city?: string }
  ) => Promise<{ error: Error | null }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: Error | null; role?: Role }>;
  loginAsRole: (role: Role, customProfile?: Partial<Profile>) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  updateProfile: (data: { full_name?: string; phone?: string }) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<UserSession | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on initial load
  useEffect(() => {
    const springToken = localStorage.getItem("eduflow_jwt_token");
    const savedProfileStr = localStorage.getItem("eduflow_user_profile");

    if (springToken) {
      try {
        const savedProfile = savedProfileStr ? JSON.parse(savedProfileStr) : null;
        let claims: any = null;
        try {
          const base64Url = springToken.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const jsonPayload = decodeURIComponent(
            window
              .atob(base64)
              .split("")
              .map(function (c) {
                return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
              })
              .join("")
          );
          claims = JSON.parse(jsonPayload);
        } catch (e) {
          // Token claims parsing fallback
        }

        const rawRole = claims?.role || savedProfile?.role || "STUDENT";
        const userRole = (rawRole.toString().replace("ROLE_", "").toLowerCase() as Role) || "student";
        const email = claims?.sub || savedProfile?.email || "user@eduflow.com";
        const fullName = savedProfile?.full_name || (email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1));
        const profileId = savedProfile?.id || claims?.profileId || email;

        const activeProfile: Profile = {
          id: profileId,
          full_name: fullName,
          email: email,
          phone: savedProfile?.phone || null,
          avatar_url: null,
          role: userRole,
          status: "active",
          last_login: new Date().toISOString(),
          created_at: savedProfile?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const activeUser: SessionUser = {
          id: profileId,
          email: email,
          fullName: fullName,
          role: userRole,
        };

        const activeSession: UserSession = {
          access_token: springToken,
          token_type: "Bearer",
          user: activeUser,
        };

        setProfile(activeProfile);
        setUser(activeUser);
        setSession(activeSession);
      } catch (e) {
        console.error("Failed to restore authentication session:", e);
      }
    }
    setLoading(false);
  }, []);

  const refreshProfile = useCallback(async () => {
    const savedProfileStr = localStorage.getItem("eduflow_user_profile");
    if (savedProfileStr) {
      try {
        setProfile(JSON.parse(savedProfileStr));
      } catch (e) {
        console.warn("Error refreshing profile:", e);
      }
    }
  }, []);

  const loginAsRole = useCallback(async (targetRole: Role, customProfile?: Partial<Profile>) => {
    const fallbackEmail =
      customProfile?.email ||
      (targetRole === "admin"
        ? "admin@gmail.com"
        : targetRole === "faculty"
        ? "faculty@codex.com"
        : targetRole === "executor"
        ? "dsapkal141@gmail.com"
        : "student@codextechnology.com");

    const matchedProfile: Profile = {
      id: customProfile?.id || `prof-${targetRole}-${Date.now()}`,
      full_name: customProfile?.full_name || (targetRole.charAt(0).toUpperCase() + targetRole.slice(1) + " User"),
      email: fallbackEmail,
      phone: customProfile?.phone || "9876543210",
      avatar_url: null,
      role: targetRole,
      status: "active",
      last_login: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const sessionUser: SessionUser = {
      id: matchedProfile.id,
      email: matchedProfile.email,
      fullName: matchedProfile.full_name,
      role: targetRole,
    };

    const sessionObj: UserSession = {
      access_token: "mock-jwt-token",
      token_type: "Bearer",
      user: sessionUser,
    };

    localStorage.setItem("eduflow_jwt_token", sessionObj.access_token);
    localStorage.setItem("eduflow_user_profile", JSON.stringify(matchedProfile));

    setUser(sessionUser);
    setSession(sessionObj);
    setProfile(matchedProfile);
  }, []);

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: Role = "student",
    extras?: { phone?: string; interestedCourse?: string; education?: string; city?: string }
  ) => {
    const springRes = await api.registerStudent({
      fullName,
      email,
      phone: extras?.phone || "",
      password,
      interestedCourse: extras?.interestedCourse,
      education: extras?.education,
      city: extras?.city,
    });

    if (springRes.success && springRes.data) {
      return { error: null };
    }

    if (springRes.error) {
      return { error: new Error(springRes.error) };
    }

    return { error: new Error("Registration failed") };
  };

  const signIn = async (email: string, password: string) => {
    const springRes = await api.login({ email, password });
    
    const token = (springRes as any).token || springRes.data?.token;
    const userData = (springRes as any).user || springRes.data?.user;

    if ((springRes.success || token) && token && userData) {
      setAuthToken(token);
      const rawRole = (userData.role || "STUDENT").toString();
      const userRole = (rawRole.replace("ROLE_", "").toLowerCase() as Role) || "student";

      const springProfile: Profile = {
        id: userData.profileId || userData.id || email,
        full_name: userData.fullName || userData.name || email.split("@")[0],
        email: userData.email || email,
        phone: userData.phone || null,
        avatar_url: null,
        role: userRole,
        status: "active",
        last_login: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const springUser: SessionUser = {
        id: springProfile.id,
        email: springProfile.email,
        fullName: springProfile.full_name,
        role: userRole,
      };

      const springSession: UserSession = {
        access_token: token,
        token_type: "Bearer",
        user: springUser,
      };

      localStorage.setItem("eduflow_jwt_token", token);
      localStorage.setItem("eduflow_user_profile", JSON.stringify(springProfile));

      setProfile(springProfile);
      setUser(springUser);
      setSession(springSession);

      return { error: null, role: userRole };
    }

    if (springRes.error) {
      return { error: new Error(springRes.error) };
    }

    return { error: new Error("Invalid email or password") };
  };

  const signOut = async () => {
    removeAuthToken();
    localStorage.removeItem("eduflow_mock_auth_profile_id");
    localStorage.removeItem("eduflow_user_profile");
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  const resetPassword = async (_email: string) => {
    return { error: new Error("Password reset via email is managed through system admin.") };
  };

  const updatePassword = async (_password: string) => {
    return { error: new Error("Password update is managed through user profile settings.") };
  };

  const updateProfile = async (data: { full_name?: string; phone?: string }) => {
    if (!profile) return { error: new Error("No active profile to update") };

    const updatedProfile: Profile = {
      ...profile,
      ...(data.full_name !== undefined ? { full_name: data.full_name } : {}),
      ...(data.phone !== undefined ? { phone: data.phone } : {}),
      updated_at: new Date().toISOString(),
    };

    setProfile(updatedProfile);

    if (user) {
      setUser({
        ...user,
        fullName: updatedProfile.full_name,
      });
    }

    try {
      localStorage.setItem("eduflow_user_profile", JSON.stringify(updatedProfile));
    } catch (e) {
      console.warn("Could not save updated profile to localStorage", e);
    }

    return { error: null };
  };

  const computedRole = (() => {
    const raw = profile?.role || user?.role || (() => {
      try { return JSON.parse(localStorage.getItem("eduflow_user_profile") || "{}")?.role; } catch { return null; }
    })();
    if (!raw) return session ? ("student" as Role) : null;
    const clean = raw.toString().toLowerCase().replace(/^role_/, "").trim();
    if (clean === "admin" || clean === "faculty" || clean === "executor" || clean === "student") {
      return clean as Role;
    }
    return session ? ("student" as Role) : null;
  })();

  const value: AuthContextType = {
    session,
    user,
    profile,
    role: computedRole,
    loading,
    isMockMode: false,
    signUp,
    signIn,
    loginAsRole,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    return {
      session: null,
      user: null,
      profile: null,
      role: null,
      loading: true,
      isMockMode: false,
      signUp: async () => ({ error: null }),
      signIn: async () => ({ error: null }),
      loginAsRole: async () => { },
      signOut: async () => { },
      resetPassword: async () => ({ error: null }),
      updatePassword: async () => ({ error: null }),
      updateProfile: async () => ({ error: null }),
      refreshProfile: async () => { },
    };
  }
  return context;
}
