requireLogin("admin");
renderNavbar();

async function load() {
  try {
    const r = await api("/api/reports/performance");
    const list = r.members || [];
    let html = '<table><tr><th>Member</th><th>Email</th><th>Total Tasks</th><th>Completed</th><th>Pending</th><th>Delayed</th></tr>';
    list.forEach(m => {
      html += '<tr><td>' + m.name + '</td><td>' + m.email + '</td>' +
        '<td>' + m.total + '</td><td>' + m.completed + '</td>' +
        '<td>' + m.pending + '</td><td>' + (m.delayed > 0 ? '<span style="color:#c62828">' + m.delayed + '</span>' : m.delayed) + '</td></tr>';
    });
    html += '</table>';
    document.getElementById("report").innerHTML = html;
  } catch (e) {
    document.getElementById("report").innerHTML = '<div class="alert alert-error">' + e.message + '</div>';
  }
}

load();
