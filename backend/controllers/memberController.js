const supabase = require("../config/supabaseClient");

// list members (for assigning tasks etc)
exports.list = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users").select("id, full_name, email, role")
      .order("full_name", { ascending: true });
    if (error) return res.status(400).json({ error: error.message });
    res.json({ users: data });
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
};
