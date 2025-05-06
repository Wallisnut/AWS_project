document.addEventListener('DOMContentLoaded', async function() {
    // Load notifications from API
    try {
        await loadNotifications();
    } catch (error) {
        console.error('Failed to load notifications:', error);
    }
    
    // User dropdown functionality
    const userBtn = document.querySelector('.user-btn');
    const userDropdown = document.querySelector('.user-dropdown');
    
    if (userBtn && userDropdown) {
        userBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
            
            // Close notification dropdown if open
            const notificationDropdown = document.querySelector('.notification-dropdown');
            if (notificationDropdown && notificationDropdown.classList.contains('active')) {
                notificationDropdown.classList.remove('active');
            }
        });
    }
    
    // Notification dropdown functionality
    const notificationBtn = document.querySelector('.notification-btn');
    const notificationDropdown = document.querySelector('.notification-dropdown');
    
    if (notificationBtn && notificationDropdown) {
        notificationBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            notificationDropdown.classList.toggle('active');
            
            // Close user dropdown if open
            if (userDropdown && userDropdown.classList.contains('active')) {
                userDropdown.classList.remove('active');
            }
        });
    }
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (userDropdown && userDropdown.classList.contains('active')) {
            if (!userDropdown.contains(e.target) && e.target !== userBtn) {
                userDropdown.classList.remove('active');
            }
        }
        
        if (notificationDropdown && notificationDropdown.classList.contains('active')) {
            if (!notificationDropdown.contains(e.target) && e.target !== notificationBtn) {
                notificationDropdown.classList.remove('active');
            }
        }
    });
    
    // Mark all notifications as read
    const markAllReadBtn = document.querySelector('.mark-all-read');
    
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', async function() {
            try {
                // Call API to mark all notifications as read
                await window.BiteBrightAPI.markAllNotificationsAsRead();
                
                // Update UI
                const unreadNotifications = document.querySelectorAll('.notification-item.unread');
                unreadNotifications.forEach(notification => {
                    notification.classList.remove('unread');
                });
                
                // Update notification badge
                const notificationBadge = document.querySelector('.notification-badge');
                if (notificationBadge) {
                    notificationBadge.style.display = 'none';
                }
                
                showToast('All notifications marked as read');
            } catch (error) {
                console.error('Failed to mark notifications as read:', error);
                showToast('Failed to update notifications. Please try again.');
            }
        });
    }
    
    // Logout button functionality
    const logoutBtn = document.querySelector('.logout-btn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            showToast('Logging out...');
            
            // In a real app, this would call an API to logout
            // For now, we'll just simulate it
            setTimeout(function() {
                // Clear auth token
                localStorage.removeItem('authToken');
                
                alert('You have been logged out successfully.');
                // In a real app, this would redirect to login page
                // window.location.href = 'login.html';
            }, 1500);
        });
    }
    
    // Individual notification click
    setupNotificationItemListeners();
});

/**
 * Load notifications from API and update UI
 */
async function loadNotifications() {
    try {
        // Get notifications from API
        const notifications = await window.BiteBrightAPI.getNotifications();
        
        // Update notification list
        updateNotificationList(notifications);
        
        // Update notification badge
        updateNotificationBadge(notifications);
    } catch (error) {
        console.error('Failed to load notifications:', error);
        throw error;
    }
}

/**
 * Update notification list with data from API
 * @param {Array} notifications - Notifications from API
 */
function updateNotificationList(notifications) {
    const container = document.querySelector('.notification-list');
    if (!container || !notifications || notifications.length === 0) return;
    
    // Clear existing notifications
    container.innerHTML = '';
    
    // Add notifications from API
    notifications.forEach(notification => {
        const notificationElement = document.createElement('div');
        notificationElement.className = `notification-item${notification.read ? '' : ' unread'}`;
        notificationElement.dataset.id = notification.id;
        
        notificationElement.innerHTML = `
            <div class="notification-icon ${notification.type}">
                <i class="fas fa-${getIconForType(notification.type)}"></i>
            </div>
            <div class="notification-content">
                <p class="notification-text">${notification.message}</p>
                <p class="notification-time">${notification.time}</p>
            </div>
        `;
        
        container.appendChild(notificationElement);
    });
    
    // Setup listeners for new notification items
    setupNotificationItemListeners();
}

/**
 * Update notification badge based on unread count
 * @param {Array} notifications - Notifications from API
 */
function updateNotificationBadge(notifications) {
    const badge = document.querySelector('.notification-badge');
    if (!badge) return;
    
    const unreadCount = notifications.filter(n => !n.read).length;
    
    if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.style.display = '';
    } else {
        badge.style.display = 'none';
    }
}

/**
 * Setup click listeners for notification items
 */
function setupNotificationItemListeners() {
    const notificationItems = document.querySelectorAll('.notification-item');
    
    if (notificationItems.length > 0) {
        notificationItems.forEach(item => {
            // Remove existing listener to avoid duplicates
            item.removeEventListener('click', handleNotificationClick);
            
            // Add new listener
            item.addEventListener('click', handleNotificationClick);
        });
    }
}

/**
 * Handle notification item click
 * @param {Event} event - Click event
 */
async function handleNotificationClick(event) {
    const notificationItem = event.currentTarget;
    const notificationId = parseInt(notificationItem.dataset.id);
    
    if (notificationItem.classList.contains('unread')) {
        try {
            // Call API to mark notification as read
            await window.BiteBrightAPI.markNotificationAsRead(notificationId);
            
            // Update UI
            notificationItem.classList.remove('unread');
            
            // Update unread count
            const unreadCount = document.querySelectorAll('.notification-item.unread').length;
            const notificationBadge = document.querySelector('.notification-badge');
            
            if (notificationBadge) {
                if (unreadCount > 0) {
                    notificationBadge.textContent = unreadCount;
                } else {
                    notificationBadge.style.display = 'none';
                }
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    }
    
    // In a real app, this would navigate to the relevant page
    const notificationText = notificationItem.querySelector('.notification-text').textContent;
    showToast(`Viewing: ${notificationText}`);
}

/**
 * Get icon class based on notification type
 * @param {string} type - Notification type
 * @returns {string} - Icon class
 */
function getIconForType(type) {
    switch (type) {
        case 'warning': return 'exclamation-circle';
        case 'info': return 'info-circle';
        case 'success': return 'check-circle';
        default: return 'bell';
    }
}

// Toast notification function if not already defined
if (typeof showToast !== 'function') {
    function showToast(message) {
        // Check if a toast already exists and remove it
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        
        // Add to document
        document.body.appendChild(toast);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            
            setTimeout(() => {
                toast.remove();
            }, 500);
        }, 3000);
    }
}