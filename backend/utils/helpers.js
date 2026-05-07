// some small helper functions

function isOverdue(dueDate, status) {
  if (!dueDate) return false;
  if (status === "Verified Completed") return false;
  const now = new Date();
  const d = new Date(dueDate);
  return d < now;
}

function calcCompletion(tasks) {
  if (!tasks || tasks.length === 0) return 0;
  let done = 0;
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].status === "Verified Completed") done++;
  }
  return Math.round((done / tasks.length) * 100);
}

module.exports = { isOverdue, calcCompletion };
