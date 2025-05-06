document.addEventListener('DOMContentLoaded', function() {
    // Favorite button functionality
    const favoriteBtn = document.getElementById('favoriteBtn');
    let isFavorite = true; // Set to true initially since it's shown as active in the image
    
    if (favoriteBtn) {
        // Set initial state
        if (isFavorite) {
            favoriteBtn.classList.add('active');
            favoriteBtn.classList.remove('inactive');
        } else {
            favoriteBtn.classList.add('inactive');
            favoriteBtn.classList.remove('active');
        }
        
        favoriteBtn.addEventListener('click', async function() {
            isFavorite = !isFavorite;
            
            try {
                // In a real app, this would call an API to toggle favorite status
                // For now, we'll just simulate it
                // Example API call: await toggleRecipeFavorite(recipeId, isFavorite);
                
                if (isFavorite) {
                    favoriteBtn.classList.add('active');
                    favoriteBtn.classList.remove('inactive');
                    showToast('Added to favorites');
                } else {
                    favoriteBtn.classList.add('inactive');
                    favoriteBtn.classList.remove('active');
                    showToast('Removed from favorites');
                }
            } catch (error) {
                console.error('Failed to update favorite status:', error);
                showToast('Failed to update favorite status. Please try again.');
                
                // Revert UI state on error
                isFavorite = !isFavorite;
                if (isFavorite) {
                    favoriteBtn.classList.add('active');
                    favoriteBtn.classList.remove('inactive');
                } else {
                    favoriteBtn.classList.add('inactive');
                    favoriteBtn.classList.remove('active');
                }
            }
        });
    }
    
    // Checkbox functionality
    const checkboxes = document.querySelectorAll('.ingredients-list input[type="checkbox"]');
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const ingredientText = this.parentElement.querySelector('.ingredient-text');
            
            if (this.checked) {
                ingredientText.style.textDecoration = 'line-through';
                ingredientText.style.color = '#888';
            } else {
                ingredientText.style.textDecoration = 'none';
                ingredientText.style.color = '#333';
            }
        });
    });
    
    // Back button functionality
    const backButton = document.querySelector('.back-button a');
    
    if (backButton) {
        backButton.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'Homepage.html';
        });
    }
});

/**
 * Toggle recipe favorite status (Mock API function)
 * @param {number} recipeId - Recipe ID
 * @param {boolean} isFavorite - New favorite status
 * @returns {Promise<Object>} - API response
 */
async function toggleRecipeFavorite(recipeId, isFavorite) {
    // This would be implemented in api-service.js in a real app
    // For now, we'll just simulate an API call
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                recipeId: recipeId,
                isFavorite: isFavorite
            });
        }, 300);
    });
}

// Toast notification function if not already defined in script.js
let showToast; // Declare showToast

if (typeof showToast !== 'function') {
    showToast = function(message) {
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
}