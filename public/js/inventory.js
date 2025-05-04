let items = [];
let currentFilter = "All";
let currentSort = "expiresInDays";
let currentEditId = null;

function calculateExpiresInDays(expiryDateStr) {
    const today = new Date();
    const expiryDate = new Date(expiryDateStr);
    return Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
}

function getExpireClass(days) {
    if (days <= 0) return "expire-today";
    if (days <= 3) return "expire-3days";
    if (days <= 7) return "expire-7days";
    return "expire-safe";
}

function getExpireText(days) {
    return days <= 0 ? "Expires: Today" : `Expires: In ${days} days`;
}

function changeSort() {
    currentSort = document.getElementById("sort-select").value;
    renderItems();
}

function renderFilterButtons(counts) {
    const filterBar = document.getElementById('filter-bar');
    filterBar.innerHTML = '';
    const categories = ["All", "ExpiredComing", "Dairy", "Produce", "Meat", "Pantry"];

    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.dataset.category = cat;
        btn.textContent = `${cat} (${counts[cat] || 0})`;
        if (currentFilter === cat) btn.classList.add('active');
        btn.onclick = () => setFilter(cat);
        filterBar.appendChild(btn);
    });
}

function renderItems() {
    const container = document.getElementById('items-container');
    container.innerHTML = '';

    const searchText = document.getElementById('search-input').value.toLowerCase();
    const counts = { All: 0, Dairy: 0, Produce: 0, Meat: 0, Pantry: 0, ExpiredComing: 0 };

    items.forEach(item => {
        const expiresInDays = calculateExpiresInDays(item.expiryDate);
        counts.All++;
        if (expiresInDays <= 7) counts.ExpiredComing++;
        counts[item.category]++;
    });

    const filtered = items.filter(item => {
        const expiresInDays = calculateExpiresInDays(item.expiryDate);
        const matchesFilter = currentFilter === "All" || (currentFilter === "ExpiredComing" && expiresInDays <= 7) || item.category === currentFilter;
        return matchesFilter && (item.name.toLowerCase().includes(searchText) || item.size.toLowerCase().includes(searchText));
    });

    filtered.sort((a, b) => {
        const aDays = calculateExpiresInDays(a.expiryDate);
        const bDays = calculateExpiresInDays(b.expiryDate);
        return currentSort === "dateAdded" ? new Date(b.dateAdded) - new Date(a.dateAdded) : aDays - bDays;
    });

    renderFilterButtons(counts);

    filtered.forEach(item => createItem(container, item));
}

function createItem(parent, item) {
    const expiresInDays = calculateExpiresInDays(item.expiryDate);
    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = `
        <div class="item-info">
            <img src="#" alt="Image">
            <div class="item-info-text"><strong>${item.name}</strong><br>${item.size}</div>
        </div>
        <div class="item-actions">
            <div class="expire-tag ${getExpireClass(expiresInDays)}">${getExpireText(expiresInDays)}</div>
            <button class="edit-btn" onclick="openEditItem('${item.id}')">Edit</button>
        </div>
    `;
    parent.appendChild(div);
}

function setFilter(category) {
    currentFilter = category;
    renderItems();
}

async function fetchItems() {
    const res = await fetch("http://localhost:8080/api/items"); // backend (เปลี่ยน URL )
    items = await res.json();
    renderItems();
}

window.onload = () => fetchItems();

// ============ Add Item =============

function openAddItem() {
    document.getElementById('add-item-modal').style.display = 'flex';
}

function closeAddItem() {
    document.getElementById('add-item-modal').style.display = 'none';
    document.getElementById('item-name').value = '';
    document.getElementById('item-category').value = '';
    document.getElementById('item-size').value = '';
    document.getElementById('item-expiry').value = '';
}

async function saveItem() {
    const name = document.getElementById('item-name').value.trim();
    const category = document.getElementById('item-category').value;
    const size = document.getElementById('item-size').value.trim();
    const expiryDate = document.getElementById('item-expiry').value;

    if (!name || !category || !size || !expiryDate) return alert("Please fill all fields.");

    const newItem = { name, category, size, expiryDate, dateAdded: new Date().toISOString().split('T')[0] };

    await fetch("http://localhost:8080/api/items", { // Backend backend (เปลี่ยน URL )
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem)
    });

    closeAddItem();
    fetchItems();
}

// ============ Edit Item =============

function openEditItem(id) {
    const item = items.find(it => it.id == id);
    currentEditId = id;

    document.getElementById('edit-item-name').value = item.name;
    document.getElementById('edit-item-category').value = item.category;
    document.getElementById('edit-item-size').value = item.size;
    document.getElementById('edit-item-expiry').value = item.expiryDate;

    document.getElementById('edit-item-modal').style.display = 'flex';
}

function closeEditItem() {
    document.getElementById('edit-item-modal').style.display = 'none';
}

async function saveEditItem() {
    const name = document.getElementById('edit-item-name').value.trim();
    const category = document.getElementById('edit-item-category').value;
    const size = document.getElementById('edit-item-size').value.trim();
    const expiryDate = document.getElementById('edit-item-expiry').value;

    if (!name || !category || !size || !expiryDate) return alert("Please fill all fields.");

    const updatedItem = { name, category, size, expiryDate };

    await fetch(`http://localhost:8080/api/items/${currentEditId}`, { // Backend backend (เปลี่ยน URL )
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedItem)
    });

    closeEditItem();
    fetchItems();
}
