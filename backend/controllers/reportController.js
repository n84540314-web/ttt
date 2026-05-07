const supabase = require("../config/supabaseClient");

// dashboard stats - admin or member
exports.dashboard = async (req, res) => {
  try {
    const isAdmin = req.userRow && req.userRow.role === "admin";

    if (isAdmin) {
      const { data: projects } = await supabase.from("projects").select("id");
      const { data: tasks } = await supabase.from("tasks").select("status, due_date");
      const { data: members } = await supabase.from("users").select("id").eq("role", "member");

      const now = new Date();
      let pendingReview = 0, verified = 0, rework = 0, overdue = 0;
      (tasks || []).forEach(t => {
        if (t.status === "Pending Review") pendingReview++;
        if (t.status === "Verified Completed") verified++;
        if (t.status === "Needs Rework") rework++;
        if (t.due_date && new Date(t.due_date) < now && t.status !== "Verified Completed") overdue++;
      });

      res.json({
        totalProjects: (projects || []).length,
        totalTasks: (tasks || []).length,
        pendingReview, verified, rework, overdue,
        activeMembers: (members || []).length,
      });
    } else {
      const { data: tasks } = await supabase
        .from("tasks").select("status, due_date").eq("assigned_to", req.user.id);

      const now = new Date();
      let assigned = (tasks || []).length, inProgress = 0, pendingReview = 0,
          verified = 0, rework = 0, upcoming = 0;

      (tasks || []).forEach(t => {
        if (t.status === "In Progress") inProgress++;
        if (t.status === "Pending Review") pendingReview++;
        if (t.status === "Verified Completed") verified++;
        if (t.status === "Needs Rework") rework++;
        if (t.due_date) {
          const d = new Date(t.due_date);
          const diff = (d - now) / (1000 * 60 * 60 * 24);
          if (diff >= 0 && diff <= 3) upcoming++;
        }
      });

      res.json({ assigned, inProgress, pendingReview, verified, rework, upcoming });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "failed" });
  }
};

// member performance report (admin)
exports.performance = async (req, res) => {
  try {
    const { data: members } = await supabase.from("users").select("*").eq("role", "member");
    const result = [];
    for (let i = 0; i < (members || []).length; i++) {
      const m = members[i];
      const { data: tasks } = await supabase
        .from("tasks").select("status, due_date").eq("assigned_to", m.id);
      let completed = 0, pending = 0, delayed = 0;
      const now = new Date();
      (tasks || []).forEach(t => {
        if (t.status === "Verified Completed") completed++;
        else pending++;
        if (t.due_date && new Date(t.due_date) < now && t.status !== "Verified Completed") delayed++;
      });
      result.push({
        id: m.id, name: m.full_name, email: m.email,
        completed, pending, delayed, total: (tasks || []).length,
      });
    }
    res.json({ members: result });
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
};
