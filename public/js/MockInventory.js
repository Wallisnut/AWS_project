/**
 * BiteBright API Service (Final Mock Version)
 * Mock data updated to test expiry status colors and categories
 */

window.BiteBrightAPI = {};

const mockData = {
    inventory: {
        categories: {
            'Dairy': [
                { id: 1, name: 'Milk', quantity: '1 Gallon', expiryDate: '05/05/2568', imageUrl: '' }, // Today
                { id: 2, name: 'Cheese', quantity: '500g', expiryDate: '10/05/2568', imageUrl: '' },  // 5 days
            ],
            'Produce': [
                { id: 3, name: 'Tomatoes', quantity: '1kg', expiryDate: '02/05/2568', imageUrl: '' }, // Expired
                { id: 4, name: 'Broccoli', quantity: '300g', expiryDate: '14/05/2568', imageUrl: '' }, // 3 days
                { id: 5, name: 'Spinach', quantity: '200g', expiryDate: '20/05/2568', imageUrl: '' }   // 15 days
            ],
            'Meat': [
                { id: 6, name: 'Chicken Breast', quantity: '400g', expiryDate: '04/05/2568', imageUrl: '' }, // Yesterday
                { id: 7, name: 'Beef Steak', quantity: '500g', expiryDate: '09/05/2568', imageUrl: '' },     // 4-5 days
            ],
            'Pentry': [
                { id: 8, name: 'Rice', quantity: '5kg', expiryDate: '01/06/2568', imageUrl: '' },       // Far future
                { id: 9, name: 'Canned Tuna', quantity: '3 cans', expiryDate: '30/05/2568', imageUrl: '' }, // Future
            ]
        }
    }
};

// Global inventory summary (optional use)
mockData.inventorySummary = {
    totalItems: Object.values(mockData.inventory.categories).flat().length,
    categories: Object.keys(mockData.inventory.categories).length,
    expiringThisWeek: Object.values(mockData.inventory.categories).flat().filter(item => {
        const today = getDateWithoutTime(new Date());
        const expiry = getDateWithoutTime(parseDate(item.expiryDate));
        const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 7;
    }).length
};

// --- API Mock Functions ---

window.BiteBrightAPI.getInventoryItems = function() {
    return simulateApiCall(mockData.inventory);
};

window.BiteBrightAPI.getInventoryItemsByCategory = function(category) {
    if (category === 'all') {
        return simulateApiCall(mockData.inventory);
    }
    
    const filteredInventory = { categories: {} };
    const matchingCategory = Object.keys(mockData.inventory.categories).find(
        cat => cat.toLowerCase() === category.toLowerCase()
    );

    if (matchingCategory) {
        filteredInventory.categories[matchingCategory] = mockData.inventory.categories[matchingCategory];
    }
    return simulateApiCall(filteredInventory);
};

window.BiteBrightAPI.addInventoryItem = function(item) {
    const newId = Math.max(...Object.values(mockData.inventory.categories)
        .flat()
        .map(item => item.id)) + 1;

    const newItem = {
        id: newId,
        name: item.name,
        quantity: item.quantity,
        expiryDate: item.expiryDate,
        imageUrl: ''
    };

    if (!mockData.inventory.categories[item.category]) {
        mockData.inventory.categories[item.category] = [];
    }
    mockData.inventory.categories[item.category].push(newItem);

    // Update summary
    mockData.inventorySummary.totalItems++;
    return simulateApiCall({ success: true, item: newItem });
};

// --- Helper Functions ---

function simulateApiCall(data, delay = 300) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(JSON.parse(JSON.stringify(data)));
        }, delay);
    });
}

function parseDate(dateStr) {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
}

function getDateWithoutTime(date) {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}


// ******  REAL API  ******

// window.BiteBrightAPI = {};

// // ดึงข้อมูล Inventory ทั้งหมด
// window.BiteBrightAPI.getInventoryItems = function() {
//     return fetch("https://your-backend-api.com/inventory")
//         .then(response => response.json());
// };

// // ดึงข้อมูล Inventory ตามหมวดหมู่
// window.BiteBrightAPI.getInventoryItemsByCategory = function(category) {
//     const url = category === 'all'
//         ? "https://your-backend-api.com/inventory"
//         : `https://your-backend-api.com/inventory?category=${encodeURIComponent(category)}`;

//     return fetch(url)
//         .then(response => response.json());
// };

// // เพิ่มสินค้าใหม่
// window.BiteBrightAPI.addInventoryItem = function(item) {
//     return fetch("https://your-backend-api.com/inventory", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json"
//         },
//         body: JSON.stringify(item)
//     }).then(response => response.json());
// };

// // อัปเดตสินค้า (optional ถ้าต้องการ)
// window.BiteBrightAPI.updateInventoryItem = function(itemId, updatedItem) {
//     return fetch(`https://your-backend-api.com/inventory/${itemId}`, {
//         method: "PUT",
//         headers: {
//             "Content-Type": "application/json"
//         },
//         body: JSON.stringify(updatedItem)
//     }).then(response => response.json());
// };

// // ลบสินค้า (optional ถ้าต้องการ)
// window.BiteBrightAPI.deleteInventoryItem = function(itemId) {
//     return fetch(`https://your-backend-api.com/inventory/${itemId}`, {
//         method: "DELETE"
//     }).then(response => response.json());
// };

// console.log("BiteBright API Connected to Backend (REAL API)");
