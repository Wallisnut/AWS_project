// Add Item button functionality
const addItemBtn = document.querySelector(".add-item-btn")
const overlay = document.getElementById("overlay")
const cancelBtn = document.getElementById("cancel-btn")
const addItemForm = document.getElementById("add-item-form")
const expiryDateInput = document.getElementById("item-expiry")

// Show overlay when Add Item button is clicked
addItemBtn.addEventListener("click", () => {
  overlay.classList.add("active")
  document.body.style.overflow = "hidden" // Prevent scrolling when overlay is active
})

// Hide overlay when Cancel button is clicked
cancelBtn.addEventListener("click", () => {
  overlay.classList.remove("active")
  document.body.style.overflow = "" // Re-enable scrolling
})

// Hide overlay when clicking outside the modal
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) {
    overlay.classList.remove("active")
    document.body.style.overflow = "" // Re-enable scrolling
  }
})

// Handle form submission
addItemForm.addEventListener("submit", (e) => {
  e.preventDefault()

  // Get form values
  const itemName = document.getElementById("item-name").value
  const itemCategory = document.getElementById("item-category").value
  const itemQuantity = document.getElementById("item-quantity").value
  const itemExpiry = document.getElementById("item-expiry").value

  // Here you would typically save the data to your database
  console.log("Item added:", {
    name: itemName,
    category: itemCategory,
    quantity: itemQuantity,
    expiry: itemExpiry,
  })

  // Show success message
  alert(`Item "${itemName}" has been added to your inventory.`)

  // Reset form and close overlay
  addItemForm.reset()
  overlay.classList.remove("active")
  document.body.style.overflow = "" // Re-enable scrolling
})

// Simple date picker functionality
expiryDateInput.addEventListener("click", () => {
  // In a real application, you would use a proper date picker library
  // For this example, we'll use a simple prompt
  const today = new Date()
  const day = String(today.getDate()).padStart(2, "0")
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const year = today.getFullYear()
  const formattedDate = `${day}/${month}/${year}`

  const selectedDate = prompt("Enter expiry date (dd/mm/yyyy):", formattedDate)
  if (selectedDate) {
    expiryDateInput.value = selectedDate
  }
})
