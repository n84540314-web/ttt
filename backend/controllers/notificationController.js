const supabase = require("../config/supabaseClient");

exports.list = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });
    if (error) return res.status(400).json({ error: error.message });
    res.json({ notifications: data });
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
};

exports.markRead = async (req, res) => {
  try {
    await supabase.from("notifications")
      .update({ is_read: true })
      .eq("user_id", req.user.id);
    res.json({ message: "marked read" });
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
};
