document.addEventListener("DOMContentLoaded", () => {
    loadData();
});

function loadData() {
    // backend
    fetch("https://mockapi.io/api/inventory")
        .then(res => res.json())
        .then(inventory => {
            // backend
            fetch("https://mockapi.io/api/recipes")
                .then(res => res.json())
                .then(recipes => processRecipes(inventory, recipes))
                .catch(() => showError("Failed to load recipes"));
        })
        .catch(() => showError("Failed to load inventory"));
}

function showError(message) {
    document.getElementById("recipes-soon").innerHTML = `<p>${message}</p>`;
    document.getElementById("recipes-based").innerHTML = `<p>${message}</p>`;
}

function processRecipes(inventory, recipes) {
    const today = new Date();
    const soonExpire = [];
    const basedOnInventory = [];

    recipes.forEach(recipe => {
        let hasSoonExpire = false;

        recipe.ingredients.forEach(ingredient => {
            const found = inventory.find(inv => inv.name.toLowerCase() === ingredient.toLowerCase());

            if (found) {
                const expiryDate = new Date(found.expiry);
                const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

                if (diffDays <= 7) {
                    hasSoonExpire = true;
                }
            }
        });

        if (hasSoonExpire) {
            soonExpire.push(recipe);
        } else {
            basedOnInventory.push(recipe);
        }
    });

    renderRecipes({ soonExpire, basedOnInventory });
}

function renderRecipes(data) {
    renderSection("recipes-soon", "Use Soon-to-Expire Ingredients", "Recipes that help you use ingredients that will expired soon", data.soonExpire);
    renderSection("recipes-based", "More Recipes Based on Your Inventory", "Recipes you can make with ingredients you have", data.basedOnInventory);
}

function renderSection(id, title, description, recipes) {
    const container = document.getElementById(id);
    container.innerHTML = `
        <h3>${title}</h3>
        <p>${description}</p>
        <div class="recipe-grid"></div>
    `;

    const grid = container.querySelector('.recipe-grid');

    if (recipes.length === 0) {
        grid.innerHTML = `<p>No recipes found.</p>`;
        return;
    }

    recipes.forEach(recipe => {
        const card = document.createElement("div");
        card.className = "recipe-card";

        card.innerHTML = `
            <img src="#" alt="Image">
            <h4>${recipe.name}</h4>
            <p>Ingredients: ${recipe.ingredients.join(", ")}</p>
            <p>🕒 ${recipe.time}</p>
            <div class="view-btn">View Recipe</div>
        `;

        grid.appendChild(card);
    });
}
