document.addEventListener('DOMContentLoaded', async function() {
    // ตรวจสอบการเข้าสู่ระบบ
    checkLogin();
    
    // โหลดข้อมูลจาก API
    try {
        await loadDashboardData();
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
        showToast('Failed to load data. Please try again later.');
    }
  
    // ฟังก์ชันปุ่ม Add Item
    const addItemBtn = document.querySelector(".add-item-btn");
    const overlay = document.getElementById("overlay");
    const cancelBtn = document.getElementById("cancel-btn");
    const addItemForm = document.getElementById("add-item-form");
    const expiryDateInput = document.getElementById("item-expiry");
  
    // แสดง overlay เมื่อคลิกปุ่ม Add Item
    addItemBtn.addEventListener("click", () => {
        overlay.classList.add("active");
        document.body.style.overflow = "hidden"; // ป้องกันการเลื่อนเมื่อ overlay ทำงาน
    });
  
    // ซ่อน overlay เมื่อคลิกปุ่ม Cancel
    cancelBtn.addEventListener("click", () => {
        overlay.classList.remove("active");
        document.body.style.overflow = ""; // เปิดใช้งานการเลื่อนอีกครั้ง
    });
  
    // ซ่อน overlay เมื่อคลิกนอกโมดัล
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
            overlay.classList.remove("active");
            document.body.style.overflow = ""; // เปิดใช้งานการเลื่อนอีกครั้ง
        }
    });
  
    // จัดการการส่งแบบฟอร์ม
    addItemForm.addEventListener("submit", async (e) => {
        e.preventDefault();
  
        // รับค่าจากแบบฟอร์ม
        const itemName = document.getElementById("item-name").value;
        const itemCategory = document.getElementById("item-category").value;
        const itemQuantity = document.getElementById("item-quantity").value;
        const itemExpiry = document.getElementById("item-expiry").value;
  
        // สร้างออบเจ็กต์วัตถุดิบ
        const newItem = {
            name: itemName,
            category: itemCategory,
            quantity: itemQuantity,
            expiryDate: itemExpiry
        };
  
        try {
            // แสดงสถานะการโหลด
            const saveBtn = addItemForm.querySelector('.save-btn');
            const originalText = saveBtn.textContent;
            saveBtn.textContent = 'Saving...';
            saveBtn.disabled = true;
  
            // เรียก API เพื่อเพิ่มวัตถุดิบ
            const result = await window.BiteBrightAPI.addInventoryItem(newItem);
            
            // แสดงข้อความสำเร็จ
            showToast(`Item "${itemName}" has been added to your inventory.`);
            
            // รีเซ็ตแบบฟอร์มและปิด overlay
            addItemForm.reset();
            overlay.classList.remove("active");
            document.body.style.overflow = ""; // เปิดใช้งานการเลื่อนอีกครั้ง
            
            // โหลดข้อมูลแดชบอร์ดอีกครั้งเพื่อแสดงวัตถุดิบใหม่
            await loadDashboardData();
        } catch (error) {
            console.error('Failed to add item:', error);
            showToast('Failed to add item. Please try again.');
        } finally {
            // รีเซ็ตสถานะปุ่ม
            const saveBtn = addItemForm.querySelector('.save-btn');
            saveBtn.textContent = 'Save';
            saveBtn.disabled = false;
        }
    });
  
    // ฟังก์ชันตัวเลือกวันที่อย่างง่าย
    expiryDateInput.addEventListener("click", () => {
        // ในแอปพลิเคชันจริง คุณจะใช้ไลบรารีตัวเลือกวันที่ที่เหมาะสม
        // สำหรับตัวอย่างนี้ เราจะใช้ prompt อย่างง่าย
        const today = new Date();
        const day = String(today.getDate()).padStart(2, "0");
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const year = today.getFullYear();
        const formattedDate = `${day}/${month}/${year}`;
  
        const selectedDate = prompt("Enter expiry date (dd/mm/yyyy):", formattedDate);
        if (selectedDate) {
            expiryDateInput.value = selectedDate;
        }
    });
  
    // ดูวัตถุดิบที่กำลังจะหมดอายุทั้งหมด
    const viewAllLink = document.querySelector('.view-all a');
    if (viewAllLink) {
        viewAllLink.addEventListener('click', function(e) {
            e.preventDefault();
            showToast('Viewing all expiring items');
            // ในแอปพลิเคชันจริง นี่จะนำทางไปยังมุมมองรายการเต็ม
        });
    }
  
    // สำรวจเมนูเพิ่มเติม
    const exploreMoreBtn = document.querySelector('.explore-more-btn');
    if (exploreMoreBtn) {
        exploreMoreBtn.addEventListener('click', async function() {
            showToast('Loading more recipes...');
            // ในแอปพลิเคชันจริง นี่จะโหลดเมนูเพิ่มเติมหรือนำทางไปยังหน้าเมนู
        });
    }
});

/**
 * ตรวจสอบการเข้าสู่ระบบ
 */
function checkLogin() {
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    
    if (!userId || !username) {
        // ในแอปพลิเคชันจริง นี่จะนำทางไปยังหน้าเข้าสู่ระบบ
        // window.location.href = 'login.html';
        
        // สำหรับการจำลอง เราจะตั้งค่าผู้ใช้เริ่มต้น
        localStorage.setItem('userId', 'user123');
        localStorage.setItem('username', 'Sudlhor');
    }
    
    // อัปเดตชื่อผู้ใช้ในหน้า
    const welcomeSection = document.querySelector('.welcome-section h2');
    if (welcomeSection) {
        welcomeSection.textContent = `Welcome back, ${username || 'Sudlhor'}!`;
    }
    
    // อัปเดตข้อมูลผู้ใช้ในเมนูผู้ใช้
    const userNameElement = document.querySelector('.user-name');
    if (userNameElement) {
        userNameElement.textContent = username || 'Sudlhor';
    }
    
    const userEmailElement = document.querySelector('.user-email');
    if (userEmailElement) {
        userEmailElement.textContent = `${username || 'sudlhor'}@example.com`;
    }
}

/**
 * โหลดข้อมูลแดชบอร์ดทั้งหมดจาก API
 */
async function loadDashboardData() {
    // โหลดข้อมูลแบบขนานเพื่อประสิทธิภาพที่ดีขึ้น
    const [expiringItems, inventorySummary, recipeSuggestions] = await Promise.all([
        window.BiteBrightAPI.getExpiringItems(),
        window.BiteBrightAPI.getInventorySummary(),
        window.BiteBrightAPI.getRecipeSuggestions()
    ]);
  
    // อัปเดตส่วนวัตถุดิบที่กำลังจะหมดอายุ
    updateExpiringItems(expiringItems);
    
    // อัปเดตข้อมูลสรุปคลัง
    updateInventorySummary(inventorySummary);
    
    // อัปเดตคำแนะนำเมนู
    updateRecipeSuggestions(recipeSuggestions);
}

/**
 * อัปเดตส่วนวัตถุดิบที่กำลังจะหมดอายุด้วยข้อมูลจาก API
 * @param {Array} items - วัตถุดิบที่กำลังจะหมดอายุจาก API
 */
function updateExpiringItems(items) {
    const container = document.querySelector('.expiring-items');
    if (!container || !items || items.length === 0) return;
  
    // ล้างวัตถุดิบที่มีอยู่
    container.innerHTML = '';
  
    // เพิ่มวัตถุดิบจาก API
    items.forEach(item => {
        const expiryClass = getExpiryClass(item.expiryDate);
        const expiryText = getExpiryText(item.expiryDate);
        
        const itemElement = document.createElement('div');
        itemElement.className = 'item';
        itemElement.innerHTML = `
            <div class="item-info">
                <div class="item-image" style="${item.imageUrl ? `background-image: url(${item.imageUrl})` : ''}"></div>
                <div class="item-details">
                    <p class="item-name">${item.name}</p>
                    <p class="item-quantity">${item.quantity} ${item.unit || 'units'}</p>
                </div>
            </div>
            <div class="expiry-tag ${expiryClass}">${expiryText}</div>
        `;
        
        container.appendChild(itemElement);
    });
}

/**
 * อัปเดตส่วนข้อมูลสรุปคลังด้วยข้อมูลจาก API
 * @param {Object} summary - ข้อมูลสรุปคลังจาก API
 */
function updateInventorySummary(summary) {
    if (!summary) return;
    
    const totalItemsElement = document.querySelector('.summary-item:nth-child(1) .count');
    const categoriesElement = document.querySelector('.summary-item:nth-child(2) .count');
    const expiringThisWeekElement = document.querySelector('.summary-item:nth-child(3) .count');
    
    if (totalItemsElement) totalItemsElement.textContent = summary.totalItems;
    if (categoriesElement) categoriesElement.textContent = summary.categories;
    if (expiringThisWeekElement) expiringThisWeekElement.textContent = summary.expiringThisWeek;
}

/**
 * อัปเดตคำแนะนำเมนูด้วยข้อมูลจาก API
 * @param {Array} recipes - คำแนะนำเมนูจาก API
 */
function updateRecipeSuggestions(recipes) {
    const container = document.querySelector('.recipe-cards');
    if (!container || !recipes || recipes.length === 0) return;
    
    // ล้างเมนูที่มีอยู่
    container.innerHTML = '';
    
    // เพิ่มเมนูจาก API
    recipes.forEach(recipe => {
        const recipeElement = document.createElement('div');
        recipeElement.className = 'recipe-card';
        
        const ingredientsText = recipe.ingredients ? recipe.ingredients.join(', ') : '......';
        
        recipeElement.innerHTML = `
            <div class="recipe-image" style="background-image: url('${recipe.imageUrl || ''}');">
                <h4>${recipe.name}</h4>
            </div>
            <div class="recipe-details">
                <div class="recipe-time">
                    <i class="far fa-clock"></i> ${recipe.cookTime || 'X Minutes'}
                </div>
                <div class="recipe-ingredients">
                    <p>Ingredients :</p>
                    <p>${ingredientsText}</p>
                </div>
                <a href="Pad_Kra_phaoRecipe.html">
                    <button class="view-recipe-btn">View Recipe</button>
                </a>
            </div>
        `;
        
        container.appendChild(recipeElement);
    });
}

/**
 * รับคลาส CSS สำหรับแท็กวันหมดอายุตามวันที่
 * @param {string} dateStr - สตริงวันที่ในรูปแบบ dd/mm/yyyy
 * @returns {string} - ชื่อคลาส CSS
 */
function getExpiryClass(dateStr) {
    const today = new Date();
    const expiryDate = parseDate(dateStr);
    
    const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'expiry-today';
    if (diffDays <= 3) return 'expiry-soon';
    if (diffDays <= 6) return 'expiry-medium';
    return 'expiry-later';
}

/**
 * รับข้อความวันหมดอายุตามวันที่
 * @param {string} dateStr - สตริงวันที่ในรูปแบบ dd/mm/yyyy
 * @returns {string} - ข้อความวันหมดอายุ
 */
function getExpiryText(dateStr) {
    const today = new Date();
    const expiryDate = parseDate(dateStr);
    
    const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return `Expires : Today (${dateStr})`;
    if (diffDays <= 3) return `Expires : 1-3 days (${dateStr})`;
    if (diffDays <= 6) return `Expires : 4+ day (${dateStr})`;
    return `Expires : 7+ day (${dateStr})`;
}

/**
 * แยกวิเคราะห์วันที่จากรูปแบบ dd/mm/yyyy
 * @param {string} dateStr - สตริงวันที่ในรูปแบบ dd/mm/yyyy
 * @returns {Date} - วัตถุวันที่
 */
function parseDate(dateStr) {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
}

/**
 * แสดงการแจ้งเตือนแบบ toast
 * @param {string} message - ข้อความที่จะแสดง
 */
function showToast(message) {
    // ตรวจสอบว่ามี toast อยู่แล้วและลบออก
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // สร้างองค์ประกอบ toast
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    
    // เพิ่มลงในเอกสาร
    document.body.appendChild(toast);
    
    // ลบหลังจาก 3 วินาที
    setTimeout(() => {
        toast.style.opacity = '0';
        
        setTimeout(() => {
            toast.remove();
        }, 500);
    }, 3000);
}
