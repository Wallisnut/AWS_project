function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!username || !password) {
        alert("Please enter both username and password.");
        return;
    }

    //backend (เปลี่ยน URL )
    fetch('http://localhost:8080/api/login', {
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
        alert("Login success!");
        window.location.href = "inventory.html"; //รอหน้า Home เสร็จเปลัี่ยนเป็น Home
    })
    .catch(error => {
        alert(error.message);
    });
}
