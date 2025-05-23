document.addEventListener("DOMContentLoaded", () => {
  setupLogout();
  setupProfileDropdown();
  setupNotificationDropdown();
});

// ---- Logout Setup ----
function setupLogout() {
  const logoutBtn = document.getElementById("logout-btn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      logout();
    });
  }
}

function logout() {
  localStorage.removeItem("userId");
  showToast("You have been logged out.");
  setTimeout(() => {
    window.location.href = "login.html";
  }, 300);
}

// ---- Profile Dropdown ----
function setupProfileDropdown() {
  const userBtn = document.querySelector(".user-btn");
  const userDropdown = document.querySelector(".user-dropdown");

  if (userBtn && userDropdown) {
    userBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle("active");
    });

    document.addEventListener("click", (e) => {
      if (!userDropdown.contains(e.target) && e.target !== userBtn) {
        userDropdown.classList.remove("active");
      }
    });
  }
}

function setupNotificationDropdown() {
  const notificationBtn = document.querySelector(".notification-btn");
  const notificationDropdown = document.querySelector(".notification-dropdown");

  if (notificationBtn && notificationDropdown) {
    notificationBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      notificationDropdown.classList.toggle("active");
    });

    document.addEventListener("click", (e) => {
      if (
        !notificationDropdown.contains(e.target) &&
        e.target !== notificationBtn
      ) {
        notificationDropdown.classList.remove("active");
      }
    });
  }
}

// ---- Toast Notification ----
function showToast(message) {
  const existingToast = document.querySelector(".toast");
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;

  toast.style.position = "fixed";
  toast.style.bottom = "20px";
  toast.style.left = "50%";
  toast.style.transform = "translateX(-50%)";
  toast.style.backgroundColor = "rgba(0, 0, 0, 0.85)";
  toast.style.color = "white";
  toast.style.padding = "12px 20px";
  toast.style.borderRadius = "8px";
  toast.style.zIndex = "1000";
  toast.style.transition = "opacity 0.5s";
  toast.style.opacity = "1";

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => {
      toast.remove();
    }, 500);
  }, 1500);
}
