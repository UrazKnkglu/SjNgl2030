fetch('/api/profile', {
    method: 'GET',
    credentials: 'include' // 🍪
})
  .then(res => {
    if (!res.ok) throw new Error("unauthorized");
    return res.json();
  })
  .then(() => {
    
    //get the messages as list
    async function loadMessages() {
        try {
          const res = await fetch("/api/messages");
          const messages = await res.json();
      
          const list = document.getElementById("messages");
          list.innerHTML = "";
      
          messages.forEach(msg => {
            const li = document.createElement("li");
            li.textContent = msg.ngl;
            li.dataset.id = msg._id
            list.appendChild(li);

            li.addEventListener("click", () => {
                window.location.hash = `#${msg._id}`
            })
          });
        } catch (err) {
          console.error("Error loading messages:", err);
        }
      }
      
      // Sayfa yüklenince çek
      loadMessages();

      
  })
  .catch((err) => {
    //alert(err)
    window.location.href = "/login";
  });

// Fonksiyonları dışarıda tanımla
async function checkMessageById(_id) {
    try {
      const res = await fetch(`/api/messages/${_id}`);
      if (!res.ok) {
        alert("Mesaj bulunamadı");
        return null;
      }
      return await res.json();
    } catch (err) {
      console.error("Error fetching message:", err);
      return null;
    }
  }
  
  async function run(hash) {
    if (!hash) return;
    const id = hash.startsWith('#') ? hash.slice(1) : hash;
    const selectedMessageObject = await checkMessageById(id);
  
    if (selectedMessageObject) {

      document.body.querySelectorAll("section")[0].style.display = "none"
      document.body.querySelectorAll("section")[1].style.display = "flex"

      const pageAlt = document.getElementById("altt")
      pageAlt.querySelector("#ngl_bg_bottom h3").innerText = selectedMessageObject.ngl

    } else {
      document.body.querySelectorAll("section")[1].style.display = "none"
      document.body.querySelectorAll("section")[0].style.display = "flex"
      alert("Mesaj bulunamadı veya geçersiz");
    }
  }
  
  window.addEventListener("hashchange", () => run(window.location.hash));
  


window.addEventListener("load", () => {
    history.replaceState(null, "", window.location.pathname + window.location.search);
})

function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
  
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
  
    return new Blob([ab], { type: mimeString });
  }
  

  document.getElementById("shareBtn").addEventListener("click", async () => {
  const element = document.querySelector("#altt");
  const canvas = await html2canvas(element, { backgroundColor: "black" });
  const dataURL = canvas.toDataURL("image/png");

  // Yeni sekme aç ve resmi göster
  const newTab = window.open();
  if (newTab) {
    newTab.document.body.style.margin = '0';
    newTab.document.body.style.backgroundColor = 'black';
    const img = newTab.document.createElement('img');
    img.src = dataURL;
    img.style.width = '100vw';
    img.style.height = '100vh';
    img.style.objectFit = 'contain';
    newTab.document.body.appendChild(img);
  } else {
    alert('Popup engellendi, lütfen popup engelleyiciyi kapat.');
  }
});
