import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { dataStore } from "@/lib/store";
import { api, setAuthToken } from "@/lib/api";
import type { Profile } from "@/types/database";
import type { Role } from "@/lib/constants";
import { MOCK_PROFILES } from "@/lib/mockData";

interface AuthContextType {
  session: Session | null;
  user: User | null;
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

const LOCAL_STORAGE_MOCK_KEY = "eduflow_mock_auth_profile_id";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Live Supabase profile fetcher
  const fetchProfile = useCallback(async (userId: string) => {
    if (!isSupabaseConfigured) {
      return MOCK_PROFILES[userId] || null;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching live profile:", error);
        return null;
      }
      return data as Profile;
    } catch (err) {
      console.error("Network exception fetching profile:", err);
      return null;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const profileData = await fetchProfile(user.id);
    if (profileData) {
      setProfile(profileData);
    }
  }, [user, fetchProfile]);

  // Direct login as a designated role for quick testing/demo
  const loginAsRole = useCallback(async (targetRole: Role, customProfile?: Partial<Profile>) => {
    let matchedProfile: Profile | undefined;

    if (customProfile && customProfile.email) {
      matchedProfile = Object.values(MOCK_PROFILES).find(
        (p) => p.email?.toLowerCase() === customProfile.email!.toLowerCase()
      );
      if (!matchedProfile) {
        matchedProfile = {
          id: customProfile.id || `prof-${customProfile.email}`,
          full_name: customProfile.full_name || "User",
          email: customProfile.email,
          phone: customProfile.phone || null,
          avatar_url: null,
          role: targetRole,
          status: "active",
          last_login: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        MOCK_PROFILES[matchedProfile.id] = matchedProfile;
      }
    } else {
      matchedProfile = Object.values(MOCK_PROFILES).find(
        (p) => p.role === targetRole
      );
    }

    if (!matchedProfile) {
      const fallbackEmail =
        customProfile?.email ||
        (targetRole === "admin"
          ? "admin@codextechnology.com"
          : targetRole === "faculty"
          ? "faculty@codex.com"
          : targetRole === "executor"
          ? "dsapkal141@gmail.com"
          : "student@codextechnology.com");

      matchedProfile = {
        id: customProfile?.id || `${targetRole}-prof-${Date.now()}`,
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
      MOCK_PROFILES[matchedProfile.id] = matchedProfile;
    }

    localStorage.setItem(LOCAL_STORAGE_MOCK_KEY, matchedProfile.id);
    localStorage.setItem("eduflow_user_profile", JSON.stringify(matchedProfile));

    const mockUser: User = {
      id: matchedProfile.id,
      app_metadata: {},
      user_metadata: { full_name: matchedProfile.full_name, role: matchedProfile.role },
      aud: "authenticated",
      created_at: matchedProfile.created_at,
      email: matchedProfile.email,
      phone: matchedProfile.phone ?? undefined,
      confirmed_at: matchedProfile.created_at,
    };

    const mockSession: Session = {
      access_token: "mock-jwt-token",
      refresh_token: "mock-refresh-token",
      expires_in: 3600,
      token_type: "bearer",
      user: mockUser,
    };

    setUser(mockUser);
    setSession(mockSession);
    setProfile(matchedProfile);
  }, []);

  useEffect(() => {
    // 1. First check if there is a Spring Boot JWT token in localStorage
    const springToken = localStorage.getItem("eduflow_jwt_token");
    if (springToken) {
      try {
        const savedProfileStr = localStorage.getItem("eduflow_user_profile");
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
          console.warn("Non-JWT token format or parse error:", e);
        }

        const userRole = claims?.role
          ? (claims.role.replace("ROLE_", "").toLowerCase() as Role)
          : savedProfile?.role || "student";
        const email = claims?.sub || savedProfile?.email || "user@eduflow.com";
        const fullName = savedProfile?.full_name || (email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1));

        const springProfile: Profile = {
          id: savedProfile?.id || email,
          full_name: fullName,
          email: email,
          phone: savedProfile?.phone || null,
          avatar_url: null,
          role: userRole,
          status: "active",
          last_login: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const springUser: User = {
          id: springProfile.id,
          app_metadata: {},
          user_metadata: { full_name: springProfile.full_name, role: userRole },
          aud: "authenticated",
          created_at: new Date().toISOString(),
          email: email,
          confirmed_at: new Date().toISOString(),
        };

        const springSession: Session = {
          access_token: springToken,
          refresh_token: "spring-refresh-token",
          expires_in: 3600,
          token_type: "bearer",
          user: springUser,
        };

        setProfile(springProfile);
        setUser(springUser);
        setSession(springSession);
        setLoading(false);
        return;
      } catch (e) {
        console.error("Failed to restore Spring Boot session:", e);
      }
    }

    if (!isSupabaseConfigured) {
      // Restore session from localStorage if present
      const savedProfileId = localStorage.getItem(LOCAL_STORAGE_MOCK_KEY);
      let p = savedProfileId ? MOCK_PROFILES[savedProfileId] : null;

      if (!p) {
        try {
          const savedProfileStr = localStorage.getItem("eduflow_user_profile");
          if (savedProfileStr) {
            p = JSON.parse(savedProfileStr);
            if (p && p.id) {
              MOCK_PROFILES[p.id] = p;
            }
          }
        } catch (e) {
          console.error("Failed to restore profile from localStorage:", e);
        }
      }

      if (p) {
        const mockUser: User = {
          id: p.id,
          app_metadata: {},
          user_metadata: { full_name: p.full_name, role: p.role },
          aud: "authenticated",
          created_at: p.created_at,
          email: p.email,
          phone: p.phone ?? undefined,
          confirmed_at: p.created_at,
        };
        setUser(mockUser);
        setSession({
          access_token: "mock-jwt-token",
          refresh_token: "mock-refresh-token",
          expires_in: 3600,
          token_type: "bearer",
          user: mockUser,
        });
        setProfile(p);
      }
      setLoading(false);
      return;
    }

    // Live Supabase mode
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user ?? null);

      if (initialSession?.user) {
        fetchProfile(initialSession.user.id).then((profileData) => {
          setProfile(profileData);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        const profileData = await fetchProfile(newSession.user.id);
        setProfile(profileData);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: Role = "student",
    extras?: { phone?: string; interestedCourse?: string; education?: string; city?: string }
  ) => {
    // Try Spring Boot REST API Backend First
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
      const newId = springRes.data.profileId;
      const newProfile: Profile = {
        id: newId,
        full_name: springRes.data.fullName,
        email: springRes.data.email,
        phone: springRes.data.phone || null,
        avatar_url: null,
        role: (springRes.data.role.toLowerCase() as Role) || "student",
        status: "active",
        last_login: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      MOCK_PROFILES[newId] = newProfile;

      // BUG-008: Also create student record & lead in local store
      // so Admin > Student Leads section shows the newly registered student
      if (role === "student") {
        const { MOCK_STUDENTS } = await import("@/lib/mockData");
        const studentRecId = `stu-${Date.now()}`;
        MOCK_STUDENTS.push({
          id: studentRecId,
          profile_id: newId,
          student_id: `STU-${Math.floor(1000 + Math.random() * 9000)}`,
          assigned_executor_id: null,
          assigned_faculty_id: null,
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        dataStore.createStudentLead({
          student_id: studentRecId,
          profile_id: newId,
          interested_course: extras?.interestedCourse || null,
          education: extras?.education || null,
          city: extras?.city || null,
          status: "new",
          assigned_executor_id: null,
          followup_date: null,
          notes: null,
        });
      }

      return { error: null };
    }

    if (!isSupabaseConfigured) {
      // Mock signup fallback
      const newId = `student-${Date.now()}`;
      const newProfile: Profile = {
        id: newId,
        full_name: fullName,
        email,
        phone: extras?.phone || null,
        avatar_url: null,
        role,
        status: "active",
        last_login: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      MOCK_PROFILES[newId] = newProfile;

      // Create student record in mock
      if (role === "student") {
        const { MOCK_STUDENTS } = await import("@/lib/mockData");
        const studentRecId = `stu-${Date.now()}`;
        MOCK_STUDENTS.push({
          id: studentRecId,
          profile_id: newId,
          student_id: `STU-${Math.floor(1000 + Math.random() * 9000)}`,
          assigned_executor_id: null,
          assigned_faculty_id: null,
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        // Create student lead
        dataStore.createStudentLead({
          student_id: studentRecId,
          profile_id: newId,
          interested_course: extras?.interestedCourse || null,
          education: extras?.education || null,
          city: extras?.city || null,
          status: "new",
          assigned_executor_id: null,
          followup_date: null,
          notes: null,
        });
      }

      return { error: null };
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
          phone: extras?.phone,
          interested_course: extras?.interestedCourse,
          education: extras?.education,
          city: extras?.city,
        },
      },
    });
    return { error: error ? new Error(error.message) : null };
  };

  const signIn = async (email: string, password: string) => {
    // Try Spring Boot REST API Backend First
    const springRes = await api.login({ email, password });
    
    // Check for token and user payload in both top-level and nested data property
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
      
      const springUser: User = {
        id: springProfile.id,
        app_metadata: {},
        user_metadata: { full_name: springProfile.full_name, role: userRole },
        aud: "authenticated",
        created_at: new Date().toISOString(),
        email: springProfile.email,
        confirmed_at: new Date().toISOString(),
      };

      const springSession: Session = {
        access_token: token,
        refresh_token: "spring-refresh-token",
        expires_in: 3600,
        token_type: "bearer",
        user: springUser,
      };

      localStorage.setItem("eduflow_jwt_token", token);
      localStorage.setItem("eduflow_user_profile", JSON.stringify(springProfile));

      setProfile(springProfile);
      setUser(springUser);
      setSession(springSession);

      return { error: null, role: userRole };
    }

    // If Spring Boot server returned an error (e.g. 401 Unauthorized, Bad credentials)
    if (springRes.error && !springRes.error.includes("Unable to connect")) {
      return { error: new Error(springRes.error) };
    }

    if (!isSupabaseConfigured) {
      // Look up mock profile by email
      const matched = Object.values(MOCK_PROFILES).find(
        (p) => p.email?.toLowerCase() === email.toLowerCase()
      );

      let detectedRole: Role = "student";
      const cleanEmail = email.toLowerCase();
      if (cleanEmail.includes("admin")) detectedRole = "admin";
      else if (cleanEmail.includes("faculty")) detectedRole = "faculty";
      else if (cleanEmail.includes("executor") || cleanEmail.includes("dsapkal")) detectedRole = "executor";

      const targetRole = matched ? (matched.role as Role) : detectedRole;

      const profileToUse: Partial<Profile> = matched || {
        id: `prof-${email}`,
        email: email,
        full_name: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
        role: targetRole,
      };

      await loginAsRole(targetRole, profileToUse);
      return { error: null, role: targetRole };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: new Error(error.message) };
      }

      if (data?.user) {
        await (supabase.from("profiles") as any)
          .update({ last_login: new Date().toISOString() })
          .eq("id", data.user.id);

        const prof = await fetchProfile(data.user.id);
        return { error: null, role: prof?.role as Role };
      }

      return { error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to connect to authentication server";
      return { error: new Error(message) };
    }
  };

  const signOut = async () => {
    localStorage.removeItem(LOCAL_STORAGE_MOCK_KEY);
    localStorage.removeItem("eduflow_jwt_token");
    localStorage.removeItem("eduflow_user_profile");

    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn("Sign out network error ignored in clean cleanup:", e);
      }
    }

    setSession(null);
    setUser(null);
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    if (!isSupabaseConfigured) {
      return { error: null };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error ? new Error(error.message) : null };
  };

  const updatePassword = async (password: string) => {
    if (!isSupabaseConfigured) {
      return { error: null };
    }
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error ? new Error(error.message) : null };
  };

  const updateProfile = async (data: { full_name?: string; phone?: string }) => {
    if (!profile) return { error: new Error("No active profile to update") };

    const updatedProfile: Profile = {
      ...profile,
      ...(data.full_name !== undefined ? { full_name: data.full_name } : {}),
      ...(data.phone !== undefined ? { phone: data.phone } : {}),
      updated_at: new Date().toISOString(),
    };

    // Update state
    setProfile(updatedProfile);

    // Update user metadata
    if (user) {
      setUser({
        ...user,
        user_metadata: { ...user.user_metadata, full_name: updatedProfile.full_name },
        phone: updatedProfile.phone ?? undefined,
      });
    }

    // Persist to localStorage
    try {
      localStorage.setItem("eduflow_user_profile", JSON.stringify(updatedProfile));
    } catch (e) {
      console.warn("Could not save updated profile to localStorage", e);
    }

    // Update Mock store / memory if in mock mode
    if (MOCK_PROFILES[profile.id]) {
      MOCK_PROFILES[profile.id] = { ...MOCK_PROFILES[profile.id], ...updatedProfile };
    }

    // Supabase update if configured
    if (isSupabaseConfigured) {
      try {
        await (supabase.from("profiles") as any)
          .update({
            full_name: updatedProfile.full_name,
            phone: updatedProfile.phone,
            updated_at: updatedProfile.updated_at,
          })
          .eq("id", profile.id);
      } catch (err) {
        console.warn("Supabase profile sync error:", err);
      }
    }

    return { error: null };
  };

  const computedRole = (() => {
    const raw = profile?.role || user?.user_metadata?.role || (() => {
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
    isMockMode: !isSupabaseConfigured,
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
      isMockMode: true,
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
