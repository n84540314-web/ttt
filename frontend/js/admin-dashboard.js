requireLogin("admin");
renderNavbar();

async function loadStats() {
  try {
    const s = await api("/api/reports/dashboard");
    const cards = [
      ["Total Projects", s.totalProjects],
      ["Total Tasks", s.totalTasks],
      ["Pending Review", s.pendingReview],
      ["Verified", s.verified],
      ["Needs Rework", s.rework],
      ["Overdue", s.overdue],
      ["Active Members", s.activeMembers],
    ];
    document.getElementById("stats").innerHTML = cards.map(c =>
      '<div class="stat-card"><div class="number">' + c[1] + '</div><div class="label">' + c[0] + '</div></div>'
    ).join("");
  } catch (e) { console.log(e); }
}

async function loadActivity() {
  try {
    const r = await api("/api/activities");
    const list = r.activities || [];
    if (list.length === 0) {
      document.getElementById("activityList").innerHTML = "<p>No activity yet.</p>";
      return;
    }
    document.getElementById("activityList").innerHTML = list.slice(0, 10).map(a =>
      '<div class="timeline-item">' +
        '<b>' + (a.users ? a.users.full_name : "Someone") + '</b> ' + a.action +
        '<div class="time">' + fmtDateTime(a.created_at) + '</div>' +
      '</div>'
    ).join("");
  } catch (e) { console.log(e); }
}

async function loadPending() {
  try {
    const r = await api("/api/reviews/pending");
    const list = r.tasks || [];
    if (list.length === 0) {
      document.getElementById("pendingList").innerHTML = "<p>No tasks waiting for review.</p>";
      return;
    }
    document.getElementById("pendingList").innerHTML = list.slice(0, 10).map(t =>
      '<div class="timeline-item">' +
        '<a href="task-review.html?id=' + t.id + '">' + t.title + '</a> - ' +
        (t.users ? t.users.full_name : "?") +
      '</div>'
    ).join("");
  } catch (e) { console.log(e); }
}

loadStats();
loadActivity();
loadPending();
