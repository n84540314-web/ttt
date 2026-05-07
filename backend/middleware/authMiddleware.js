// auth middleware - checks supabase token
const supabase = require("../config/supabaseClient");

async function checkAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header) {
      return res.status(401).json({ error: "no token" });
    }
    const token = header.split(" ")[1];
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return res.status(401).json({ error: "invalid token" });
    }
    req.user = data.user;

    // also fetch role from users table
    const { data: userRow } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .single();

    req.userRow = userRow;
    next();
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "auth failed" });
  }
}

function checkAdmin(req, res, next) {
  if (!req.userRow || req.userRow.role !== "admin") {
    return res.status(403).json({ error: "admin only" });
  }
  next();
}

module.exports = { checkAuth, checkAdmin };
