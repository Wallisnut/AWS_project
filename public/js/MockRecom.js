// ****** Mock Data ******
if (!window.BiteBrightAPI) {
    window.BiteBrightAPI = {};
}

window.BiteBrightAPI.getRecipes = function() {
    return Promise.resolve([
        {
            id: 1,
            name: "Pad Kraprow",
            imageUrl: "",
            ingredients: ["Chicken", "Basil", "Garlic", "Chili", "Soy Sauce"],
            cookingTime: "20 mins"
        },
        {
            id: 2,
            name: "Vegetable Soup",
            imageUrl: "",
            ingredients: ["Carrots", "Broccoli", "Onion", "Bell Peppers", "Garlic"],
            cookingTime: "45 mins"
        }
    ]);
};

window.BiteBrightAPI.getInventoryItems = function() {
    return Promise.resolve({
        categories: {
            Vegetables: [
                { name: "Carrots", expiryDate: "10/05/2025" },
                { name: "Broccoli", expiryDate: "10/05/2025" },
                { name: "Onion", expiryDate: "10/05/2025" },
                { name: "Bell Peppers", expiryDate: "10/05/2025" },
                { name: "Garlic", expiryDate: "10/05/2025" }
            ],
            Meat: [
                { name: "Chicken", expiryDate: "10/05/2025" }
            ],
            Herbs: [
                { name: "Basil", expiryDate: "10/05/2025" },
                { name: "Chili", expiryDate: "10/05/2025" }
            ]
        }
    });
};

window.BiteBrightAPI.getNotifications = function() {
    return Promise.resolve([
        { type: "warning", text: "Tomatoes are expiring today!", time: "Just now" },
        { type: "info", text: "New recipe suggestions available", time: "2 hours ago" },
        { type: "success", text: "Inventory updated successfully", time: "Yesterday" }
    ]);
};

if (!window.BiteBrightAPI) {
    window.BiteBrightAPI = {};
}


// ******  REAL API  ******

// // ดึงสูตรอาหารจาก backend จริง
// window.BiteBrightAPI.getRecipes = async function() {
//     const response = await fetch("https://your-backend.com/api/recipes");
//     if (!response.ok) throw new Error("Failed to fetch recipes");
//     return await response.json();
// };

// // ดึงวัตถุดิบ inventory จาก backend จริง
// window.BiteBrightAPI.getInventoryItems = async function() {
//     const response = await fetch("https://your-backend.com/api/inventory");
//     if (!response.ok) throw new Error("Failed to fetch inventory items");
//     return await response.json();
// };

// // ดึง notifications จาก backend จริง
// window.BiteBrightAPI.getNotifications = async function() {
//     const response = await fetch("https://your-backend.com/api/notifications");
//     if (!response.ok) throw new Error("Failed to fetch notifications");
//     return await response.json();
// };

