/**
 * homepage-adapter.js
 * จัดการการโหลดข้อมูล inventory และอัปเดต UI ใน Homepage.html
 * ทำงานกับ API_Inventory.js เพื่อดึงและเพิ่ม item
 */

/**
 * แสดง toast message สำหรับแจ้งเตือนผู้ใช้
 * @param {string} message - ข้อความที่จะแสดง
 */
function showToast(message) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    toast.style.color = 'white';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '8px';
    toast.style.zIndex = '1000';
    toast.style.transition = 'opacity 0.5s';

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

/**
 * แปลงวันที่จาก string เป็น Date object
 * รองรับรูปแบบ dd/mm/yyyy และ yyyy-mm-dd
 * @param {string} dateStr - วันที่ในรูปแบบ string
 * @returns {Date} - Date object
 */
function parseDate(dateStr) {
    try {
        if (dateStr.includes('-')) {
            // รูปแบบ yyyy-mm-dd (จาก <input type="date">)
            const [year, month, day] = dateStr.split('-').map(Number);
            return new Date(year, month - 1, day);
        } else if (dateStr.includes('/')) {
            // รูปแบบ dd/mm/yyyy (จาก API หรือ input อื่น)
            const [day, month, year] = dateStr.split('/').map(Number);
            const realYear = year >= 2500 ? year - 543 : year;
            return new Date(realYear, month - 1, day);
        } else {
            console.error('Invalid date format:', dateStr);
            return new Date();
        }
    } catch (error) {
        console.error('Error parsing date:', dateStr, error);
        return new Date();
    }
}

/**
 * กำหนด CSS class ตามวันหมดอายุ
 * @param {string} dateStr - วันที่หมดอายุ
 * @returns {string} - CSS class
 */
function getExpiryClass(dateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiryDate = parseDate(dateStr);
    const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'expiry-today';
    if (diffDays <= 3) return 'expiry-soon';
    if (diffDays <= 6) return 'expiry-medium';
    return 'expiry-later';
}

/**
 * สร้างข้อความวันหมดอายุ
 * @param {string} dateStr - วันที่หมดอายุ
 * @returns {string} - ข้อความวันหมดอายุ
 */
function getExpiryText(dateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiryDate = parseDate(dateStr);
    const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return `Expires: Today (${dateStr})`;
    if (diffDays <= 3) return `Expires: 1-3 days (${dateStr})`;
    if (diffDays <= 6) return `Expires: 4-6 days (${dateStr})`;
    return `Expires: 7+ days (${dateStr})`;
}

/**
 * อัปเดตส่วน Expiring Soon ใน UI
 * @param {Object} data - ข้อมูล inventory { categories: { category: [items] } }
 */
function updateExpiringItems(data) {
    const container = document.querySelector(".expiring-items");
    if (!container || !data || !data.categories) {
        console.error('Invalid data or container:', { container, data });
        showToast('Failed to load expiring items.');
        return;
    }

    console.log('Inventory categories:', data.categories);
    container.innerHTML = "";
    const allItems = [];
    Object.values(data.categories).forEach((items) => {
        allItems.push(...items);
    });
    console.log('All items:', allItems);

    // Sort โดยวันที่หมดอายุ (จากใกล้ไปไกล)
    allItems.sort((a, b) => {
        const dateA = parseDate(a.expiryDate);
        const dateB = parseDate(b.expiryDate);
        return dateA - dateB;
    });

    // แสดง item 4 รายการล่าสุด
    const displayItems = allItems.slice(0, 4);
    console.log('Display items:', displayItems);

    displayItems.forEach((item) => {
        const expiryClass = getExpiryClass(item.expiryDate);
        const expiryText = getExpiryText(item.expiryDate);
        const itemElement = document.createElement("div");
        itemElement.className = "item";
        itemElement.innerHTML = `
            <div class="item-info">
                <div class="item-image" style="${item.imageUrl ? `background-image: url(${item.imageUrl})` : ""}"></div>
                <div class="item-details">
                    <p class="item-name">${item.name}</p>
                    <p class="item-quantity">${item.quantity} ${item.unit || "units"}</p>
                </div>
            </div>
            <div class="expiry-tag ${expiryClass}">${expiryText}</div>
        `;
        container.appendChild(itemElement);
    });

    if (displayItems.length === 0) {
        const noItemsElement = document.createElement("div");
        noItemsElement.className = "no-items";
        noItemsElement.textContent = "No items in inventory";
        container.appendChild(noItemsElement);
    }
}

/**
 * อัปเดตส่วน Inventory Summary ใน UI
 * @param {Object} data - ข้อมูล inventory { categories: { category: [items] } }
 */
function updateInventorySummary(data) {
    if (!data || !data.categories) {
        console.error('Invalid inventory data:', data);
        showToast('Failed to load inventory summary.');
        return;
    }

    let totalItems = 0;
    Object.values(data.categories).forEach((items) => {
        totalItems += items.length;
    });

    const categoriesCount = Object.keys(data.categories).length;

    let expiringThisWeek = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    Object.values(data.categories).flat().forEach((item) => {
        const expiryDate = parseDate(item.expiryDate);
        const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        if (diffDays <= 7 && diffDays >= 0) {
            expiringThisWeek++;
        }
    });

    const totalItemsElement = document.getElementById("total-items-count");
    const categoriesElement = document.getElementById("categories-count");
    const expiringThisWeekElement = document.getElementById("expiring-this-week-count");

    if (totalItemsElement) totalItemsElement.textContent = totalItems;
    if (categoriesElement) categoriesElement.textContent = categoriesCount;
    if (expiringThisWeekElement) expiringThisWeekElement.textContent = expiringThisWeek;
}

/**
 * ตรวจสอบว่า item มีอยู่ใน inventory หรือไม่
 * @param {string} name - ชื่อ item
 * @param {string} category - หมวดหมู่
 * @param {Object} inventoryData - ข้อมูล inventory
 * @returns {Object|null} - Item ที่พบหรือ null
 */
async function checkExistingItem(name, category) {
    try {
        const inventoryData = await window.BiteBrightAPI.getInventoryItems();
        const allItems = [];
        Object.values(inventoryData.categories).forEach((items) => {
            allItems.push(...items);
        });
        return allItems.find(
            (item) => item.name.toLowerCase() === name.toLowerCase() && item.category.toLowerCase() === category.toLowerCase()
        ) || null;
    } catch (error) {
        console.error('Error checking existing item:', error);
        return null;
    }
}

/**
 * โหลดข้อมูล inventory และ recipes จาก API
 */
async function loadDashboardData() {
    try {
        const inventoryData = await window.BiteBrightAPI.getInventoryItems();
        console.log('Loaded inventory data:', inventoryData);
        updateExpiringItems(inventoryData);
        updateInventorySummary(inventoryData);

        const recipeContainer = document.getElementById("recipe-list");
        if (recipeContainer && recipeContainer.children.length === 0) {
            const recipes = await window.BiteBrightAPI.getRecommendedRecipes();
            console.log('Loaded recipes:', recipes);
            // RecipeRecom.js จะจัดการการแสดงผล recipes
        }
    } catch (error) {
        console.error("Error loading dashboard data:", error);
        showToast("Failed to load data. Please try again later.");
    }
}

/**
 * จัดการการทำงานเมื่อหน้าโหลด
 */
document.addEventListener("DOMContentLoaded", async () => {
    const addItemForm = document.getElementById("add-item-form");
    const overlay = document.querySelector(".overlay");

    // ลบ event listener เดิม (ป้องกันการเพิ่มซ้ำ)
    const newForm = addItemForm.cloneNode(true);
    addItemForm.parentNode.replaceChild(newForm, addItemForm);

    // จัดการฟอร์ม Add Item
    if (newForm) {
        newForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const itemName = document.getElementById("item-name").value;
            const itemCategory = document.getElementById("item-category").value;
            const itemQuantity = document.getElementById("item-quantity").value;
            const itemExpiry = document.getElementById("item-expiry").value;
            const itemImageFile = document.getElementById("item-image").files[0];

            // ตรวจสอบ item ซ้ำ
            const existingItem = await checkExistingItem(itemName, itemCategory);
            if (existingItem) {
                showToast(`Item "${itemName}" in category "${itemCategory}" already exists. Please edit the existing item.`);
                return;
            }

            const newItem = {
                name: itemName,
                category: itemCategory,
                quantity: itemQuantity,
                expiryDate: itemExpiry,
                imageFile: itemImageFile,
            };

            try {
                const saveBtn = newForm.querySelector(".save-btn");
                saveBtn.textContent = "Saving...";
                saveBtn.disabled = true;

                const result = await window.BiteBrightAPI.addInventoryItem(newItem);
                console.log('Add item result:', result);
                showToast(`Item "${itemName}" has been added to your inventory.`);

                newForm.reset();
                overlay.classList.remove("active");
                document.body.style.overflow = "";

                await loadDashboardData(); // รีเฟรช UI
            } catch (error) {
                console.error("Failed to add item:", error);
                showToast("Failed to add item. Please try again.");
            } finally {
                const saveBtn = newForm.querySelector(".save-btn");
                saveBtn.textContent = "Save";
                saveBtn.disabled = false;
            }
        });
    }

    // โหลดข้อมูลเมื่อหน้าเริ่มต้น
    await loadDashboardData();
});