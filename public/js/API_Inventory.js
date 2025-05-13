if (!window.BiteBrightAPI) {
  window.BiteBrightAPI = {};
}

// Helper - ดึง userId
function getUserId() {
  const userId = localStorage.getItem("userId");
  if (!userId) throw new Error("No userId found. Please login first.");
  return userId;
}

// วัตถุดิบ (Inventory)

// GET inventory
window.BiteBrightAPI.getInventoryItems = async function () {
  const userId = getUserId();

  const response = await fetch(
    `https://0d74mxdrlf.execute-api.us-east-1.amazonaws.com/newbitebright/ingredient?userId=${userId}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  );

  if (!response.ok) throw new Error("Failed to fetch ingredients.");

  const result = await response.json();
  const items = Array.isArray(result) ? result : result.items || [];

  const categories = {};
  items.forEach((item) => {
    if (!categories[item.category]) categories[item.category] = [];
    categories[item.category].push(item);
  });

  return { categories };
};

// ADD inventory
window.BiteBrightAPI.addInventoryItem = async function (item) {
  const userId = getUserId();

  let base64Image = null;
  if (item.imageFile) {
    base64Image = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(item.imageFile);
    });
  }

  const response = await fetch(
    "https://0d74mxdrlf.execute-api.us-east-1.amazonaws.com/newbitebright/ingredient",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        expiryDate: item.expiryDate,
        imageBase64: base64Image,
      }),
    },
  );

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error("Failed to add item. " + errorData);
  }

  return response.json();
};

// EDIT inventory
window.BiteBrightAPI.editInventoryItem = async function (ingredientId, item) {
  const userId = getUserId();

  let base64Image = null;
  if (item.imageFile) {
    base64Image = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(item.imageFile);
    });
  }

  const response = await fetch(
    `https://0d74mxdrlf.execute-api.us-east-1.amazonaws.com/newbitebright/ingredient`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        ingredientId,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        expiryDate: item.expiryDate,
        imageBase64: base64Image,
      }),
    },
  );

  if (!response.ok) throw new Error("Failed to edit item.");

  return response.json();
};

// แนะนำเมนู (recommendMenu)
window.BiteBrightAPI.getRecommendedRecipes = async function () {
  const userId = getUserId();

  const url = `https://0d74mxdrlf.execute-api.us-east-1.amazonaws.com/newbitebright/recommend-menu?userId=${userId}`;

  const response = await fetch(url, { method: "GET" });

  if (!response.ok) throw new Error("Failed to fetch recommended recipes.");

  return response.json();
};
