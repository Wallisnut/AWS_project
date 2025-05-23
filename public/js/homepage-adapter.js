document.addEventListener("DOMContentLoaded", async () => {
  await loadDashboardData();
});

async function loadDashboardData() {
  try {
    const inventoryData = await window.BiteBrightAPI.getInventoryItems();
    updateDashboard(inventoryData);
  } catch (error) {
    console.error("Error loading dashboard data:", error);
    showToast("Failed to load data. Please try again later.");
  }
}

function updateDashboard(data) {
  updateExpiringItems(data);
  updateInventorySummary(data);
  updateRecipeRecommendations(data);
}

function updateExpiringItems(data) {
  const container = document.querySelector(".expiring-items");
  if (!container || !data || !data.categories) {
    console.error("Invalid data or container:", { container, data });
    showToast("Failed to load expiring items.");
    return;
  }

  container.innerHTML = "";
  const allItems = Object.values(data.categories).flat();

  const today = getDateWithoutTime(new Date());
  const expiringItems = allItems
    .filter(item => parseDate(item.expiryDate) >= today)
    .sort((a, b) => parseDate(a.expiryDate) - parseDate(b.expiryDate))
    .slice(0, 4);

  expiringItems.forEach((item) => {
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

  if (expiringItems.length === 0) {
    const noItemsElement = document.createElement("div");
    noItemsElement.className = "no-items";
    noItemsElement.textContent = "No items in inventory";
    container.appendChild(noItemsElement);
  }
}

function updateInventorySummary(data) {
  if (!data || !data.categories) {
    console.error("Invalid inventory data:", data);
    showToast("Failed to load inventory summary.");
    return;
  }

  let totalItems = 0;
  Object.values(data.categories).flat().forEach((item) => {
    const quantity = parseInt(item.quantity);
    if (!isNaN(quantity)) {
      totalItems += quantity;
    }
  });

  const categoriesCount = Object.keys(data.categories).length;

  let expiringThisWeek = 0;
  const today = getDateWithoutTime(new Date());
  Object.values(data.categories).flat().forEach((item) => {
    const expiryDate = parseDate(item.expiryDate);
    const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    if (diffDays <= 7 && diffDays >= 0) {
      expiringThisWeek++;
    }
  });

  document.getElementById("total-items-count").textContent = totalItems;
  document.getElementById("categories-count").textContent = categoriesCount;
  document.getElementById("expiring-this-week-count").textContent = expiringThisWeek;
}

function updateRecipeRecommendations(data) {
  const recipeContainer = document.getElementById("recipe-list");
  if (!recipeContainer || recipeContainer.children.length > 0) return;

  window.BiteBrightAPI.getRecommendedRecipes().then((recipes) => {
    const availableIngredients = [];
    const today = getDateWithoutTime(new Date());

    Object.values(data.categories).flat().forEach((item) => {
      const expiryDate = parseDate(item.expiryDate);
      if (expiryDate >= today) {
        availableIngredients.push(item.name.toLowerCase());
      }
    });

    const filteredRecipes = recipes
      .filter((recipe) => {
        const ingredients = recipe.ingredients.map(
          (i) => i.S?.toLowerCase?.() || i.toLowerCase()
        );
        return ingredients.every((ing) => availableIngredients.includes(ing));
      })
      .slice(0, 3);

    filteredRecipes.forEach((recipe) => {
      renderRecipeCard(recipe);
    });
  });
}

function renderRecipeCard(recipe) {
  const recipeContainer = document.getElementById("recipe-list");
  const recipeDiv = document.createElement("div");
  recipeDiv.className = "recipe-card";

  const imageUrl = recipe.imageUrl || "";
  const cookingTime = recipe.time || "-";

  recipeDiv.innerHTML = `
    <div class="recipe-image" style="background-image: url('${imageUrl}')">
        <h4>${recipe.name}</h4>
    </div>
    <div class="recipe-details">
        <div class="recipe-time">
            <i class="far fa-clock"></i> ${cookingTime}
        </div>
        <div class="recipe-ingredients">
            <p>Ingredients :</p>
            <p>${recipe.ingredients.map((i) => i.S || i).join(", ")}</p>
        </div>
        <button class="view-recipe-btn">View Recipe</button>
    </div>
  `;

  recipeDiv.querySelector(".view-recipe-btn").addEventListener("click", () => {
    window.location.href = `recipe-detail.html?id=${recipe.recipeId?.S || recipe.id}`;
  });

  recipeContainer.appendChild(recipeDiv);
}

function parseDate(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return new Date();
  if (dateStr.includes("-")) {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d);
  } else {
    const [d, m, y] = dateStr.split("/").map(Number);
    const realYear = y >= 2500 ? y - 543 : y;
    return new Date(realYear, m - 1, d);
  }
}

function getDateWithoutTime(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getExpiryClass(dateStr) {
  const today = getDateWithoutTime(new Date());
  const expiryDate = getDateWithoutTime(parseDate(dateStr));
  const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "expiry-expired";
  if (diffDays === 0) return "expiry-today";
  if (diffDays <= 4) return "expiry-warning";
  if (diffDays <= 7) return "expiry-info";
  return "expiry-ok";
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
  const existingToast = document.querySelector(".toast");
  if (existingToast) existingToast.remove();

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;

  Object.assign(toast.style, {
    position: "fixed",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    color: "white",
    padding: "12px 20px",
    borderRadius: "8px",
    zIndex: 1000,
    transition: "opacity 0.5s",
  });

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}