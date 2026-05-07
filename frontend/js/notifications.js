requireLogin();
renderNavbar();

async function load() {
  try {
    const r = await api("/api/notifications");
    const list = r.notifications || [];
    if (list.length === 0) {
      document.getElementById("notifList").innerHTML = "<p>No notifications.</p>";
      return;
    }
    document.getElementById("notifList").innerHTML = list.map(n =>
      '<div class="notif-item ' + (n.is_read ? '' : 'unread') + '">' +
        n.message +
        '<div style="font-size:11px;color:#888">' + fmtDateTime(n.created_at) + '</div>' +
      '</div>'
    ).join("");
  } catch (e) {
    document.getElementById("notifList").innerHTML = '<div class="alert alert-error">' + e.message + '</div>';
  }
}

async function markAll() {
  try {
    await api("/api/notifications/read", "POST");
    load();
  } catch (e) { alert(e.message); }
}

load();
