/**
 * recipe.js
 * จัดการการแสดงผลสูตรอาหารใน recipe-detail.html
 */
function showToast(message) {
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
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

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
        const recipes = await window.BiteBrightAPI.getRecommendedRecipes();
        console.log('Loaded recipes:', recipes);

        if (recipes.length === 0) {
            recipeTitle.textContent = 'No Recipe Available';
            recipeImageContainer.innerHTML = '<div class="error">No recipe image available.</div>';
            ingredientsList.innerHTML = '<li>No ingredients available.</li>';
            directionsList.innerHTML = '<li>No directions available.</li>';
            showToast('No recipes found.');
            return;
        }

        // เลือก recipe แรก
        const recipe = recipes[0];

        recipeTitle.textContent = recipe.name;
        recipeImageContainer.innerHTML = `
            <img src="${recipe.imageUrl}" alt="${recipe.name} dish" class="recipe-image">
        `;

        ingredientsList.innerHTML = '';
        if (!recipe.ingredients || recipe.ingredients.length === 0) {
            ingredientsList.innerHTML = '<li>No ingredients available.</li>';
        } else {
            recipe.ingredients.forEach(ingredient => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <label class="checkbox-container">
                        <input type="checkbox" class="ingredient-checkbox">
                        <span class="checkmark"></span>
                        <span class="ingredient-text">${ingredient}</span>
                    </label>
                `;
                ingredientsList.appendChild(li);
            });
        }

        directionsList.innerHTML = '';
        let steps = [];
        if (!recipe.detail) {
            steps = ['No directions available.'];
        } else if (typeof recipe.detail === 'string') {
            steps = recipe.detail.split(/\d+\.\s*/).map(s => s.trim()).filter(s => s);
        } else if (Array.isArray(recipe.detail)) {
            steps = recipe.detail.map(step => step.replace(/^\d+\.\s*/, '').trim()).filter(s => s);
        } else {
            steps = ['No directions available.'];
        }
        steps.forEach(step => {
            const li = document.createElement('li');
            li.textContent = step;
            directionsList.appendChild(li);
        });

        await checkIngredientsInInventory(recipe.ingredients || []);
        setupFavoriteButton(recipe.recipeId);

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
                checkbox.checked = true; // ติ๊ก checkbox ถ้ามีใน inventory
                element.querySelector('.ingredient-text').style.color = '#4caf50';
            } else {
                checkbox.checked = false; // ไม่ติ๊กถ้าไม่มี
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