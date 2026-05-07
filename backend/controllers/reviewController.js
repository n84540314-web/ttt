const supabase = require("../config/supabaseClient");

async function notify(userId, message) {
  await supabase.from("notifications").insert([{
    user_id: userId, message: message, is_read: false,
  }]);
}

async function logActivity(userId, action, taskId, projectId) {
  await supabase.from("activity_logs").insert([{
    user_id: userId, action: action, task_id: taskId, project_id: projectId,
  }]);
}

// list tasks waiting for review
exports.pending = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .select("*, projects(name), users:assigned_to(full_name)")
      .eq("status", "Pending Review")
      .order("created_at", { ascending: false });
    if (error) return res.status(400).json({ error: error.message });
    res.json({ tasks: data });
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
};

// approve task
exports.approve = async (req, res) => {
  try {
    const id = req.params.id;
    const { comment } = req.body;
    const { data, error } = await supabase
      .from("tasks").update({ status: "Verified Completed" })
      .eq("id", id).select().single();
    if (error) return res.status(400).json({ error: error.message });

    await supabase.from("task_reviews").insert([{
      task_id: id, user_id: req.user.id,
      action: "approved", comment: comment || "Task approved",
    }]);

    await logActivity(req.user.id, "Approved task: " + data.title, id, data.project_id);
    if (data.assigned_to) {
      await notify(data.assigned_to, "Your task has been approved: " + data.title);
    }
    res.json({ task: data });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "failed" });
  }
};

// request rework
exports.rework = async (req, res) => {
  try {
    const id = req.params.id;
    const { comment } = req.body;
    if (!comment) return res.status(400).json({ error: "feedback comment required" });

    const { data, error } = await supabase
      .from("tasks").update({ status: "Needs Rework" })
      .eq("id", id).select().single();
    if (error) return res.status(400).json({ error: error.message });

    await supabase.from("task_reviews").insert([{
      task_id: id, user_id: req.user.id,
      action: "rework", comment: comment,
    }]);

    await logActivity(req.user.id, "Requested rework: " + data.title, id, data.project_id);
    if (data.assigned_to) {
      await notify(data.assigned_to, "Rework requested for task: " + data.title);
    }
    res.json({ task: data });
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
};
