requireLogin("admin");
renderNavbar();

document.getElementById("projForm").addEventListener("submit", async function(e) {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const description = document.getElementById("description").value.trim();
  const startDate = document.getElementById("startDate").value;
  const deadline = document.getElementById("deadline").value;

  if (!name) { showError("msg", "Project name required"); return; }

  try {
    await api("/api/projects", "POST", { name, description, startDate, deadline });
    showSuccess("msg", "Project created!");
    setTimeout(() => { window.location.href = "projects.html"; }, 800);
  } catch (err) {
    showError("msg", err.message);
  }
});
