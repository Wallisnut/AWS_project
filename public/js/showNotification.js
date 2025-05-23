document.addEventListener("DOMContentLoaded", async () => {
  setupNotificationDropdown();
  setupMarkAllRead();

  try {
    const inventoryData = await window.BiteBrightAPI.getInventoryItems();
    const today = getDateWithoutTime(new Date());
    const soonExpiringItems = [];

    Object.values(inventoryData.categories || {}).flat().forEach((item) => {
      if (!item.expiryDate) return;
      const expiry = getDateWithoutTime(parseDate(item.expiryDate));
      const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
      if (diffDays <= 4 && diffDays >= 0 || diffDays < 0) {
        soonExpiringItems.push({ item, diffDays, expiryDate: expiry });
      }
    });

    if (Array.isArray(soonExpiringItems)) {
      showNotification(soonExpiringItems);
    } else {
      console.warn("No valid expiring items to show.");
    }

  } catch (err) {
    console.error("Notification Error:", err);
  }
});

function setupNotificationDropdown() {
  const notificationBtn = document.querySelector(".notification-btn");
  const notificationDropdown = document.querySelector(".notification-dropdown");

  if (notificationBtn && notificationDropdown) {
    notificationBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      notificationDropdown.classList.toggle("active");
    });

    document.addEventListener("click", (e) => {
      if (!notificationDropdown.contains(e.target) && e.target !== notificationBtn) {
        notificationDropdown.classList.remove("active");
      }
    });
  }
}

function setupMarkAllRead() {
  const markAllReadBtn = document.querySelector(".mark-all-read");
  const badge = document.querySelector(".notification-badge");

  if (markAllReadBtn) {
    markAllReadBtn.addEventListener("click", () => {
      const notifications = document.querySelectorAll(".notification-item");
      const ids = [];

      notifications.forEach((item) => {
        item.classList.remove("unread");
        const uniqueId = item.dataset.id;
        if (uniqueId) ids.push(uniqueId);
      });

      saveReadNotifications(ids);

      if (badge) {
        badge.textContent = "0";
        badge.style.display = "none";
      }
    });
  }
}

function showNotification(items) {
  if (!Array.isArray(items)) {
    console.error("showNotification: items is not an array", items);
    return;
  }
  const list = document.querySelector(".notification-list");
  if (!list) return;

  list.innerHTML = "";

  const readIds = getReadNotifications();
  const expiredItems = [], warningItems = [];

  items.forEach(({ item, diffDays, expiryDate }) => {
    if (diffDays < 0 || diffDays === 0) {
      expiredItems.push({ item, diffDays, expiryDate });
    } else {
      warningItems.push({ item, diffDays, expiryDate });
    }
  });

  expiredItems.sort((a, b) => a.expiryDate - b.expiryDate);
  warningItems.sort((a, b) => a.expiryDate - b.expiryDate);
  const sorted = [...expiredItems, ...warningItems];

  sorted.forEach(({ item, diffDays }) => {
    const isExpired = diffDays <= 0;
    const statusClass = isExpired ? "expired" : "warning";
    const uniqueId = `${item.name}_${item.expiryDate}`;
    const isRead = readIds.includes(uniqueId);
    const readClass = isRead ? "" : "unread";

    const noti = document.createElement("div");
    noti.className = `notification-item ${readClass} ${statusClass}`;
    noti.dataset.id = uniqueId;
    noti.innerHTML = `
      <div class="notification-icon warning"><i class="fas fa-exclamation-circle"></i></div>
      <div class="notification-content">
        <p class="notification-text">${getExpiryNotificationText(item)}</p>
        <p class="notification-time">${formatDate(item.expiryDate)}</p>
      </div>`;
    list.appendChild(noti);
  });

  const badge = document.querySelector(".notification-badge");
  const unreadCount = sorted.filter(({ item }) => {
    const uniqueId = `${item.name}_${item.expiryDate}`;
    return !readIds.includes(uniqueId);
  }).length;
  badge.textContent = unreadCount;
  badge.style.display = unreadCount > 0 ? "inline-block" : "none";
}

function getExpiryNotificationText(item) {
  const today = getDateWithoutTime(new Date());
  const expiry = getDateWithoutTime(parseDate(item.expiryDate));
  const diff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

  if (diff < 0) return `${item.name} has already expired!`;
  if (diff === 0) return `${item.name} expires today!`;
  return `${item.name} will expire in ${diff} day(s)!`;
}

function formatDate(dateStr) {
  const d = parseDate(dateStr);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function parseDate(dateStr) {
  if (dateStr.includes("-")) {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d);
  } else {
    const [d, m, y] = dateStr.split("/").map(Number);
    const realYear = y >= 2500 ? y - 543 : y;
    return new Date(realYear, m - 1, d);
  }
}

function getDateWithoutTime(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getReadNotifications() {
  const data = localStorage.getItem("readNotifications");
  return data ? JSON.parse(data) : [];
}

function saveReadNotifications(newIds) {
  const existing = getReadNotifications();
  const merged = Array.from(new Set([...existing, ...newIds]));
  localStorage.setItem("readNotifications", JSON.stringify(merged));
}
