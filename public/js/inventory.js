let dynamicCategories = [];

document.addEventListener('DOMContentLoaded', async function() {
    try {
        await loadInventoryData();
    } catch (error) {
        console.error('Failed to load inventory data:', error);
        showToast('Failed to load inventory data. Please try again later.');
    }

    const addItemBtn = document.querySelector(".add-item-btn");
    const overlay = document.getElementById("overlay");
    const cancelBtn = document.getElementById("cancel-btn");
    const addItemForm = document.getElementById("add-item-form");
    const expiryDateInput = document.getElementById("item-expiry");

    if (addItemBtn) {
        addItemBtn.addEventListener("click", () => {
            overlay.classList.add("active");
            document.body.style.overflow = "hidden";
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener("click", () => {
            overlay.classList.remove("active");
            document.body.style.overflow = "";
        });
    }

    if (overlay) {
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) {
                overlay.classList.remove("active");
                document.body.style.overflow = "";
            }
        });
    }

    if (addItemForm) {
        addItemForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const itemName = document.getElementById("item-name").value;
            const itemCategory = document.getElementById("item-category").value;
            const itemQuantity = document.getElementById("item-quantity").value;
            const itemExpiry = document.getElementById("item-expiry").value;

            const newItem = {
                name: itemName,
                category: itemCategory,
                quantity: itemQuantity,
                expiryDate: itemExpiry
            };

            try {
                const saveBtn = addItemForm.querySelector('.save-btn');
                saveBtn.textContent = 'Saving...';
                saveBtn.disabled = true;

                await window.BiteBrightAPI.addInventoryItem(newItem);

                showToast(`Item "${itemName}" has been added to your inventory.`);

                addItemForm.reset();
                overlay.classList.remove("active");
                document.body.style.overflow = "";

                await loadInventoryData();
                updateCategoryDropdowns();
            } catch (error) {
                console.error('Failed to add item:', error);
                showToast('Failed to add item. Please try again.');
            } finally {
                const saveBtn = addItemForm.querySelector('.save-btn');
                saveBtn.textContent = 'Save';
                saveBtn.disabled = false;
            }
        });
    }

    if (expiryDateInput) {
        expiryDateInput.addEventListener("click", () => {
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
    }

    setupCategoryTabs();
    setupEditButtons();
    setupSearchFilter();
});

// โหลดข้อมูล Inventory
async function loadInventoryData() {
    try {
        const inventoryData = await window.BiteBrightAPI.getInventoryItems();
        updateInventoryList(inventoryData);
        updateCategoryTabs(inventoryData);
    } catch (error) {
        console.error('Error loading inventory data:', error);
        throw error;
    }
}

// แสดงรายการ inventory + หมวดหมู่
function updateInventoryList(data) {
    if (!data || !data.categories) return;

    const inventoryList = document.querySelector('.inventory-list');
    if (!inventoryList) return;

    inventoryList.innerHTML = '';

    Object.entries(data.categories).forEach(([categoryName, items]) => {
        if (!items || items.length === 0) return;

        const categorySection = document.createElement('div');
        categorySection.className = 'category-section';
        categorySection.innerHTML = `<h2 class="category-title">${categoryName}</h2>`;

        items.forEach(item => {
            const expiryClass = getExpiryClass(item.expiryDate);
            const expiryText = getExpiryText(item.expiryDate);

            const itemElement = document.createElement('div');
            itemElement.className = 'inventory-item';
            itemElement.dataset.itemId = item.id;

            itemElement.innerHTML = `
                <div class="item-image" style="${item.imageUrl ? `background-image: url(${item.imageUrl})` : ''}"></div>
                <div class="item-details">
                    <h3 class="item-name">${item.name}</h3>
                    <p class="item-quantity">${item.quantity}</p>
                </div>
                <div class="item-expiry ${expiryClass}">${expiryText}</div>
                <button class="edit-btn">Edit</button>
            `;

            categorySection.appendChild(itemElement);
        });

        inventoryList.appendChild(categorySection);
    });

    setupEditButtons();
}

// อัปเดตตัวเลขหมวดหมู่
function updateCategoryTabs(data) {
    const categoryTabsContainer = document.querySelector('.category-tabs');

    // ดึงหมวดหมู่จาก data
    const categories = Object.keys(data.categories);
    dynamicCategories = categories;

    // ล้างปุ่มเก่า
    categoryTabsContainer.innerHTML = '';

    // ปุ่ม All
    const totalCount = Object.values(data.categories).flat().length;
    const allBtn = document.createElement('button');
    allBtn.className = 'category-tab active';
    allBtn.dataset.category = 'all';
    allBtn.innerText = `All Item (${totalCount})`;
    categoryTabsContainer.appendChild(allBtn);

    // ปุ่มตามหมวดหมู่จริง
    categories.forEach(category => {
        const count = data.categories[category].length;
        const btn = document.createElement('button');
        btn.className = 'category-tab';
        btn.dataset.category = category.toLowerCase();
        btn.innerText = `${category} (${count})`;
        categoryTabsContainer.appendChild(btn);
    });

    setupCategoryTabs();
    updateCategoryDropdowns();
}

function updateCategoryDropdowns() {
    const dropdowns = [document.getElementById('item-category'), document.getElementById('edit-item-category')];

    dropdowns.forEach(dropdown => {
        const selected = dropdown.value;
        dropdown.innerHTML = '<option value="">Select Category</option>';

        dynamicCategories.forEach(category => {
            const opt = document.createElement('option');
            opt.value = category;
            opt.textContent = category;

            if (category === selected) {
                opt.selected = true;
            }

            dropdown.appendChild(opt);
        });
    });
}

// การคลิกเลือกหมวดหมู่
function setupCategoryTabs() {
    const categoryTabs = document.querySelectorAll('.category-tab');

    categoryTabs.forEach(tab => {
        tab.addEventListener('click', async function() {
            categoryTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            const category = this.dataset.category;

            try {
                showToast(`Loading ${category} items...`);
                const filteredData = await window.BiteBrightAPI.getInventoryItemsByCategory(category);
                updateInventoryList(filteredData);
                updateCategoryTabs(allInventoryData);
            } catch (error) {
                console.error('Failed to filter inventory:', error);
                showToast('Failed to filter inventory. Please try again.');
            }
        });
    });
}

// Serch Inventory
function setupSearchFilter() {
    const searchInput = document.querySelector('.inventory-search');

    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
        const searchText = searchInput.value.trim().toLowerCase();

        const items = document.querySelectorAll('.inventory-item');

        items.forEach(item => {
            const itemName = item.querySelector('.item-name').textContent.toLowerCase();
            
            if (itemName.includes(searchText)) {
                item.style.display = ''; // แสดง
            } else {
                item.style.display = 'none'; // ซ่อน
            }
        });
    });
}

// ปุ่ม Edit
function setupEditButtons() {
    const editButtons = document.querySelectorAll('.edit-btn');

    editButtons.forEach(button => {
        button.removeEventListener('click', handleEditButtonClick);
        button.addEventListener('click', handleEditButtonClick);
    });
}

function handleEditButtonClick(event) {
    const inventoryItem = event.target.closest('.inventory-item');
    const itemId = inventoryItem ? inventoryItem.dataset.itemId : null;

    if (itemId) {
        const editOverlay = document.getElementById("edit-overlay");
        const editForm = document.getElementById("edit-item-form");

        // ดึงข้อมูลจาก item ที่เลือก
        const itemName = inventoryItem.querySelector('.item-name').textContent;
        const itemQuantity = inventoryItem.querySelector('.item-quantity').textContent;
        const expiryText = inventoryItem.querySelector('.item-expiry').textContent;
        const expiryDate = expiryText.split(' ').pop();

        const categorySection = inventoryItem.closest('.category-section');
        const categoryName = categorySection ? categorySection.querySelector('.category-title').textContent : '';

        // ใส่ข้อมูลลงฟอร์ม
        document.getElementById("edit-item-name").value = itemName;
        document.getElementById("edit-item-category").value = categoryName;
        document.getElementById("edit-item-quantity").value = itemQuantity;
        document.getElementById("edit-item-expiry").value = expiryDate;

        // เปิด overlay
        editOverlay.classList.add("active");
        document.body.style.overflow = "hidden";

        // ปิด overlay
        document.getElementById("edit-cancel-btn").onclick = () => {
            editOverlay.classList.remove("active");
            document.body.style.overflow = "";
        };

        // เมื่อ submit
        editForm.onsubmit = (e) => {
            e.preventDefault();
            showToast("Item updated (mock only)");
            editOverlay.classList.remove("active");
            document.body.style.overflow = "";
        };
    }
}

// Class expiry
function parseDate(dateStr) {
    const [day, month, year] = dateStr.split('/').map(Number);
    const realYear = year >= 2500 ? year - 543 : year;
    return new Date(Date.UTC(realYear, month - 1, day));
}

function getDateWithoutTime(date) {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

function getExpiryClass(dateStr) {
    const today = getDateWithoutTime(new Date());
    const expiryDate = getDateWithoutTime(parseDate(dateStr));
    const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'expiry-expired';
    if (diffDays === 0) return 'expiry-today';
    if (diffDays <= 4) return 'expiry-warning';
    if (diffDays <= 7) return 'expiry-info';
    return 'expiry-ok';
}

function getExpiryText(dateStr) {
    const today = getDateWithoutTime(new Date());
    const expiryDate = getDateWithoutTime(parseDate(dateStr));
    const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `Expired on ${dateStr}`;
    if (diffDays === 0) return `Expires: Today ${dateStr}`;
    if (diffDays <= 4) return `Expires: In ${diffDays} day(s) ${dateStr}`;
    if (diffDays <= 7) return `Expires: In ${diffDays} day(s) ${dateStr}`;
    return `Expires: In ${diffDays} day(s) ${dateStr}`;
}

// Toast Notification
function showToast(message) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

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
        setTimeout(() => {
            toast.remove();
        }, 500);
    }, 3000);
}