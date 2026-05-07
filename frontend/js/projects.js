const u = requireLogin();
renderNavbar();

if (u && u.role !== "admin") {
  const b = document.getElementById("createBtn");
  if (b) b.style.display = "none";
}

let allProjects = [];

async function loadProjects() {
  try {
    const r = await api("/api/projects");
    allProjects = r.projects || [];
    render(allProjects);
  } catch (e) {
    document.getElementById("projectList").innerHTML = '<div class="alert alert-error">' + e.message + '</div>';
  }
}

function render(list) {
  if (list.length === 0) {
    document.getElementById("projectList").innerHTML = '<div class="card"><p>No projects found.</p></div>';
    return;
  }
  let html = '';
  list.forEach(p => {
    html += '<div class="card">' +
      '<h3>' + p.name + '</h3>' +
      '<p>' + (p.description || "No description") + '</p>' +
      '<p><b>Status:</b> ' + statusBadge(p.status) +
      ' &nbsp; <b>Deadline:</b> ' + fmtDate(p.deadline) +
      ' &nbsp; <b>Tasks:</b> ' + p.task_count + '</p>' +
      '<div style="margin:8px 0"><div class="progress"><div class="progress-bar" style="width:' + p.completion + '%"></div></div>' +
      '<small>' + p.completion + '% complete</small></div>' +
      '<a href="tasks.html?projectId=' + p.id + '" class="btn btn-small">View Tasks</a>';
    if (u.role === "admin") {
      html += ' <button class="btn btn-small btn-danger" onclick="deleteProject(\'' + p.id + '\')">Delete</button>';
    }
    html += '</div>';
  });
  document.getElementById("projectList").innerHTML = html;
}

async function deleteProject(id) {
  if (!confirm("Delete this project and all its tasks?")) return;
  try {
    await api("/api/projects/" + id, "DELETE");
    loadProjects();
  } catch (e) { alert(e.message); }
}

document.getElementById("search").addEventListener("input", function(e) {
  const q = e.target.value.toLowerCase();
  render(allProjects.filter(p => p.name.toLowerCase().includes(q)));
});

loadProjects();
