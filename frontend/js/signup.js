document.getElementById("signupForm").addEventListener("submit", async function(e) {
  e.preventDefault();
  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirm = document.getElementById("confirm").value;
  const role = document.getElementById("role").value;

  if (password !== confirm) {
    showError("msg", "Passwords do not match");
    return;
  }

  try {
    await api("/api/auth/signup", "POST", { fullName, email, password, role });
    showSuccess("msg", "Account created. Please login.");
    setTimeout(() => { window.location.href = "login.html"; }, 1200);
  } catch (err) {
    showError("msg", err.message);
  }
});
