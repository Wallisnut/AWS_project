/**
 * recipe.js
 * จัดการการแสดงผลสูตรอาหารใน recipe-detail.html
 */

async function loadRecipeData() {
    const recipeTitle = document.querySelector('.recipe-title');
    const recipeImageContainer = document.querySelector('.recipe-image-container');
    const ingredientsList = document.querySelector('.ingredients-list');
    const directionsList = document.querySelector('.directions-list');

    recipeTitle.textContent = 'Loading recipe...';
    recipeImageContainer.innerHTML = '<div class="loading">Loading recipe image...</div>';
    ingredientsList.innerHTML = '<li class="loading">Loading ingredients...</li>';
    directionsList.innerHTML = '<li class="loading">Loading directions...</li>';

    try {
        const urlParams = new URLSearchParams(window.location.search);
        const selectedId = urlParams.get("id");

        const recipes = await window.BiteBrightAPI.getRecommendedRecipes();
        console.log('Loaded recipes:', recipes);

        const recipe = recipes.find(r => r.id === selectedId);

        if (!recipe) {
            recipeTitle.textContent = 'Recipe not found';
            showToast('Recipe not found.');
            return;
        }

        const name = recipe.name;
        const imageUrl = recipe.imageUrl;
        const detail = recipe.detail;
        const ingredientsRaw = recipe.ingredients || [];

        recipeTitle.textContent = name;
        recipeImageContainer.innerHTML = `
            <img src="${imageUrl}" alt="${name} dish" class="recipe-image">
        `;

        ingredientsList.innerHTML = '';
        if (ingredientsRaw.length === 0) {
            ingredientsList.innerHTML = '<li>No ingredients available.</li>';
        } else {
            ingredientsRaw.forEach(ingredient => {
                const ing = ingredient.S || ingredient;
                const li = document.createElement('li');
                li.innerHTML = `
                    <label class="checkbox-container">
                        <input type="checkbox" class="ingredient-checkbox">
                        <span class="checkmark"></span>
                        <span class="ingredient-text">${ing}</span>
                    </label>
                `;
                ingredientsList.appendChild(li);
            });
        }

        directionsList.innerHTML = '';
        let steps = [];
        if (!detail) {
            steps = ['No directions available.'];
        } else if (typeof detail === 'string') {
            steps = detail.split(/\d+\.\s*/).map(s => s.trim()).filter(s => s);
        } else if (Array.isArray(detail)) {
            steps = detail.map(step => step.replace(/^\d+\.\s*/, '').trim()).filter(s => s);
        } else {
            steps = ['No directions available.'];
        }

        steps.forEach(step => {
            const li = document.createElement('li');
            li.textContent = step;
            directionsList.appendChild(li);
        });

        await checkIngredientsInInventory(ingredientsRaw);
        setupFavoriteButton(recipe.id);

    } catch (error) {
        console.error('Error loading recipe data:', error);
        recipeTitle.textContent = 'Error Loading Recipe';
        recipeImageContainer.innerHTML = '<div class="error">Failed to load recipe image.</div>';
        ingredientsList.innerHTML = '<li>Failed to load ingredients.</li>';
        directionsList.innerHTML = '<li>Failed to load directions.</li>';
        showToast('Failed to load recipe.');
    }
}

async function checkIngredientsInInventory(ingredients) {
    try {
        const inventoryData = await window.BiteBrightAPI.getInventoryItems();
        const availableIngredients = [];
        Object.values(inventoryData.categories).forEach(items => {
            items.forEach(item => {
                availableIngredients.push(item.name.toLowerCase());
            });
        });

        const ingredientElements = document.querySelectorAll('.checkbox-container');
        ingredientElements.forEach(element => {
            const ingredientText = element.querySelector('.ingredient-text').textContent.toLowerCase();
            const ingredientName = ingredientText.replace(/^\d+(\.\d+)?\s*(g|kg|tbsp|tsp|ml|heads?|cloves?)\s*/i, '').trim();
            const checkbox = element.querySelector('.ingredient-checkbox');
            if (availableIngredients.includes(ingredientName)) {
                checkbox.checked = true;
                element.querySelector('.ingredient-text').style.color = '#4caf50';
            } else {
                checkbox.checked = false;
                element.querySelector('.ingredient-text').style.color = '#d32f2f';
            }
        });
    } catch (error) {
        console.error('Error checking inventory:', error);
        showToast('Failed to check inventory.');
    }
}

function setupFavoriteButton(recipeId) {
    const favoriteBtn = document.getElementById('favoriteBtn');
    if (!favoriteBtn) return;

    const isFavorite = localStorage.getItem(`favorite_${recipeId}`) === 'true';
    if (isFavorite) favoriteBtn.classList.add('active');

    favoriteBtn.addEventListener('click', () => {
        const isNowFavorite = !favoriteBtn.classList.contains('active');
        favoriteBtn.classList.toggle('active');
        localStorage.setItem(`favorite_${recipeId}`, isNowFavorite);
        showToast(isNowFavorite ? 'Added to favorites!' : 'Removed from favorites.');
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadRecipeData();
});
