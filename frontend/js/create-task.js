requireLogin("admin");
renderNavbar();

async function loadOptions() {
  try {
    const projs = await api("/api/projects");
    document.getElementById("projectId").innerHTML =
      '<option value="">-- Select Project --</option>' +
      (projs.projects || []).map(p => '<option value="' + p.id + '">' + p.name + '</option>').join("");

    const mems = await api("/api/members");
    document.getElementById("assignedTo").innerHTML =
      '<option value="">-- Unassigned --</option>' +
      (mems.users || []).filter(m => m.role === "member")
        .map(m => '<option value="' + m.id + '">' + m.full_name + '</option>').join("");

    // pre-fill if projectId in url
    const pid = getQuery("projectId");
    if (pid) document.getElementById("projectId").value = pid;
  } catch (e) {
    showError("msg", e.message);
  }
}

document.getElementById("taskForm").addEventListener("submit", async function(e) {
  e.preventDefault();
  const body = {
    title: document.getElementById("title").value.trim(),
    description: document.getElementById("description").value.trim(),
    projectId: document.getElementById("projectId").value,
    assignedTo: document.getElementById("assignedTo").value || null,
    dueDate: document.getElementById("dueDate").value || null,
    priority: document.getElementById("priority").value,
  };
  if (!body.title || !body.projectId) {
    showError("msg", "Title and project required");
    return;
  }
  try {
    await api("/api/tasks", "POST", body);
    showSuccess("msg", "Task created!");
    setTimeout(() => { window.location.href = "tasks.html"; }, 800);
  } catch (err) {
    showError("msg", err.message);
  }
});

loadOptions();
