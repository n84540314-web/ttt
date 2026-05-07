requireLogin("admin");
renderNavbar();

async function load() {
  try {
    const r = await api("/api/reviews/pending");
    const list = r.tasks || [];
    if (list.length === 0) {
      document.getElementById("reviewList").innerHTML = '<div class="card"><p>No tasks waiting for review.</p></div>';
      return;
    }
    let html = '';
    for (const t of list) {
      // load notes for each
      const detail = await api("/api/tasks/" + t.id);
      let notesHtml = '';
      (detail.notes || []).forEach(n => {
        notesHtml += '<div class="comment-box"><div class="author">' +
          (n.users ? n.users.full_name : 'User') + '</div>' + n.note + '</div>';
      });
      if (!notesHtml) notesHtml = '<p style="color:#888">No notes from member.</p>';

      html += '<div class="card">' +
        '<h3>' + t.title + '</h3>' +
        '<p><b>Project:</b> ' + (t.projects ? t.projects.name : '-') +
        ' &nbsp; <b>Member:</b> ' + (t.users ? t.users.full_name : '-') +
        ' &nbsp; <b>Due:</b> ' + fmtDate(t.due_date) + '</p>' +
        '<p>' + (t.description || "") + '</p>' +
        '<h4 style="margin-top:8px;font-size:13px">Member Notes:</h4>' + notesHtml +
        '<div class="form-group" style="margin-top:10px">' +
          '<label>Review Comment</label>' +
          '<textarea id="cmt-' + t.id + '" placeholder="e.g. Fix API validation, Improve UI alignment..."></textarea>' +
        '</div>' +
        '<button class="btn btn-small btn-success" onclick="approve(\'' + t.id + '\')">Approve</button> ' +
        '<button class="btn btn-small btn-danger" onclick="rework(\'' + t.id + '\')">Request Rework</button>' +
      '</div>';
    }
    document.getElementById("reviewList").innerHTML = html;
  } catch (e) {
    document.getElementById("reviewList").innerHTML = '<div class="alert alert-error">' + e.message + '</div>';
  }
}

async function approve(id) {
  const comment = document.getElementById("cmt-" + id).value.trim() || "Approved";
  try {
    await api("/api/reviews/" + id + "/approve", "POST", { comment });
    load();
  } catch (e) { alert(e.message); }
}

async function rework(id) {
  const comment = document.getElementById("cmt-" + id).value.trim();
  if (!comment) { alert("Please add a feedback comment for rework"); return; }
  try {
    await api("/api/reviews/" + id + "/rework", "POST", { comment });
    load();
  } catch (e) { alert(e.message); }
}

load();
