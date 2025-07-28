fetch('/api/profile', {
    method: 'GET',
    credentials: 'include'
})
.then(res => {
    if (res.ok) {
        window.location.href = '/profile';
    }
})
.catch(() => {
    // No action needed, user is not logged in
});


function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  

let deviceId = localStorage.getItem("deviceId");
if (!deviceId) {
  deviceId = generateUUID()
  localStorage.setItem("deviceId", deviceId);
}

// 🧠 Existing login click handler...
document.getElementById("login_btn").addEventListener("click", async () => {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (!username || !password) {
        document.querySelector("#error").querySelector(".down_note").innerText = "empty_fields"
    } 
    
    else {
        try {
            const rememberMe = document.getElementById("rememberMe").checked;
            const res = await fetch(`/api/login`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ username, password, deviceId, rememberMe })
            });

            const data = await res.json();

            if (res.ok && data.twofa && data.token) {
                // 🚨 TwoFA etkin, kullanıcıyı confirm sayfasına yönlendiriyoruz
                window.location.href = `/confirm?token=${encodeURIComponent(data.token)}`;
            } else if (res.ok) {
                // ✅ 2FA yok → direkt profile'e git
                window.location.href = "/profile";
            } else {
                document.querySelector("#error .down_note").innerText = data.error || "login_failed";
            }

        } catch (err) {
            console.error("Login failed:", err);
        }
    }
});
    
document.querySelectorAll("input[type='text'], input[type='password']").forEach(input => {
    input.addEventListener("input", () => {
        document.querySelector("#error").querySelector(".down_note").innerText = "";
    });
});