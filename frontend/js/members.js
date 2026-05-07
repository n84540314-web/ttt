requireLogin("admin");
renderNavbar();

async function load() {
  try {
    const r = await api("/api/members");
    const list = r.users || [];
    let html = '<div class="card"><table><tr><th>Name</th><th>Email</th><th>Role</th></tr>';
    list.forEach(u => {
      html += '<tr><td>' + u.full_name + '</td><td>' + u.email + '</td><td>' +
        (u.role === "admin" ? "Team Lead" : "Team Member") + '</td></tr>';
    });
    html += '</table></div>';
    document.getElementById("memberList").innerHTML = html;
  } catch (e) {
    document.getElementById("memberList").innerHTML = '<div class="alert alert-error">' + e.message + '</div>';
  }
}

load();
