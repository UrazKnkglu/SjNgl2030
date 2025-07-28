
document.getElementById("send_btn").addEventListener("click", async () => {
    
    const ngl = document.getElementById("ngl").value

    try {
        const res = await fetch("/api/sendMessage", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ ngl }) // true veya false gönder
        });
        const result = await res.json();
        if (!res.ok) {
          alert(result.error || "Something went wrong.");
        } else {
            document.querySelector("#background section").remove()
            document.querySelector("#background input").remove()
            document.querySelector("#background h3").innerText = "Thanks To Your NGL!"
            document.querySelector("#background").style.height = "50px"
        }
      } catch (err) {
        console.error("Message error:", err);
      }
})