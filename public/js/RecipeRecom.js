document.addEventListener("DOMContentLoaded", async () => {
    setupLogout();
    const recipeContainer = document.getElementById("recipe-list");

    const inventoryData = await window.BiteBrightAPI.getInventoryItems();
    const recipes = await window.BiteBrightAPI.getRecommendedRecipes();

    const availableIngredients = [];
    Object.values(inventoryData.categories).flat().forEach(item => {
        const expiryDate = parseDate(item.expiryDate);
        const today = getDateWithoutTime(new Date());

        if (expiryDate >= today) {
            availableIngredients.push(item.name.toLowerCase());
        }
    });

    const renderRecipeCard = (recipe) => {
        const recipeDiv = document.createElement("div");
        recipeDiv.className = "recipe-card";

        const imageUrl = recipe.imageUrl || '';
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
                    <p>${recipe.ingredients.map(i => i.S || i).join(", ")}</p>
                </div>
                <button class="view-recipe-btn">View Recipe</button>
            </div>
        `;

        const viewButton = recipeDiv.querySelector(".view-recipe-btn");
        viewButton.addEventListener("click", () => {
            window.location.href = `recipe-detail.html?id=${recipe.recipeId?.S || recipe.id}`;
        });

        recipeContainer.appendChild(recipeDiv);
    };

    recipes.forEach(recipe => {
        const ingredients = recipe.ingredients.map(i => i.S?.toLowerCase?.() || i.toLowerCase());
        const hasAll = ingredients.every(ing => availableIngredients.includes(ing));

        if (hasAll) {
            renderRecipeCard(recipe);
        }
    });
});

function parseDate(dateStr) {
    const [day, month, year] = dateStr.split('/').map(Number);
    const realYear = year >= 2500 ? year - 543 : year;
    return new Date(realYear, month - 1, day);
}

function getDateWithoutTime(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
