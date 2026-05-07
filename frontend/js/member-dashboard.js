requireLogin("member");
renderNavbar();

async function loadStats() {
  try {
    const s = await api("/api/reports/dashboard");
    const cards = [
      ["Assigned Tasks", s.assigned],
      ["In Progress", s.inProgress],
      ["Pending Review", s.pendingReview],
      ["Verified", s.verified],
      ["Needs Rework", s.rework],
      ["Upcoming (3 days)", s.upcoming],
    ];
    document.getElementById("stats").innerHTML = cards.map(c =>
      '<div class="stat-card"><div class="number">' + c[1] + '</div><div class="label">' + c[0] + '</div></div>'
    ).join("");
  } catch (e) { console.log(e); }
}

async function loadTasks() {
  try {
    const r = await api("/api/tasks?mine=1");
    const list = r.tasks || [];
    if (list.length === 0) {
      document.getElementById("tasksList").innerHTML = "<p>No tasks assigned yet.</p>";
      return;
    }
    let html = '<table><tr><th>Task</th><th>Project</th><th>Status</th><th>Priority</th><th>Due</th><th></th></tr>';
    list.slice(0, 10).forEach(t => {
      html += '<tr' + (t.is_overdue ? ' class="overdue-row"' : '') + '>' +
        '<td>' + t.title + '</td>' +
        '<td>' + (t.projects ? t.projects.name : '-') + '</td>' +
        '<td>' + statusBadge(t.status) + '</td>' +
        '<td>' + priorityLabel(t.priority) + '</td>' +
        '<td>' + fmtDate(t.due_date) + '</td>' +
        '<td><a href="tasks.html?id=' + t.id + '">View</a></td>' +
      '</tr>';
    });
    html += '</table>';
    document.getElementById("tasksList").innerHTML = html;
  } catch (e) { console.log(e); }
}

loadStats();
loadTasks();
