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
