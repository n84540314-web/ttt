const u = requireLogin();
renderNavbar();

async function load() {
  try {
    const r = await api("/api/auth/me");
    const me = r.user;
    document.getElementById("profileCard").innerHTML =
      '<p><b>Name:</b> ' + me.full_name + '</p>' +
      '<p><b>Email:</b> ' + me.email + '</p>' +
      '<p><b>Role:</b> ' + (me.role === "admin" ? "Team Lead (Admin)" : "Team Member") + '</p>' +
      '<p><b>Joined:</b> ' + fmtDate(me.created_at) + '</p>' +
      '<button class="btn btn-danger" onclick="logout()">Logout</button>';
  } catch (e) {
    document.getElementById("profileCard").innerHTML = '<div class="alert alert-error">' + e.message + '</div>';
  }
}

load();
