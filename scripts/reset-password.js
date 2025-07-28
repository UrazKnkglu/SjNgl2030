const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
document.getElementById('resetBtn').addEventListener('click', async () => {
    const newPassword = document.getElementById('newPassword').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    const message = document.getElementById('message');
    message.textContent = '';
    if (!newPassword || !confirmPassword) {
        message.textContent = 'Please fill in both fields.';
        return;
    }
    if (newPassword !== confirmPassword) {
        message.textContent = "Passwords don't match.";
        return;
    }
    if (newPassword.length < 6) {
        message.textContent = "Password must be at least 6 characters.";
        return;
    }
    try {
        const res = await fetch('/api/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, newPassword })
        });
        const data = await res.json();
        if (res.ok) {
            document.querySelector("#error").querySelector(".down_note").innerText = ('Password successfully reset! You can now login.');
            document.querySelector("#error").querySelector(".down_note").style.color = "green"
            setTimeout(() => {window.location.href = '/login'},2000);
        } else {
            message.textContent = data.error || 'Reset failed.';
        }
    } catch (err) {
        message.textContent = 'Server error. Try again later.';
        console.error(err);
    }
});
document.querySelectorAll("input[type='text'], input[type='password']").forEach(input => {
    input.addEventListener("input", () => {
        const errorNote = document.querySelector("#error").querySelector(".down_note").innerText = "";
    });
});
