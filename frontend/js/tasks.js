const u = requireLogin();
renderNavbar();

if (u.role !== "admin") {
  const b = document.getElementById("createBtn");
  if (b) b.style.display = "none";
}

const taskId = getQuery("id");
const projectId = getQuery("projectId");
let allTasks = [];

if (taskId) {
  document.getElementById("filters").style.display = "none";
  document.getElementById("taskList").style.display = "none";
  loadTaskDetail(taskId);
} else {
  loadTasks();
}

async function loadTasks() {
  try {
    let url = "/api/tasks";
    if (projectId) url += "?projectId=" + projectId;
    const r = await api(url);
    allTasks = r.tasks || [];
    renderList(allTasks);
  } catch (e) {
    document.getElementById("taskList").innerHTML = '<div class="alert alert-error">' + e.message + '</div>';
  }
}

function renderList(list) {
  if (list.length === 0) {
    document.getElementById("taskList").innerHTML = '<div class="card"><p>No tasks found.</p></div>';
    return;
  }
  let html = '<table><tr><th>Title</th><th>Project</th><th>Assigned</th><th>Priority</th><th>Status</th><th>Due</th><th></th></tr>';
  list.forEach(t => {
    html += '<tr' + (t.is_overdue ? ' class="overdue-row"' : '') + '>' +
      '<td>' + t.title + '</td>' +
      '<td>' + (t.projects ? t.projects.name : '-') + '</td>' +
      '<td>' + (t.users ? t.users.full_name : '-') + '</td>' +
      '<td>' + priorityLabel(t.priority) + '</td>' +
      '<td>' + statusBadge(t.status) + '</td>' +
      '<td>' + fmtDate(t.due_date) + '</td>' +
      '<td><a href="tasks.html?id=' + t.id + '">Open</a></td>' +
    '</tr>';
  });
  html += '</table>';
  document.getElementById("taskList").innerHTML = html;
}

function applyFilters() {
  const q = document.getElementById("search").value.toLowerCase();
  const s = document.getElementById("filterStatus").value;
  const p = document.getElementById("filterPriority").value;
  let list = allTasks;
  if (q) list = list.filter(t => t.title.toLowerCase().includes(q));
  if (s) list = list.filter(t => t.status === s);
  if (p) list = list.filter(t => t.priority === p);
  renderList(list);
}

["search", "filterStatus", "filterPriority"].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("input", applyFilters);
});

async function loadTaskDetail(id) {
  try {
    const r = await api("/api/tasks/" + id);
    const t = r.task;
    let html = '<div class="card"><h3>' + t.title + '</h3>' +
      '<p>' + (t.description || "(no description)") + '</p>' +
      '<p><b>Project:</b> ' + (t.projects ? t.projects.name : '-') +
      ' &nbsp; <b>Assigned to:</b> ' + (t.users ? t.users.full_name : '-') +
      ' &nbsp; <b>Status:</b> ' + statusBadge(t.status) +
      ' &nbsp; <b>Priority:</b> ' + priorityLabel(t.priority) +
      ' &nbsp; <b>Due:</b> ' + fmtDate(t.due_date) + '</p>';

    // member actions
    if (u.role === "member" && t.assigned_to === u.id) {
      html += '<div style="margin-top:12px">' +
        '<label>Update Status:</label> ' +
        '<select id="newStatus">' +
        ['Not Started','In Progress','Needs Rework'].map(s =>
          '<option' + (t.status === s ? ' selected' : '') + '>' + s + '</option>'
        ).join("") + '</select> ' +
        '<button class="btn btn-small" onclick="updateStatus(\'' + t.id + '\')">Update</button>' +
        ' <button class="btn btn-small btn-success" onclick="submitWork(\'' + t.id + '\')">Submit for Review</button>' +
      '</div>';
    }

    if (u.role === "admin") {
      html += '<div style="margin-top:12px">' +
        '<button class="btn btn-small btn-danger" onclick="deleteTask(\'' + t.id + '\')">Delete Task</button>' +
      '</div>';
    }
    html += '</div>';

    // reviews
    if (r.reviews && r.reviews.length > 0) {
      html += '<div class="card"><h3>Admin Feedback</h3>';
      r.reviews.forEach(rv => {
        html += '<div class="comment-box review-comment">' +
          '<div class="author">' + (rv.users ? rv.users.full_name : 'Admin') + ' [' + rv.action + ']</div>' +
          rv.comment +
          '<div class="time" style="font-size:11px;color:#999">' + fmtDateTime(rv.created_at) + '</div>' +
        '</div>';
      });
      html += '</div>';
    }

    // notes / comments timeline
    html += '<div class="card"><h3>Progress Notes</h3>';
    if (r.notes && r.notes.length > 0) {
      r.notes.forEach(n => {
        html += '<div class="comment-box">' +
          '<div class="author">' + (n.users ? n.users.full_name : 'User') + '</div>' +
          n.note +
          '<div class="time" style="font-size:11px;color:#999">' + fmtDateTime(n.created_at) + '</div>' +
        '</div>';
      });
    } else {
      html += '<p>No notes yet.</p>';
    }
    html += '<div class="form-group" style="margin-top:10px">' +
      '<textarea id="newNote" placeholder="Add a progress note or comment..."></textarea>' +
      '<button class="btn btn-small" style="margin-top:6px" onclick="addNote(\'' + t.id + '\')">Add Note</button>' +
    '</div></div>';

    document.getElementById("taskDetail").innerHTML = html;
  } catch (e) {
    document.getElementById("taskDetail").innerHTML = '<div class="alert alert-error">' + e.message + '</div>';
  }
}

async function updateStatus(id) {
  const status = document.getElementById("newStatus").value;
  try {
    await api("/api/tasks/" + id, "PUT", { status });
    loadTaskDetail(id);
  } catch (e) { alert(e.message); }
}

async function submitWork(id) {
  const comment = prompt("Add a comment about your submitted work (optional):");
  try {
    await api("/api/tasks/" + id + "/submit", "POST", { comment });
    alert("Submitted for review!");
    loadTaskDetail(id);
  } catch (e) { alert(e.message); }
}

async function addNote(id) {
  const note = document.getElementById("newNote").value.trim();
  if (!note) return;
  try {
    await api("/api/tasks/" + id + "/notes", "POST", { note });
    loadTaskDetail(id);
  } catch (e) { alert(e.message); }
}

async function deleteTask(id) {
  if (!confirm("Delete this task?")) return;
  try {
    await api("/api/tasks/" + id, "DELETE");
    window.location.href = "tasks.html";
  } catch (e) { alert(e.message); }
}
