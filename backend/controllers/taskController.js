const supabase = require("../config/supabaseClient");
const { isOverdue } = require("../utils/helpers");

async function logActivity(userId, action, taskId, projectId) {
  await supabase.from("activity_logs").insert([{
    user_id: userId, action: action,
    task_id: taskId || null, project_id: projectId || null,
  }]);
}

async function notify(userId, message) {
  await supabase.from("notifications").insert([{
    user_id: userId, message: message, is_read: false,
  }]);
}

// list tasks (filter by project, by user, etc)
exports.list = async (req, res) => {
  try {
    const { projectId, status, priority, mine } = req.query;
    let q = supabase.from("tasks").select("*, projects(name), users:assigned_to(full_name)");
    if (projectId) q = q.eq("project_id", projectId);
    if (status) q = q.eq("status", status);
    if (priority) q = q.eq("priority", priority);

    if (mine === "1" || (req.userRow && req.userRow.role === "member")) {
      q = q.eq("assigned_to", req.user.id);
    }

    const { data, error } = await q.order("created_at", { ascending: false });
    if (error) return res.status(400).json({ error: error.message });

    // mark overdue
    const now = new Date();
    for (let i = 0; i < data.length; i++) {
      const t = data[i];
      if (t.due_date && new Date(t.due_date) < now &&
          t.status !== "Verified Completed" && t.status !== "Pending Review") {
        t.is_overdue = true;
        if (t.status !== "Overdue") {
          await supabase.from("tasks").update({ status: "Overdue" }).eq("id", t.id);
          t.status = "Overdue";
        }
      } else {
        t.is_overdue = false;
      }
    }

    res.json({ tasks: data });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "failed" });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, dueDate, priority } = req.body;
    if (!title || !projectId) {
      return res.status(400).json({ error: "title and project required" });
    }

    const { data, error } = await supabase.from("tasks").insert([{
      title: title,
      description: description || "",
      project_id: projectId,
      assigned_to: assignedTo || null,
      due_date: dueDate || null,
      priority: priority || "Medium",
      status: "Not Started",
      created_by: req.user.id,
    }]).select().single();

    if (error) return res.status(400).json({ error: error.message });

    await logActivity(req.user.id, "Created task: " + title, data.id, projectId);
    if (assignedTo) {
      await notify(assignedTo, "New task assigned: " + title);
    }

    res.json({ task: data });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "failed" });
  }
};

exports.getOne = async (req, res) => {
  try {
    const id = req.params.id;
    const { data: task, error } = await supabase
      .from("tasks").select("*, projects(name), users:assigned_to(full_name, email)")
      .eq("id", id).single();
    if (error) return res.status(404).json({ error: "not found" });

    const { data: notes } = await supabase
      .from("progress_notes")
      .select("*, users(full_name)")
      .eq("task_id", id)
      .order("created_at", { ascending: true });

    const { data: reviews } = await supabase
      .from("task_reviews")
      .select("*, users(full_name)")
      .eq("task_id", id)
      .order("created_at", { ascending: true });

    res.json({ task, notes: notes || [], reviews: reviews || [] });
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const { title, description, assignedTo, dueDate, priority, status } = req.body;
    const u = {};
    if (title) u.title = title;
    if (description !== undefined) u.description = description;
    if (assignedTo) u.assigned_to = assignedTo;
    if (dueDate) u.due_date = dueDate;
    if (priority) u.priority = priority;
    if (status) u.status = status;

    const { data, error } = await supabase
      .from("tasks").update(u).eq("id", id).select().single();
    if (error) return res.status(400).json({ error: error.message });

    await logActivity(req.user.id, "Updated task: " + data.title, id, data.project_id);
    res.json({ task: data });
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
};

exports.remove = async (req, res) => {
  try {
    const id = req.params.id;
    await supabase.from("progress_notes").delete().eq("task_id", id);
    await supabase.from("task_reviews").delete().eq("task_id", id);
    await supabase.from("tasks").delete().eq("id", id);
    res.json({ message: "deleted" });
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
};

// member submits work -> Pending Review
exports.submit = async (req, res) => {
  try {
    const id = req.params.id;
    const { comment } = req.body;
    const { data, error } = await supabase
      .from("tasks").update({ status: "Pending Review" })
      .eq("id", id).select().single();
    if (error) return res.status(400).json({ error: error.message });

    if (comment) {
      await supabase.from("progress_notes").insert([{
        task_id: id, user_id: req.user.id, note: comment,
      }]);
    }

    await logActivity(req.user.id, "Submitted task for review: " + data.title, id, data.project_id);

    // notify project admin
    const { data: project } = await supabase
      .from("projects").select("created_by").eq("id", data.project_id).single();
    if (project && project.created_by) {
      await notify(project.created_by, "Task submitted for review: " + data.title);
    }

    res.json({ task: data });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "failed" });
  }
};

// add progress note / comment
exports.addNote = async (req, res) => {
  try {
    const id = req.params.id;
    const { note } = req.body;
    if (!note) return res.status(400).json({ error: "note required" });
    const { data, error } = await supabase.from("progress_notes").insert([{
      task_id: id, user_id: req.user.id, note: note,
    }]).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.json({ note: data });
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
};
