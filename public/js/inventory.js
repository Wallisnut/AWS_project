let dynamicCategories = [];
let currentSort = "expired";

async function findExistingItem(name, category, expiryDate) {
    const inventoryData = await window.BiteBrightAPI.getInventoryItems();

    for (const items of Object.values(inventoryData.categories)) {
        for (const item of items) {
            if (item.name === name && item.category === category && item.expiryDate === expiryDate) {
                return item;
            }
        }
    }

    return null;
}

document.addEventListener('DOMContentLoaded', async function() {
    setupLogout();

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
    const sortButton = document.querySelector(".sort-button");

    if (sortButton) {
    sortButton.addEventListener("click", () => {
        if (currentSort === "expired") {
            currentSort = "added";
            sortButton.textContent = "Sort by: Date Added";
        } else {
            currentSort = "expired";
            sortButton.textContent = "Sort by: Date Expired";
        }

        // Reload inventory after changing sort
        loadInventoryData();
    });

    // Set default text
    sortButton.textContent = "Sort by: Date Expired";
    }

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
    function validateForm() {
        let isValid = true;

        const itemNameInput = document.getElementById("item-name");
        const itemCategoryInput = document.getElementById("item-category");
        const itemQuantityInput = document.getElementById("item-quantity");
        const itemExpiryInput = document.getElementById("item-expiry");
        const itemImageInput = document.getElementById("item-image");

        const inputs = [itemNameInput, itemCategoryInput, itemQuantityInput, itemExpiryInput];

        inputs.forEach(input => {
            input.classList.remove("input-error");
            const error = input.nextElementSibling;
            if (error && error.classList.contains("error-text")) {
                error.remove();
            }
        });

        // Check empty
        inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add("input-error");

            const errorText = document.createElement("div");
            errorText.className = "error-text";
            errorText.style.color = "red";
            errorText.style.marginTop = "4px";
            errorText.textContent = "This field is required.";
            input.parentNode.appendChild(errorText);
        }
        });

        // Check number only for quantity
        if (itemQuantityInput.value && !/^\d+$/.test(itemQuantityInput.value)) {
            isValid = false;
            itemQuantityInput.classList.add("input-error");

            const errorText = document.createElement("div");
            errorText.className = "error-text";
            errorText.style.color = "red";
            errorText.style.marginTop = "4px";
            errorText.textContent = "Quantity must be a number only.";
            itemQuantityInput.parentNode.appendChild(errorText);
        }

        //  Check Image ว่าต้องเลือก
        if (!itemImageInput.files || itemImageInput.files.length === 0) {
            isValid = false;
            itemImageInput.classList.add("input-error");

            const errorText = document.createElement("div");
            errorText.className = "error-text";
            errorText.style.color = "red";
            errorText.style.marginTop = "4px";
            errorText.textContent = "Please select an image.";
            itemImageInput.parentNode.appendChild(errorText);
        }
        return isValid;
    }

    // ฟังก์ชันนี้เพิ่มไว้เลยหลัง validateForm
    function setupInputValidation() {
        const inputs = document.querySelectorAll("#add-item-form input");

        inputs.forEach(input => {
            input.addEventListener("input", () => {
                input.classList.remove("input-error");
                const error = input.nextElementSibling;
                if (error && error.classList.contains("error-text")) {
                    error.remove();
                }
            });
        });
    }


    if (addItemForm) {
        addItemForm.addEventListener("submit", async (e) => {
            e.preventDefault();

             //  เช็ค Validate ก่อน
            if (!validateForm()) {
                return; // หยุดเลยถ้าผิด
            }

            const itemName = document.getElementById("item-name").value;
            const itemCategory = document.getElementById("item-category").value;
            const itemQuantity = document.getElementById("item-quantity").value;
            const itemExpiry = document.getElementById("item-expiry").value;

            const itemImageFile = document.getElementById("item-image").files[0];

            const newItem = {
                name: itemName,
                category: itemCategory,
                quantity: itemQuantity,
                expiryDate: itemExpiry,
                imageFile: itemImageFile
            };

            try {
                const saveBtn = addItemForm.querySelector('.save-btn');
                saveBtn.textContent = 'Saving...';
                saveBtn.disabled = true;

                // เพิ่มตรงนี้ → เช็คก่อนว่าซ้ำมั้ย
                const existingItem = await findExistingItem(itemName, itemCategory, itemExpiry);

                if (existingItem) {
                    const updatedQuantity = parseInt(existingItem.quantity) + parseInt(itemQuantity);

                    await window.BiteBrightAPI.editInventoryItem(existingItem.ingredientId, {
                        name: existingItem.name,
                        category: existingItem.category,
                        quantity: updatedQuantity,
                        expiryDate: existingItem.expiryDate
                    });

                    showToast(`Item "${itemName}" already exists. Quantity updated to ${updatedQuantity}.`);
                } else {
                    await window.BiteBrightAPI.addInventoryItem(newItem);
                    showToast(`Item "${itemName}" has been added to your inventory.`);
                }

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
    setupInputValidation();
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

function updateInventoryList(data) {
    if (!data || !data.categories) return;

    const inventoryList = document.querySelector('.inventory-list');
    if (!inventoryList) return;

    inventoryList.innerHTML = '';

    // รวม items ทั้งหมด
    const allItems = [];

    Object.entries(data.categories).forEach(([categoryName, items]) => {
        items.forEach(item => {
            allItems.push({
                ...item,
                _categoryName: categoryName // เก็บชื่อ category ไว้ด้วย
            });
        });
    });

    // Sort ตาม currentSort
    if (currentSort === "expired") {
        allItems.sort((a, b) => parseDate(a.expiryDate) - parseDate(b.expiryDate));
    } else {
        allItems.sort((a, b) => (a.ingredientId || "").localeCompare(b.ingredientId || ""));
    }

    // สร้าง group ตาม category อีกครั้ง
    const grouped = {};

    allItems.forEach(item => {
        if (!grouped[item._categoryName]) {
            grouped[item._categoryName] = [];
        }
        grouped[item._categoryName].push(item);
    });

    // Render
    Object.entries(grouped).forEach(([categoryName, items]) => {
        const categorySection = document.createElement('div');
        categorySection.className = 'category-section';
        categorySection.innerHTML = `<h2 class="category-title">${categoryName}</h2>`;

        items.forEach(item => {
            const expiryClass = getExpiryClass(item.expiryDate);
            const expiryText = getExpiryText(item.expiryDate);

            const itemElement = document.createElement('div');
            itemElement.className = 'inventory-item';
            itemElement.dataset.itemId = item.ingredientId || item.id || "";

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
    if (!categoryTabsContainer) {
        console.warn('Category tabs container not found. Skipping updateCategoryTabs.');
        return;
    }

    const categories = Object.keys(data.categories);
    dynamicCategories = categories;

    categoryTabsContainer.innerHTML = '';

    const totalCount = Object.values(data.categories).flat().length;
    const allBtn = document.createElement('button');
    allBtn.className = 'category-tab active';
    allBtn.dataset.category = 'all';
    allBtn.innerText = `All Item (${totalCount})`;
    categoryTabsContainer.appendChild(allBtn);

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
        if (!dropdown) return;
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

function setupCategoryTabs() {
    const categoryTabs = document.querySelectorAll('.category-tab');

    categoryTabs.forEach(tab => {
        tab.addEventListener('click', async function () {
            categoryTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            const selectedCategory = this.dataset.category;

            try {
                showToast(`Loading ${selectedCategory} items...`);
                const inventoryData = await window.BiteBrightAPI.getInventoryItems();

                if (selectedCategory === "all") {
                    updateInventoryList(inventoryData);
                } else {
                    const filtered = {};
                    const foundCategory = Object.keys(inventoryData.categories).find(cat => cat.toLowerCase() === selectedCategory);
                    if (foundCategory) {
                        filtered[foundCategory] = inventoryData.categories[foundCategory];
                    }
                    updateInventoryList({ categories: filtered });
                }
            } catch (error) {
                console.error('Failed to filter inventory:', error);
                showToast('Failed to filter inventory. Please try again.');
            }
        });
    });
}

// Search
function setupSearchFilter() {
    const searchInput = document.querySelector('.inventory-search');

    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
        const searchText = searchInput.value.trim().toLowerCase();

        const categorySections = document.querySelectorAll('.category-section');

        categorySections.forEach(section => {
            const items = section.querySelectorAll('.inventory-item');

            let hasVisibleItem = false;

            items.forEach(item => {
                const itemName = item.querySelector('.item-name').textContent.toLowerCase();

                if (itemName.includes(searchText)) {
                    item.style.display = '';
                    hasVisibleItem = true;
                } else {
                    item.style.display = 'none';
                }
            });

            // ✅ ซ่อน category เลยถ้าไม่มี item ที่ match
            if (hasVisibleItem) {
                section.style.display = '';
            } else {
                section.style.display = 'none';
            }
        });
    });
}

// Edit Item
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

        const itemName = inventoryItem.querySelector('.item-name').textContent;
        const itemQuantity = inventoryItem.querySelector('.item-quantity').textContent;
        const expiryText = inventoryItem.querySelector('.item-expiry').textContent;
        const expiryDate = expiryText.split(' ').pop();

        const categorySection = inventoryItem.closest('.category-section');
        const categoryName = categorySection ? categorySection.querySelector('.category-title').textContent : '';

        document.getElementById("edit-item-name").value = itemName;
        document.getElementById("edit-item-category").value = categoryName;
        document.getElementById("edit-item-quantity").value = itemQuantity;
        document.getElementById("edit-item-expiry").value = expiryDate;

        editOverlay.classList.add("active");
        document.body.style.overflow = "hidden";

        document.getElementById("edit-cancel-btn").onclick = () => {
            editOverlay.classList.remove("active");
            document.body.style.overflow = "";
        };

        editForm.onsubmit = async (e) => {
            e.preventDefault();
        
            const updatedItem = {
                name: document.getElementById("edit-item-name").value,
                category: document.getElementById("edit-item-category").value,
                quantity: document.getElementById("edit-item-quantity").value,
                expiryDate: document.getElementById("edit-item-expiry").value
            };
        
            try {
                await window.BiteBrightAPI.editInventoryItem(itemId, updatedItem);
        
                showToast("Item updated successfully");
        
                editOverlay.classList.remove("active");
                document.body.style.overflow = "";
        
                await loadInventoryData();
            } catch (error) {
                console.error("Failed to update item:", error);
                showToast("Failed to update item. Please try again.");
            }
        };
        
    }
}

// Date Utilities
function parseDate(dateStr) {
    const [day, month, year] = dateStr.split('/').map(Number);
    const realYear = year >= 2500 ? year - 543 : year;
    return new Date(realYear, month - 1, day);
}

function getDateWithoutTime(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
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
    return `Expires: In ${diffDays} day(s) ${dateStr}`;
}

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
        setTimeout(() => {
            toast.remove();
        }, 500);
    }, 3000);
}