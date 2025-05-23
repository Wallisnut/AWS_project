document.addEventListener("DOMContentLoaded", () => {
  setupLogout();
  setupProfileDropdown();
  setupMarkAllRead();
  updateNotificationTimes();
  showNotification();
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

function showNotification(items) {
  const list = document.querySelector(".notification-list");

  list.innerHTML = "";

  if (!items || items.length === 0) {
    const emptyNotification = document.createElement("div");
    emptyNotification.className = "notification-item";
    emptyNotification.innerHTML = `
      <div class="notification-icon info">
        <i class="fas fa-info-circle"></i>
      </div>
      <div class="notification-content">
        <p class="notification-text">No expiring items today</p>
        <p class="notification-time">Now</p>
      </div>
    `;
    list.appendChild(emptyNotification);
    return;
  }

  items.forEach((item) => {
    const notification = document.createElement("div");
    notification.className = "notification-item unread";
    notification.innerHTML = `
      <div class="notification-icon warning">
        <i class="fas fa-exclamation-circle"></i>
      </div>
      <div class="notification-content">
        <p class="notification-text">${item.name} is expiring soon!</p>
        <p class="notification-time">${formatDate(item.expiry_date)}</p>
      </div>
    `;
    list.appendChild(notification);
  });

  const badge = document.querySelector(".notification-badge");
  badge.textContent = items.length;
  badge.style.display = items.length > 0 ? "inline-block" : "none";
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
function setupMarkAllRead() {
  const markAllReadBtn = document.querySelector(".mark-all-read");
  const notificationItems = document.querySelectorAll(
    ".notification-item.unread",
  );
  const badge = document.querySelector(".notification-badge");

  if (markAllReadBtn) {
    markAllReadBtn.addEventListener("click", () => {
      notificationItems.forEach((item) => item.classList.remove("unread"));

      if (badge) {
        badge.textContent = "0";
        badge.style.display = "none";
      }
    });
  }
}

function updateNotificationTimes() {
  document.querySelectorAll(".notification-time").forEach((el) => {
    const timestamp = el.dataset.timestamp;
    if (timestamp) {
      const date = new Date(timestamp);
      el.textContent = formatTimeAgo(date);
    }
  });
}

function formatTimeAgo(date) {
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return date.toLocaleDateString();
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
