import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "unclaimedProjects";
const SESSION_TOKEN_KEY = "projectSessionToken";
const SESSION_EXPIRY_KEY = "projectSessionExpiry";

// Get or create a session token from the server
export const getOrCreateSessionToken = async (): Promise<string> => {
  try {
    const storedToken = localStorage.getItem(SESSION_TOKEN_KEY);
    const storedExpiry = localStorage.getItem(SESSION_EXPIRY_KEY);
    
    // Check if we have a valid token
    if (storedToken && storedExpiry) {
      const expiryDate = new Date(storedExpiry);
      if (expiryDate > new Date()) {
        return storedToken;
      }
    }
    
    // Request new session token from server
    const { data, error } = await supabase.functions.invoke('create-session', {
      method: 'POST'
    });
    
    if (error) {
      console.error("Error creating session:", error);
      // No fallback — return null and let the caller handle it.
      // A client-generated UUID would fail RLS because it's not in
      // anonymous_sessions.
      return null;
    }
    
    const { token, expiresAt } = data;
    localStorage.setItem(SESSION_TOKEN_KEY, token);
    localStorage.setItem(SESSION_EXPIRY_KEY, expiresAt);
    
    return token;
  } catch (error) {
    console.error("Error managing session token:", error);
    return null;
  }
};

// Clear session token (called after claiming projects)
export const clearSessionToken = () => {
  try {
    localStorage.removeItem(SESSION_TOKEN_KEY);
    localStorage.removeItem(SESSION_EXPIRY_KEY);
  } catch (error) {
    console.error("Error clearing session token:", error);
  }
};

export const saveUnclaimedProject = (projectId: string) => {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    const projects = existing ? JSON.parse(existing) : [];
    
    if (!projects.includes(projectId)) {
      projects.push(projectId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    }
  } catch (error) {
    console.error("Error saving unclaimed project:", error);
  }
};

export const claimUnclaimedProjects = async (userId: string) => {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) return;

    const projectIds: string[] = JSON.parse(existing);
    if (projectIds.length === 0) return;

    const sessionToken = localStorage.getItem(SESSION_TOKEN_KEY);

    // Update all unclaimed projects to belong to this user
    // Only claim projects that have the matching session token
    const { error } = await supabase
      .from("projects")
      .update({ user_id: userId })
      .in("id", projectIds)
      .is("user_id", null)
      .eq("session_token", sessionToken);

    if (error) throw error;

    // Clear localStorage after successful claim
    localStorage.removeItem(STORAGE_KEY);
    clearSessionToken();
    
    return projectIds.length;
  } catch (error) {
    console.error("Error claiming unclaimed projects:", error);
    return 0;
  }
};
