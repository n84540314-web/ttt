const supabase = require("../config/supabaseClient");
const { calcCompletion } = require("../utils/helpers");

// list all projects (admin sees all, member sees only ones they belong to)
exports.list = async (req, res) => {
  try {
    let query = supabase.from("projects").select("*").order("created_at", { ascending: false });
    const { data, error } = await query;
    if (error) return res.status(400).json({ error: error.message });

    // for each project compute completion
    const result = [];
    for (let i = 0; i < data.length; i++) {
      const p = data[i];
      const { data: tasks } = await supabase
        .from("tasks")
        .select("status")
        .eq("project_id", p.id);
      p.completion = calcCompletion(tasks || []);
      p.task_count = (tasks || []).length;

      // if member, only include if they are part
      if (req.userRow && req.userRow.role === "member") {
        const { data: pm } = await supabase
          .from("project_members")
          .select("*")
          .eq("project_id", p.id)
          .eq("user_id", req.user.id);
        if (pm && pm.length > 0) result.push(p);
      } else {
        result.push(p);
      }
    }

    res.json({ projects: result });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "failed" });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, description, startDate, deadline } = req.body;
    if (!name) return res.status(400).json({ error: "project name required" });

    const { data, error } = await supabase.from("projects").insert([{
      name: name,
      description: description || "",
      start_date: startDate || null,
      deadline: deadline || null,
      status: "Not Started",
      created_by: req.user.id,
    }]).select().single();

    if (error) return res.status(400).json({ error: error.message });

    // log activity
    await supabase.from("activity_logs").insert([{
      user_id: req.user.id,
      action: "Created project: " + name,
      project_id: data.id,
    }]);

    res.json({ project: data });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "failed" });
  }
};

exports.getOne = async (req, res) => {
  try {
    const id = req.params.id;
    const { data: project, error } = await supabase
      .from("projects").select("*").eq("id", id).single();
    if (error) return res.status(404).json({ error: "not found" });

    const { data: tasks } = await supabase.from("tasks").select("*").eq("project_id", id);
    const { data: members } = await supabase
      .from("project_members")
      .select("user_id, users(full_name, email, role)")
      .eq("project_id", id);

    project.completion = calcCompletion(tasks || []);
    res.json({ project, tasks: tasks || [], members: members || [] });
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, description, startDate, deadline, status } = req.body;
    const update = {};
    if (name) update.name = name;
    if (description !== undefined) update.description = description;
    if (startDate) update.start_date = startDate;
    if (deadline) update.deadline = deadline;
    if (status) update.status = status;

    const { data, error } = await supabase
      .from("projects").update(update).eq("id", id).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.json({ project: data });
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
};

exports.remove = async (req, res) => {
  try {
    const id = req.params.id;
    await supabase.from("tasks").delete().eq("project_id", id);
    await supabase.from("project_members").delete().eq("project_id", id);
    await supabase.from("projects").delete().eq("id", id);
    res.json({ message: "deleted" });
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
};

// add member to project
exports.addMember = async (req, res) => {
  try {
    const id = req.params.id;
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId required" });
    const { error } = await supabase.from("project_members").insert([{
      project_id: id, user_id: userId,
    }]);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: "added" });
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.params.userId;
    await supabase.from("project_members")
      .delete().eq("project_id", id).eq("user_id", userId);
    res.json({ message: "removed" });
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
};
