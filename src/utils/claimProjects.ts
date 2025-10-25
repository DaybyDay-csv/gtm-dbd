import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "unclaimedProjects";

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

    // Update all unclaimed projects to belong to this user
    const { error } = await supabase
      .from("projects")
      .update({ user_id: userId })
      .in("id", projectIds)
      .is("user_id", null);

    if (error) throw error;

    // Clear localStorage after successful claim
    localStorage.removeItem(STORAGE_KEY);
    
    return projectIds.length;
  } catch (error) {
    console.error("Error claiming unclaimed projects:", error);
    return 0;
  }
};
