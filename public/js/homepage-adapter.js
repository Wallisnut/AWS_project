function parseDate(dateStr) {
    try {
        if (dateStr.includes('-')) {
            const [year, month, day] = dateStr.split('-').map(Number);
            return new Date(year, month - 1, day);
        } else if (dateStr.includes('/')) {
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

function updateExpiringItems(data) {
    const container = document.querySelector(".expiring-items");
    if (!container || !data || !data.categories) {
        console.error('Invalid data or container:', { container, data });
        showToast('Failed to load expiring items.');
        return;
    }

    container.innerHTML = "";
    const allItems = [];
    Object.values(data.categories).forEach((items) => {
        allItems.push(...items);
    });

    allItems.sort((a, b) => {
        const dateA = parseDate(a.expiryDate);
        const dateB = parseDate(b.expiryDate);
        return dateA - dateB;
    });

    const displayItems = allItems.slice(0, 4);

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

async function loadDashboardData() {
    try {
        const inventoryData = await window.BiteBrightAPI.getInventoryItems();
        updateExpiringItems(inventoryData);
        updateInventorySummary(inventoryData);

        const recipeContainer = document.getElementById("recipe-list");
        if (recipeContainer && recipeContainer.children.length === 0) {
            const recipes = await window.BiteBrightAPI.getRecommendedRecipes();
            console.log('Loaded recipes:', recipes);
        }
    } catch (error) {
        console.error("Error loading dashboard data:", error);
        showToast("Failed to load data. Please try again later.");
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    await loadDashboardData();
});
