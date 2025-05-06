document.addEventListener('DOMContentLoaded', async function() {
    // Load data from API
    try {
        await loadDashboardData();
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
        showToast('Failed to load data. Please try again later.');
    }
  
    // Add Item button functionality
    const addItemBtn = document.querySelector(".add-item-btn");
    const overlay = document.getElementById("overlay");
    const cancelBtn = document.getElementById("cancel-btn");
    const addItemForm = document.getElementById("add-item-form");
    const expiryDateInput = document.getElementById("item-expiry");
  
    // Show overlay when Add Item button is clicked
    addItemBtn.addEventListener("click", () => {
        overlay.classList.add("active");
        document.body.style.overflow = "hidden"; // Prevent scrolling when overlay is active
    });
  
    // Hide overlay when Cancel button is clicked
    cancelBtn.addEventListener("click", () => {
        overlay.classList.remove("active");
        document.body.style.overflow = ""; // Re-enable scrolling
    });
  
    // Hide overlay when clicking outside the modal
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
            overlay.classList.remove("active");
            document.body.style.overflow = ""; // Re-enable scrolling
        }
    });
  
    // Handle form submission
    addItemForm.addEventListener("submit", async (e) => {
        e.preventDefault();
  
        // Get form values
        const itemName = document.getElementById("item-name").value;
        const itemCategory = document.getElementById("item-category").value;
        const itemQuantity = document.getElementById("item-quantity").value;
        const itemExpiry = document.getElementById("item-expiry").value;
  
        // Create item object
        const newItem = {
            name: itemName,
            category: itemCategory,
            quantity: itemQuantity,
            expiryDate: itemExpiry
        };
  
        try {
            // Show loading state
            const saveBtn = addItemForm.querySelector('.save-btn');
            const originalText = saveBtn.textContent;
            saveBtn.textContent = 'Saving...';
            saveBtn.disabled = true;
  
            // Call API to add item
            const result = await window.BiteBrightAPI.addInventoryItem(newItem);
            
            // Show success message
            showToast(`Item "${itemName}" has been added to your inventory.`);
            
            // Reset form and close overlay
            addItemForm.reset();
            overlay.classList.remove("active");
            document.body.style.overflow = ""; // Re-enable scrolling
            
            // Reload dashboard data to show the new item
            await loadDashboardData();
        } catch (error) {
            console.error('Failed to add item:', error);
            showToast('Failed to add item. Please try again.');
        } finally {
            // Reset button state
            const saveBtn = addItemForm.querySelector('.save-btn');
            saveBtn.textContent = 'Save';
            saveBtn.disabled = false;
        }
    });
  
    // Simple date picker functionality
    expiryDateInput.addEventListener("click", () => {
        // In a real application, you would use a proper date picker library
        // For this example, we'll use a simple prompt
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
  
    // View all expiring items
    const viewAllLink = document.querySelector('.view-all a');
    if (viewAllLink) {
        viewAllLink.addEventListener('click', function(e) {
            e.preventDefault();
            showToast('Viewing all expiring items');
            // In a real app, this would navigate to a full list view
        });
    }
  
    // Explore more recipes
    const exploreMoreBtn = document.querySelector('.explore-more-btn');
    if (exploreMoreBtn) {
        exploreMoreBtn.addEventListener('click', async function() {
            showToast('Loading more recipes...');
            // In a real app, this would load more recipes or navigate to a recipes page
        });
    }
  });
  
  /**
  * Load all dashboard data from APIs
  */
  async function loadDashboardData() {
    // Load data in parallel for better performance
    const [expiringItems, inventorySummary, recipeSuggestions] = await Promise.all([
        window.BiteBrightAPI.getExpiringItems(),
        window.BiteBrightAPI.getInventorySummary(),
        window.BiteBrightAPI.getRecipeSuggestions()
    ]);
  
    // Update expiring items section
    updateExpiringItems(expiringItems);
    
    // Update inventory summary
    updateInventorySummary(inventorySummary);
    
    // Update recipe suggestions
    updateRecipeSuggestions(recipeSuggestions);
  }
  
  /**
  * Update the expiring items section with data from API
  * @param {Array} items - Expiring items from API
  */
  function updateExpiringItems(items) {
    const container = document.querySelector('.expiring-items');
    if (!container || !items || items.length === 0) return;
  
    // Clear existing items
    container.innerHTML = '';
  
    // Add items from API
    items.forEach(item => {
        const expiryClass = getExpiryClass(item.expiryDate);
        const expiryText = getExpiryText(item.expiryDate);
        
        const itemElement = document.createElement('div');
        itemElement.className = 'item';
        itemElement.innerHTML = `
            <div class="item-info">
                <div class="item-image" style="${item.imageUrl ? `background-image: url(${item.imageUrl})` : ''}"></div>
                <div class="item-details">
                    <p class="item-name">${item.name}</p>
                    <p class="item-quantity">${item.quantity}</p>
                </div>
            </div>
            <div class="expiry-tag ${expiryClass}">${expiryText}</div>
        `;
        
        container.appendChild(itemElement);
    });
  }
  
  /**
  * Update the inventory summary section with data from API
  * @param {Object} summary - Inventory summary from API
  */
  function updateInventorySummary(summary) {
    if (!summary) return;
    
    const totalItemsElement = document.querySelector('.summary-item:nth-child(1) .count');
    const categoriesElement = document.querySelector('.summary-item:nth-child(2) .count');
    const expiringThisWeekElement = document.querySelector('.summary-item:nth-child(3) .count');
    
    if (totalItemsElement) totalItemsElement.textContent = summary.totalItems;
    if (categoriesElement) categoriesElement.textContent = summary.categories;
    if (expiringThisWeekElement) expiringThisWeekElement.textContent = summary.expiringThisWeek;
  }
  
  /**
  * Update recipe suggestions with data from API
  * @param {Array} recipes - Recipe suggestions from API
  */
  function updateRecipeSuggestions(recipes) {
    const container = document.querySelector('.recipe-cards');
    if (!container || !recipes || recipes.length === 0) return;
    
    // Clear existing recipes
    container.innerHTML = '';
    
    // Add recipes from API
    recipes.forEach(recipe => {
        const recipeElement = document.createElement('div');
        recipeElement.className = 'recipe-card';
        
        const ingredientsText = recipe.ingredients ? recipe.ingredients.join(', ') : '......';
        
        recipeElement.innerHTML = `
            <div class="recipe-image" style="background-image: url('${recipe.imageUrl || ''}');">
                <h4>${recipe.name}</h4>
            </div>
            <div class="recipe-details">
                <div class="recipe-time">
                    <i class="far fa-clock"></i> ${recipe.cookTime || 'X Minutes'}
                </div>
                <div class="recipe-ingredients">
                    <p>Ingredients :</p>
                    <p>${ingredientsText}</p>
                </div>
                <a href="Pad_Kra_phaoRecipe.html">
                    <button class="view-recipe-btn">View Recipe</button>
                </a>
            </div>
        `;
        
        container.appendChild(recipeElement);
    });
  }
  
  /**
  * Get CSS class for expiry tag based on date
  * @param {string} dateStr - Date string in dd/mm/yyyy format
  * @returns {string} - CSS class name
  */
  function getExpiryClass(dateStr) {
    const today = new Date();
    const expiryDate = parseDate(dateStr);
    
    const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'expiry-today';
    if (diffDays <= 3) return 'expiry-soon';
    if (diffDays <= 6) return 'expiry-medium';
    return 'expiry-later';
  }
  
  /**
  * Get expiry text based on date
  * @param {string} dateStr - Date string in dd/mm/yyyy format
  * @returns {string} - Expiry text
  */
  function getExpiryText(dateStr) {
    const today = new Date();
    const expiryDate = parseDate(dateStr);
    
    const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return `Expires : Today (${dateStr})`;
    if (diffDays <= 3) return `Expires : 1-3 days (${dateStr})`;
    if (diffDays <= 6) return `Expires : 4+ day (${dateStr})`;
    return `Expires : 7+ day (${dateStr})`;
  }
  
  /**
  * Parse date from dd/mm/yyyy format
  * @param {string} dateStr - Date string in dd/mm/yyyy format
  * @returns {Date} - Date object
  */
  function parseDate(dateStr) {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  }
  
  /**
  * Show toast notification
  * @param {string} message - Message to display
  */
  function showToast(message) {
    // Check if a toast already exists and remove it
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    
    // Add to document
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        
        setTimeout(() => {
            toast.remove();
        }, 500);
    }, 3000);
  }