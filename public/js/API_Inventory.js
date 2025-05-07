if (!window.BiteBrightAPI) {
    window.BiteBrightAPI = {};
}

// Helper - ดึง userId
function getUserId() {
    const userId = localStorage.getItem("userId");
    if (!userId) throw new Error("No userId found. Please login first.");
    return userId;
}

// วัตถุดิบ (Inventory)

// GET inventory
window.BiteBrightAPI.getInventoryItems = async function () {
    const userId = getUserId();

    const response = await fetch("https://7sqyy6hp1j.execute-api.us-east-1.amazonaws.com/bitebright/ingredients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
    });

    if (!response.ok) throw new Error("Failed to fetch ingredients.");

    const result = await response.json();

    // ตรวจสอบว่า result เป็น array หรือไม่
    const items = Array.isArray(result) ? result : (result.items || []);

    const categories = {};
    items.forEach(item => {
        if (!categories[item.category]) categories[item.category] = [];
        categories[item.category].push(item);
    });

    return { categories };
};

// ADD inventory
window.BiteBrightAPI.addInventoryItem = async function (item) {
    const userId = getUserId();

    const response = await fetch("https://7sqyy6hp1j.execute-api.us-east-1.amazonaws.com/bitebright/ingredients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            userId,
            name: item.name,
            category: item.category,
            quantity: item.quantity,
            expiryDate: item.expiryDate
        })
    });

    if (!response.ok) throw new Error("Failed to add item.");

    return response.json();
};

// DELETE inventory
window.BiteBrightAPI.deleteInventoryItem = async function (ingredientId) {
    const userId = getUserId();

    const response = await fetch("https://7sqyy6hp1j.execute-api.us-east-1.amazonaws.com/bitebright/ingredients", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            userId,
            ingredientId
        })
    });

    if (!response.ok) throw new Error("Failed to delete item.");

    return response.json();
};

// เช็ควันหมดอายุ
window.BiteBrightAPI.checkExpiringItems = async function () {
    const response = await fetch("https://7sqyy6hp1j.execute-api.us-east-1.amazonaws.com/bitebright/ingredients/checkexpiring");

    if (!response.ok) throw new Error("Failed to check expiring items.");

    return response.json();
};

// แนะนำเมนู (recommendMenu)
window.BiteBrightAPI.getRecommendedRecipes = async function () {
    const userId = getUserId();

    const url = `https://7sqyy6hp1j.execute-api.us-east-1.amazonaws.com/bitebright/ingredients/recommendMenu?userId=${userId}`;

    const response = await fetch(url, { method: "GET" });

    if (!response.ok) throw new Error("Failed to fetch recommended recipes.");

    return response.json();
};

// window.BiteBrightAPI.getRecipes = async function () {
//     const userId = localStorage.getItem("userId");
//     if (!userId) throw new Error("No userId found. Please login first.");

//     const response = await fetch(`https://7sqyy6hp1j.execute-api.us-east-1.amazonaws.com/bitebright/ingredients/recommendMenu?userId=${userId}`, {
//         method: "GET",
//     });

//     if (!response.ok) throw new Error("Failed to fetch recommended recipes.");

//     return response.json();
// };
