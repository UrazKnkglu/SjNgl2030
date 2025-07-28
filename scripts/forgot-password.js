document.getElementById('send_btn').addEventListener('click', async () => {
    const email = document.getElementById('email').value.trim();
    if (!email) {
        document.querySelector("#error").querySelector(".down_note").innerText = ('Lütfen e-posta adresinizi girin.');
            document.querySelector("#error").querySelector(".down_note").style.color = "red"
        return;
    }

    try {
        const res = await fetch('/api/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });

        const data = await res.json();

        if (!res.ok) {
            document.querySelector("#error").querySelector(".down_note").innerText = data.error;
            document.querySelector("#error").querySelector(".down_note").style.color = "red"
            return;
        }

        document.querySelector("#error").querySelector(".down_note").innerText = ('Şifre sıfırlama linki e-posta adresinize gönderildi.');
        document.querySelector("#error").querySelector(".down_note").style.color = "green"

        window.location.href = data.confirmLink

    } catch (err) {
        document.querySelector("#error").querySelector(".down_note").innerText = ('Sunucu ile bağlantı kurulamadı, lütfen tekrar deneyin.');
            document.querySelector("#error").querySelector(".down_note").style.color = "red"
        console.error(err);
    }
});


document.querySelectorAll("input[type='text'], input[type='password']").forEach(input => {
    input.addEventListener("input", () => {
        const errorNote = document.querySelector("#error").querySelector(".down_note").innerText = "";
    });
});