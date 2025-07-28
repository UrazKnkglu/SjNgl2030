document.getElementById("register_btn").addEventListener("click", async () => {
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const errorBox = document.querySelector("#error .down_note");

    if (!username || !email || !password) {
        errorBox.innerText = "empty_fields";
        return;
    }

    try {
        const res = await fetch(`http://${location.hostname}:1001/api/send-register-code`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, email, password })
        });

        const data = await res.json();

        if (!res.ok) {
            errorBox.innerText = data.error || "register_failed";
            document.querySelector("#error .down_note").style.color = "red"
        } else {
            document.querySelector("#error .down_note").innerText = "Verification link and code sent to your email.";
            document.querySelector("#error .down_note").style.color = "green"
            
            window.location.href = data.confirmLink
        }
    } catch (err) {
        console.error("Request failed:", err);
        errorBox.innerText = "network_error";
    }
});

document.querySelectorAll("input[type='text'], input[type='password']").forEach(input => {
    input.addEventListener("input", () => {
        "";
    });
});