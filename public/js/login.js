function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!username || !password) {
        alert("Please enter both username and password.");
        return;
    }

    fetch('https://api.example.com/login', { // <-- เปลี่ยน URL เป็นของจริงที่ backend ให้
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Invalid username or password");
        }
        return response.json();
    })
    .then(data => {

        const userId = data.userId;

        if (!userId) {
            throw new Error("No userId returned from server");
        }

        localStorage.setItem("userId", userId);

        alert("Login success!");
        window.location.href = "Homepage.html";
    })
    .catch(error => {
        alert(error.message);
    });
}
