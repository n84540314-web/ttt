document.getElementById("loginForm").addEventListener("submit", async function(e) {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;

  try {
    const res = await api("/api/auth/login", "POST", { email, password, role });
    saveSession(res.session.access_token, res.user);
    if (res.user.role === "admin") {
      window.location.href = "admin-dashboard.html";
    } else {
      window.location.href = "member-dashboard.html";
    }
  } catch (err) {
    showError("msg", err.message);
  }
});
