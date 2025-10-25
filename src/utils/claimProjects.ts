import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "unclaimedProjects";
const SESSION_TOKEN_KEY = "projectSessionToken";

// Generate a unique session token for unauthenticated project access
export const generateSessionToken = (): string => {
  return crypto.randomUUID();
};

// Get the current session token, or generate a new one if it doesn't exist
export const getOrCreateSessionToken = (): string => {
  try {
    let token = localStorage.getItem(SESSION_TOKEN_KEY);
    if (!token) {
      token = generateSessionToken();
      localStorage.setItem(SESSION_TOKEN_KEY, token);
    }
    return token;
  } catch (error) {
    console.error("Error managing session token:", error);
    return generateSessionToken();
  }
};

// Clear session token (called after claiming projects)
export const clearSessionToken = () => {
  try {
    localStorage.removeItem(SESSION_TOKEN_KEY);
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
