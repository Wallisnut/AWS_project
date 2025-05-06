document.addEventListener("DOMContentLoaded", async () => {
    const recipeContainer = document.getElementById("recipe-list");

    const inventoryData = await window.BiteBrightAPI.getInventoryItems();
    const recipes = await window.BiteBrightAPI.getRecipes();

    // เตรียม list ของวัตถุดิบที่ไม่หมดอายุ
    const availableIngredients = [];
    Object.values(inventoryData.categories).flat().forEach(item => {
        const expiryDate = parseDate(item.expiryDate);
        const today = getDateWithoutTime(new Date());

        if (expiryDate >= today) {
            availableIngredients.push(item.name.toLowerCase());
        }
    });

    // สร้าง HTML recipe card
    const renderRecipeCard = (recipe) => {
        const recipeDiv = document.createElement("div");
        recipeDiv.className = "recipe-card";
    
        recipeDiv.innerHTML = `
            <div class="recipe-image" style="background-image: url('${recipe.imageUrl || ''}')">
                <h4>${recipe.name}</h4>
            </div>
            <div class="recipe-details">
                <div class="recipe-time">
                    <i class="far fa-clock"></i> ${recipe.cookingTime}
                </div>
                <div class="recipe-ingredients">
                    <p>Ingredients :</p>
                    <p>${recipe.ingredients.join(", ")}</p>
                </div>
                <button class="view-recipe-btn">View Recipe</button>
            </div>
        `;
    
        // เมื่อกดปุ่ม View Recipe
        const viewButton = recipeDiv.querySelector(".view-recipe-btn");
        viewButton.addEventListener("click", () => {
            // เปลี่ยนหน้านี้ไปยัง recipe-detail.html โดยส่ง id recipe ไปด้วย
            window.location.href = `recipe-detail.html?id=${recipe.id}`;
        });
    
        recipeContainer.appendChild(recipeDiv);
    };    

    // กรองเฉพาะเมนูที่วัตถุดิบครบเท่านั้น
    recipes.forEach(recipe => {
        const total = recipe.ingredients.length;
        const have = recipe.ingredients.filter(ing => availableIngredients.includes(ing.toLowerCase())).length;

        if (have === total) {
            renderRecipeCard(recipe);
        }
    });
});

// Helper function
function parseDate(dateStr) {
    const [day, month, year] = dateStr.split('/').map(Number);
    const realYear = year >= 2500 ? year - 543 : year;
    return new Date(realYear, month - 1, day);
}

function getDateWithoutTime(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
