function signup() {
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirm-password').value.trim();

    if (!username || !email || !password || !confirmPassword) {
        alert("Please fill all fields.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    showToast("Create accounting...")

    //backend (เปลี่ยน URL API)
    fetch('https://0d74mxdrlf.execute-api.us-east-1.amazonaws.com/newbitebright/register-login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            email: email,
            password: password
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Sign up failed.");
        }
        return response.json();
    })
    .then(data => {
        // alert("Sign up success! Please login.");
        window.location.href = "login.html";
    })
    .catch(error => {
        alert(error.message);
    });
}
