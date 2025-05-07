/**
 * BiteBright API Service
 * 
 * ไฟล์นี้มี mock API functions ที่จะถูกแทนที่ด้วย API calls จริงเมื่อรวมกับ backend
 * Frontend developers สามารถใช้ฟังก์ชันเหล่านี้ได้เลย และ backend developers
 * สามารถพัฒนา API endpoints ที่มีโครงสร้าง request/response เดียวกันนี้
 */

const API_BASE_URL = 'https://7sqyy6hp1j.execute-api.us-east-1.amazonaws.com/bitebright'; // URL จริงของ API

// ข้อมูลผู้ใช้ปัจจุบัน (จะถูกเก็บใน localStorage ในแอพจริง)
let currentUser = {
    userId: null,
    username: null
};

/**
 * ฟังก์ชัน API request ทั่วไปพร้อมการจัดการข้อผิดพลาด
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} - Response data
 */
async function apiRequest(endpoint, options = {}) {
    // ในการใช้งานจริง นี่จะเป็น API call จริงๆ
    // สำหรับตอนนี้ เราจะจำลองความล่าช้าของเครือข่าย
    const mockDelay = Math.random() * 300 + 200; // 200-500ms delay
    
    // ตั้งค่า headers เริ่มต้น
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`
        }
    };
    
    const requestOptions = { ...defaultOptions, ...options };
    
    try {
        // ในการใช้งานจริง นี่จะเป็น:
        // const response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);
        
        // สำหรับการจำลอง เราจะจำลองการตอบกลับ
        await new Promise(resolve => setTimeout(resolve, mockDelay));
        
        // ตรวจสอบว่าเรามีข้อมูลจำลองสำหรับ endpoint นี้หรือไม่
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
 * รับ auth token จาก localStorage
 * @returns {string} - Auth token
 */
function getAuthToken() {
    return localStorage.getItem('authToken') || 'mock-auth-token';
}

/**
 * สร้างการตอบกลับจำลองตาม endpoint และ request
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Request options
 * @returns {Object} - Mock response
 */
function getMockResponse(endpoint, options) {
    // ข้อมูลจำลองสำหรับ endpoints ต่างๆ
    const mockData = {
        // User endpoints
        '/login': {
            data: {
                userId: 'user123',
                username: 'Sudlhor'
            }
        },
        '/register': {
            data: {
                message: 'Signup successful.',
                userId: 'user123'
            }
        },
        
        // Ingredients endpoints
        '/ingredients': {
            data: [
                {
                    userId: 'user123',
                    ingredientId: '1',
                    name: 'Tomatoes',
                    quantity: 500,
                    expiryDate: getTodayDate()
                },
                {
                    userId: 'user123',
                    ingredientId: '2',
                    name: 'Chicken Breast',
                    quantity: 2,
                    expiryDate: getDateOffset(2)
                },
                {
                    userId: 'user123',
                    ingredientId: '3',
                    name: 'Milk',
                    quantity: 1,
                    expiryDate: getDateOffset(4)
                },
                {
                    userId: 'user123',
                    ingredientId: '4',
                    name: 'Eggs',
                    quantity: 6,
                    expiryDate: getDateOffset(7)
                }
            ]
        },
        '/ingredients/checkexpiring': {
            data: [
                {
                    userId: 'user123',
                    ingredientId: '1',
                    name: 'Tomatoes',
                    quantity: 500,
                    expiryDate: getTodayDate(),
                    category: 'Vegetables',
                    imageUrl: '/img/tomato.jpg'
                },
                {
                    userId: 'user123',
                    ingredientId: '2',
                    name: 'Chicken Breast',
                    quantity: 2,
                    expiryDate: getDateOffset(2),
                    category: 'Meat',
                    imageUrl: '/img/chicken.jpg'
                }
            ]
        },
        '/ingredients/summary': {
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
        '/ingredients/recommendMenu': {
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
    
    // จัดการกับ POST requests
    if (options.method === 'POST') {
        if (endpoint === '/login') {
            // จำลองการเข้าสู่ระบบ
            const body = JSON.parse(options.body);
            if (body.username === 'Sudlhor' && body.password === 'password') {
                currentUser = {
                    userId: 'user123',
                    username: 'Sudlhor'
                };
                localStorage.setItem('userId', currentUser.userId);
                localStorage.setItem('username', currentUser.username);
                return {
                    data: {
                        userId: currentUser.userId,
                        username: currentUser.username
                    }
                };
            } else {
                return { error: 'Invalid username or password' };
            }
        }
        
        if (endpoint === '/register') {
            // จำลองการลงทะเบียน
            const body = JSON.parse(options.body);
            if (!body.username || !body.email || !body.password) {
                return { error: 'All fields are required' };
            }
            currentUser = {
                userId: 'user123',
                username: body.username
            };
            localStorage.setItem('userId', currentUser.userId);
            localStorage.setItem('username', currentUser.username);
            return {
                data: {
                    message: 'Signup successful.',
                    userId: currentUser.userId
                }
            };
        }
        
        if (endpoint === '/ingredients') {
            // จำลองการเพิ่มวัตถุดิบใหม่
            const newItem = JSON.parse(options.body);
            return {
                data: {
                    userId: currentUser.userId || 'user123',
                    ingredientId: Date.now().toString(),
                    ...newItem,
                    createdAt: new Date().toISOString()
                }
            };
        }
    }
    
    // จัดการกับ DELETE requests
    if (options.method === 'DELETE') {
        if (endpoint === '/ingredients') {
            // จำลองการลบวัตถุดิบ
            return {
                data: {
                    message: 'Ingredient deleted successfully'
                }
            };
        }
    }
    
    // ส่งคืนข้อมูลจำลองสำหรับ endpoint หรือ 404
    return mockData[endpoint] || { error: 'Endpoint not found' };
}

/**
 * รับวันที่ปัจจุบันในรูปแบบ dd/mm/yyyy
 * @returns {string} - วันที่ที่จัดรูปแบบแล้ว
 */
function getTodayDate() {
    const today = new Date();
    return formatDate(today);
}

/**
 * รับวันที่ที่มีการเลื่อนในรูปแบบ dd/mm/yyyy
 * @param {number} days - จำนวนวันที่จะเพิ่ม
 * @returns {string} - วันที่ที่จัดรูปแบบแล้ว
 */
function getDateOffset(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return formatDate(date);
}

/**
 * จัดรูปแบบวันที่เป็น dd/mm/yyyy
 * @param {Date} date - วันที่ที่จะจัดรูปแบบ
 * @returns {string} - วันที่ที่จัดรูปแบบแล้ว
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
 * ลงทะเบียนผู้ใช้ใหม่
 * @param {Object} userData - ข้อมูลผู้ใช้
 * @returns {Promise<Object>} - ข้อมูลผู้ใช้ที่สร้างขึ้น
 */
async function register(userData) {
    return apiRequest('/register', {
        method: 'POST',
        body: JSON.stringify(userData)
    });
}

/**
 * เข้าสู่ระบบ
 * @param {string} username - ชื่อผู้ใช้
 * @param {string} password - รหัสผ่าน
 * @returns {Promise<Object>} - ข้อมูลผู้ใช้
 */
async function login(username, password) {
    return apiRequest('/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
    });
}

/**
 * ออกจากระบบ
 * @returns {Promise<Object>} - ข้อความยืนยัน
 */
async function logout() {
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('authToken');
    currentUser = { userId: null, username: null };
    return { success: true, message: 'Logged out successfully' };
}

/**
 * รับวัตถุดิบที่กำลังจะหมดอายุ
 * @returns {Promise<Array>} - รายการวัตถุดิบที่กำลังจะหมดอายุ
 */
async function getExpiringItems() {
    return apiRequest('/ingredients/checkexpiring');
}

/**
 * รับข้อมูลสรุปของวัตถุดิบ
 * @returns {Promise<Object>} - ข้อมูลสรุปของวัตถุดิบ
 */
async function getInventorySummary() {
    return apiRequest('/ingredients/summary');
}

/**
 * รับการแจ้งเตือนของผู้ใช้
 * @returns {Promise<Array>} - รายการการแจ้งเตือน
 */
async function getNotifications() {
    return apiRequest('/notifications');
}

/**
 * ทำเครื่องหมายการแจ้งเตือนทั้งหมดว่าอ่านแล้ว
 * @returns {Promise<Object>} - การตอบสนองสำเร็จ
 */
async function markAllNotificationsAsRead() {
    return apiRequest('/notifications/mark-read', {
        method: 'POST',
        body: JSON.stringify({ markAll: true })
    });
}

/**
 * ทำเครื่องหมายการแจ้งเตือนเฉพาะว่าอ่านแล้ว
 * @param {number} notificationId - ID ของการแจ้งเตือน
 * @returns {Promise<Object>} - การตอบสนองสำเร็จ
 */
async function markNotificationAsRead(notificationId) {
    return apiRequest('/notifications/mark-read', {
        method: 'POST',
        body: JSON.stringify({ notificationId })
    });
}

/**
 * เพิ่มวัตถุดิบใหม่ลงในคลัง
 * @param {Object} item - ข้อมูลวัตถุดิบ
 * @returns {Promise<Object>} - วัตถุดิบที่สร้างขึ้น
 */
async function addInventoryItem(item) {
    const userId = localStorage.getItem('userId') || 'user123';
    return apiRequest('/ingredients', {
        method: 'POST',
        body: JSON.stringify({
            userId,
            name: item.name,
            quantity: item.quantity,
            expiryDate: item.expiryDate
        })
    });
}

/**
 * รับวัตถุดิบทั้งหมดของผู้ใช้
 * @returns {Promise<Array>} - รายการวัตถุดิบ
 */
async function getAllIngredients() {
    const userId = localStorage.getItem('userId') || 'user123';
    return apiRequest('/ingredients', {
        method: 'GET',
        body: JSON.stringify({ userId })
    });
}

/**
 * ลบวัตถุดิบ
 * @param {string} ingredientId - ID ของวัตถุดิบ
 * @returns {Promise<Object>} - การตอบสนองสำเร็จ
 */
async function deleteIngredient(ingredientId) {
    const userId = localStorage.getItem('userId') || 'user123';
    return apiRequest('/ingredients', {
        method: 'DELETE',
        body: JSON.stringify({ userId, ingredientId })
    });
}

/**
 * รับคำแนะนำเมนูอาหารตามวัตถุดิบ
 * @returns {Promise<Array>} - รายการคำแนะนำเมนูอาหาร
 */
async function getRecipeSuggestions() {
    return apiRequest('/ingredients/recommendMenu');
}

// ส่งออกฟังก์ชัน API ทั้งหมด
window.BiteBrightAPI = {
    register,
    login,
    logout,
    getExpiringItems,
    getInventorySummary,
    getNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    addInventoryItem,
    getAllIngredients,
    deleteIngredient,
    getRecipeSuggestions
};