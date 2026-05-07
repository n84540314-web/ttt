// common helpers used across pages

const API_BASE = ""; // same origin

function getToken() {
  return localStorage.getItem("ttm_token");
}

function getUser() {
  const u = localStorage.getItem("ttm_user");
  return u ? JSON.parse(u) : null;
}

function saveSession(token, user) {
  localStorage.setItem("ttm_token", token);
  localStorage.setItem("ttm_user", JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem("ttm_token");
  localStorage.removeItem("ttm_user");
}

function logout() {
  clearSession();
  window.location.href = "login.html";
}

// require login - redirect if not logged in
function requireLogin(role) {
  const u = getUser();
  if (!u || !getToken()) {
    window.location.href = "login.html";
    return null;
  }
  if (role && u.role !== role) {
    alert("You don't have access to this page");
    window.location.href = u.role === "admin" ? "admin-dashboard.html" : "member-dashboard.html";
    return null;
  }
  return u;
}

// api wrapper
async function api(path, method, body) {
  const opts = {
    method: method || "GET",
    headers: { "Content-Type": "application/json" },
  };
  const tok = getToken();
  if (tok) opts.headers["Authorization"] = "Bearer " + tok;
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(API_BASE + path, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

// build navbar
function buildNavbar(active) {
  const u = getUser();
  if (!u) return "";
  const isAdmin = u.role === "admin";
  const dash = isAdmin ? "admin-dashboard.html" : "member-dashboard.html";

  let links = '<a href="' + dash + '">Dashboard</a>' +
              '<a href="projects.html">Projects</a>' +
              '<a href="tasks.html">Tasks</a>';

  if (isAdmin) {
    links += '<a href="task-review.html">Reviews</a>' +
             '<a href="members.html">Members</a>' +
             '<a href="reports.html">Reports</a>';
  }

  links += '<a href="notifications.html">Notifications</a>' +
           '<a href="profile.html">Profile</a>';

  return '' +
    '<div class="navbar">' +
      '<h2>Team Task Manager</h2>' +
      '<div class="nav-links">' + links + '</div>' +
      '<div class="nav-user">' +
        '<span>' + u.full_name + ' (' + (isAdmin ? 'Admin' : 'Member') + ')</span>' +
        '<button class="btn-logout" onclick="logout()">Logout</button>' +
      '</div>' +
    '</div>';
}

function renderNavbar(active) {
  const el = document.getElementById("navbar");
  if (el) el.innerHTML = buildNavbar(active);
}

// status badge helper
function statusBadge(status) {
  const cls = "badge-" + (status || "Not Started").toLowerCase().replace(/ /g, "-");
  return '<span class="badge ' + cls + '">' + status + '</span>';
}

function priorityLabel(p) {
  const cls = "priority-" + (p || "Medium").toLowerCase();
  return '<span class="' + cls + '">' + p + '</span>';
}

function fmtDate(d) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString();
}

function fmtDateTime(d) {
  if (!d) return "-";
  return new Date(d).toLocaleString();
}

function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = '<div class="alert alert-error">' + msg + '</div>';
}

function showSuccess(id, msg) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = '<div class="alert alert-success">' + msg + '</div>';
}

function getQuery(name) {
  const u = new URL(window.location.href);
  return u.searchParams.get(name);
}
