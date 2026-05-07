// auth controller
const supabase = require("../config/supabaseClient");

// signup
exports.signup = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ error: "all fields required" });
    }

    if (role !== "admin" && role !== "member") {
      return res.status(400).json({ error: "invalid role" });
    }

    // create user in supabase auth
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // also save in our users table
    const userId = data.user.id;
    const { error: insertErr } = await supabase.from("users").insert([
      { id: userId, full_name: fullName, email: email, role: role },
    ]);

    if (insertErr) {
      console.log(insertErr);
    }

    res.json({ message: "signup success", user: data.user });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "signup failed" });
  }
};

// login
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "email and password required" });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      return res.status(400).json({ error: "invalid credentials" });
    }

    // check role matches
    const { data: userRow } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (role && userRow && userRow.role !== role) {
      return res.status(403).json({ error: "role mismatch. please select correct role" });
    }

    res.json({
      message: "login success",
      session: data.session,
      user: userRow,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "login failed" });
  }
};

// logout
exports.logout = async (req, res) => {
  try {
    const header = req.headers.authorization;
    if (header) {
      const token = header.split(" ")[1];
      await supabase.auth.admin.signOut(token);
    }
    res.json({ message: "logged out" });
  } catch (e) {
    res.json({ message: "logged out" });
  }
};

// get current user info
exports.me = async (req, res) => {
  res.json({ user: req.userRow });
};
