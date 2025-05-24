function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorMessage = document.getElementById("login-error");

  // Clear previous error
  errorMessage.textContent = "";

  // Check for empty fields
  if (!username || !password) {
    errorMessage.textContent = "Please enter both username and password.";
    return;
  }

  showToast("Logging in...");

  fetch(
    "https://0d74mxdrlf.execute-api.us-east-1.amazonaws.com/newbitebright/login",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    },
  )
    .then((response) => {
      if (!response.ok) {
        return response.json().then((err) => {
          throw new Error(err.message || "Invalid username or password");
        });
      }
      return response.json();
    })
    .then((data) => {
      const userId = data.userId;
      const username = data.username;
      const email = data.email;

      if (!userId) {
        throw new Error("No userId returned from server.");
      }

      localStorage.setItem("userId", userId);
      localStorage.setItem("username", username);
      localStorage.setItem("email", email);

      showToast("Login success! Redirecting...");
      setTimeout(() => {
        window.location.href = "Homepage.html";
      }, 1000);
    })
    .catch((error) => {
      // Show error message inline
      errorMessage.textContent = error.message;
    });
}

