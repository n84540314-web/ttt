const supabase = require("../config/supabaseClient");

exports.list = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("activity_logs")
      .select("*, users(full_name)")
      .order("created_at", { ascending: false })
      .limit(30);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ activities: data });
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
};
