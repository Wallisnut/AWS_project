document.addEventListener('DOMContentLoaded', function() {
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
    const unreadNotifications = document.querySelectorAll('.notification-item.unread');
    
    if (markAllReadBtn && unreadNotifications.length > 0) {
        markAllReadBtn.addEventListener('click', function() {
            unreadNotifications.forEach(notification => {
                notification.classList.remove('unread');
            });
            
            // Update notification badge
            const notificationBadge = document.querySelector('.notification-badge');
            if (notificationBadge) {
                notificationBadge.style.display = 'none';
            }
            
            showToast('All notifications marked as read');
        });
    }
    
    // Logout button functionality
    const logoutBtn = document.querySelector('.logout-btn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            showToast('Logging out...');
            
            // Simulate logout process
            setTimeout(function() {
                alert('You have been logged out successfully.');
                // In a real app, this would redirect to login page
                // window.location.href = 'login.html';
            }, 1500);
        });
    }
    
    // Individual notification click
    const notificationItems = document.querySelectorAll('.notification-item');
    
    if (notificationItems.length > 0) {
        notificationItems.forEach(item => {
            item.addEventListener('click', function() {
                if (this.classList.contains('unread')) {
                    this.classList.remove('unread');
                    
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
                }
                
                // In a real app, this would navigate to the relevant page
                const notificationText = this.querySelector('.notification-text').textContent;
                showToast(`Viewing: ${notificationText}`);
            });
        });
    }
});

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