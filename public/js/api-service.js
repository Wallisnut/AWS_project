/**
 * BiteBright API Service
 * 
 * This file contains mock API functions that will be replaced with actual API calls
 * when the backend is developed. Frontend developers can use these functions as-is,
 * and backend developers can implement the actual API endpoints with the same
 * request/response structure.
 */

const API_BASE_URL = 'https://api.bitebright.com/v1'; // Will be replaced with actual API URL

/**
 * Generic API request function with error handling
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} - Response data
 */
async function apiRequest(endpoint, options = {}) {
    // In production, this would be a real API call
    // For now, we'll simulate network delay
    const mockDelay = Math.random() * 300 + 200; // 200-500ms delay
    
    // Set default headers
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`
        }
    };
    
    const requestOptions = { ...defaultOptions, ...options };
    
    try {
        // In a real implementation, this would be:
        // const response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);
        
        // For mock implementation, we'll simulate the response
        await new Promise(resolve => setTimeout(resolve, mockDelay));
        
        // Check if we have mock data for this endpoint
        const mockResponse = getMockResponse(endpoint, requestOptions);
        
        if (mockResponse.error) {
            throw new Error(mockResponse.error);
        }
        
        return mockResponse.data;
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

/**
 * Get auth token from localStorage
 * @returns {string} - Auth token
 */
function getAuthToken() {
    return localStorage.getItem('authToken') || 'mock-auth-token';
}

/**
 * Generate mock response based on endpoint and request
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Request options
 * @returns {Object} - Mock response
 */
function getMockResponse(endpoint, options) {
    // Mock data for different endpoints
    const mockData = {
        // Inventory endpoints
        '/inventory/expiring': {
            data: [
                {
                    id: 1,
                    name: 'Tomatoes',
                    quantity: '500g',
                    expiryDate: getTodayDate(),
                    category: 'Vegetables',
                    imageUrl: '/img/tomato.jpg'
                },
                {
                    id: 2,
                    name: 'Chicken Breast',
                    quantity: '2 pieces',
                    expiryDate: getDateOffset(2),
                    category: 'Meat',
                    imageUrl: '/img/chicken.jpg'
                },
                {
                    id: 3,
                    name: 'Milk',
                    quantity: '1 liter',
                    expiryDate: getDateOffset(4),
                    category: 'Dairy',
                    imageUrl: '/img/milk.jpg'
                },
                {
                    id: 4,
                    name: 'Eggs',
                    quantity: '6 pieces',
                    expiryDate: getDateOffset(7),
                    category: 'Dairy',
                    imageUrl: '/img/eggs.jpg'
                }
            ]
        },
        '/inventory/summary': {
            data: {
                totalItems: 24,
                categories: 8,
                expiringThisWeek: 7
            }
        },
        '/notifications': {
            data: [
                {
                    id: 1,
                    type: 'warning',
                    message: 'Tomatoes are expiring today!',
                    time: 'Just now',
                    read: false
                },
                {
                    id: 2,
                    type: 'info',
                    message: 'New recipe suggestions available',
                    time: '2 hours ago',
                    read: false
                },
                {
                    id: 3,
                    type: 'success',
                    message: 'Inventory updated successfully',
                    time: 'Yesterday',
                    read: true
                }
            ]
        },
        '/recipes/suggestions': {
            data: [
                {
                    id: 1,
                    name: 'Pad Kraprow',
                    cookTime: '20 Minutes',
                    ingredients: ['pork', 'holy basil', 'garlic', 'chili'],
                    imageUrl: '/img/Padkraphao.jpg'
                },
                {
                    id: 2,
                    name: 'Tomato Pasta',
                    cookTime: '30 Minutes',
                    ingredients: ['pasta', 'tomatoes', 'garlic', 'basil'],
                    imageUrl: '/img/pasta.jpg'
                },
                {
                    id: 3,
                    name: 'Omelette',
                    cookTime: '15 Minutes',
                    ingredients: ['eggs', 'milk', 'cheese', 'ham'],
                    imageUrl: '/img/omelette.jpg'
                }
            ]
        }
    };
    
    // Handle POST requests
    if (options.method === 'POST') {
        if (endpoint === '/inventory/items') {
            // Mock adding a new item
            const newItem = JSON.parse(options.body);
            return {
                data: {
                    id: Math.floor(Math.random() * 1000) + 100,
                    ...newItem,
                    createdAt: new Date().toISOString()
                }
            };
        }
        
        if (endpoint === '/notifications/mark-read') {
            // Mock marking notifications as read
            return {
                data: {
                    success: true,
                    message: 'Notifications marked as read'
                }
            };
        }
    }
    
    // Return mock data for the endpoint or 404
    return mockData[endpoint] || { error: 'Endpoint not found' };
}

/**
 * Get today's date in dd/mm/yyyy format
 * @returns {string} - Formatted date
 */
function getTodayDate() {
    const today = new Date();
    return formatDate(today);
}

/**
 * Get date with offset in dd/mm/yyyy format
 * @param {number} days - Days to add
 * @returns {string} - Formatted date
 */
function getDateOffset(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return formatDate(date);
}

/**
 * Format date as dd/mm/yyyy
 * @param {Date} date - Date to format
 * @returns {string} - Formatted date
 */
function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// ============================================================================
// API Functions for Frontend Use
// ============================================================================

/**
 * Get items that are expiring soon
 * @returns {Promise<Array>} - List of expiring items
 */
async function getExpiringItems() {
    return apiRequest('/inventory/expiring');
}

/**
 * Get inventory summary
 * @returns {Promise<Object>} - Inventory summary
 */
async function getInventorySummary() {
    return apiRequest('/inventory/summary');
}

/**
 * Get user notifications
 * @returns {Promise<Array>} - List of notifications
 */
async function getNotifications() {
    return apiRequest('/notifications');
}

/**
 * Mark all notifications as read
 * @returns {Promise<Object>} - Success response
 */
async function markAllNotificationsAsRead() {
    return apiRequest('/notifications/mark-read', {
        method: 'POST',
        body: JSON.stringify({ markAll: true })
    });
}

/**
 * Mark a specific notification as read
 * @param {number} notificationId - ID of the notification
 * @returns {Promise<Object>} - Success response
 */
async function markNotificationAsRead(notificationId) {
    return apiRequest('/notifications/mark-read', {
        method: 'POST',
        body: JSON.stringify({ notificationId })
    });
}

/**
 * Add a new item to inventory
 * @param {Object} item - Item data
 * @returns {Promise<Object>} - Created item
 */
async function addInventoryItem(item) {
    return apiRequest('/inventory/items', {
        method: 'POST',
        body: JSON.stringify(item)
    });
}

/**
 * Get recipe suggestions based on inventory
 * @returns {Promise<Array>} - List of recipe suggestions
 */
async function getRecipeSuggestions() {
    return apiRequest('/recipes/suggestions');
}

// Export all API functions
window.BiteBrightAPI = {
    getExpiringItems,
    getInventorySummary,
    getNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    addInventoryItem,
    getRecipeSuggestions
};