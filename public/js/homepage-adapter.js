document.addEventListener("DOMContentLoaded", async () => {
  await loadDashboardData();
});

async function loadDashboardData() {
  try {
    const inventoryData = await window.BiteBrightAPI.getInventoryItems();
    updateExpiringItems(inventoryData);
    updateInventorySummary(inventoryData);

    const expiringIngredients =
      await window.BiteBrightAPI.getExpiringIngredients();
    if (expiringIngredients.length > 0) {
      showNotification(expiringIngredients);
    }

    const recipeContainer = document.getElementById("recipe-list");
    if (recipeContainer && recipeContainer.children.length === 0) {
      const recipes = await window.BiteBrightAPI.getRecommendedRecipes();

      const availableIngredients = [];
      const today = getDateWithoutTime(new Date());

      Object.values(inventoryData.categories)
        .flat()
        .forEach((item) => {
          const expiryDate = parseDate(item.expiryDate);
          if (expiryDate >= today) {
            availableIngredients.push(item.name.toLowerCase());
          }
        });

      // ✅ แสดงเฉพาะ 3 เมนูแรกที่มีวัตถุดิบครบ
      const filteredRecipes = recipes
        .filter((recipe) => {
          const ingredients = recipe.ingredients.map(
            (i) => i.S?.toLowerCase?.() || i.toLowerCase(),
          );
          return ingredients.every((ing) => availableIngredients.includes(ing));
        })
        .slice(0, 3);

      filteredRecipes.forEach((recipe) => {
        renderRecipeCard(recipe);
      });
    }
  } catch (error) {
    console.error("Error loading dashboard data:", error);
    showToast("Failed to load data. Please try again later.");
  }
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

  const viewButton = recipeDiv.querySelector(".view-recipe-btn");
  viewButton.addEventListener("click", () => {
    window.location.href = `recipe-detail.html?id=${recipe.recipeId?.S || recipe.id}`;
  });

  recipeContainer.appendChild(recipeDiv);
}

function parseDate(dateStr) {
  try {
    if (dateStr.includes("-")) {
      const [year, month, day] = dateStr.split("-").map(Number);
      return new Date(year, month - 1, day);
    } else if (dateStr.includes("/")) {
      const [day, month, year] = dateStr.split("/").map(Number);
      const realYear = year >= 2500 ? year - 543 : year;
      return new Date(realYear, month - 1, day);
    } else {
      console.error("Invalid date format:", dateStr);
      return new Date();
    }
  } catch (error) {
    console.error("Error parsing date:", dateStr, error);
    return new Date();
  }
}

function getDateWithoutTime(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function updateExpiringItems(data) {
  const container = document.querySelector(".expiring-items");
  if (!container || !data || !data.categories) {
    console.error("Invalid data or container:", { container, data });
    showToast("Failed to load expiring items.");
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
    console.error("Invalid inventory data:", data);
    showToast("Failed to load inventory summary.");
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
  Object.values(data.categories)
    .flat()
    .forEach((item) => {
      const expiryDate = parseDate(item.expiryDate);
      const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
      if (diffDays <= 7 && diffDays >= 0) {
        expiringThisWeek++;
      }
    });

  const totalItemsElement = document.getElementById("total-items-count");
  const categoriesElement = document.getElementById("categories-count");
  const expiringThisWeekElement = document.getElementById(
    "expiring-this-week-count",
  );

  if (totalItemsElement) totalItemsElement.textContent = totalItems;
  if (categoriesElement) categoriesElement.textContent = categoriesCount;
  if (expiringThisWeekElement)
    expiringThisWeekElement.textContent = expiringThisWeek;
}

// Date Utilities
function parseDate(dateStr) {
  const [day, month, year] = dateStr.split("/").map(Number);
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

  toast.style.position = "fixed";
  toast.style.bottom = "20px";
  toast.style.left = "50%";
  toast.style.transform = "translateX(-50%)";
  toast.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
  toast.style.color = "white";
  toast.style.padding = "12px 20px";
  toast.style.borderRadius = "8px";
  toast.style.zIndex = "1000";
  toast.style.transition = "opacity 0.5s";

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => {
      toast.remove();
    }, 500);
  }, 3000);
}
