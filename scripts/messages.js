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


          const svgNS = "http://www.w3.org/2000/svg";

// Insta Svg


      
          messages.forEach(msg => {

            const svg = document.createElementNS(svgNS, "svg");
svg.setAttribute("width", "30px");
svg.setAttribute("height", "30px");
svg.setAttribute("viewBox", "0 0 24 24");
svg.setAttribute("fill", "none");
svg.setAttribute("xmlns", svgNS);

const paths = [
  "M10 11V17",
  "M14 11V17",
  "M4 7H20",
  "M6 7H12H18V18C18 19.6569 16.6569 21 15 21H9C7.34315 21 6 19.6569 6 18V7Z",
  "M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z"
];

paths.forEach(d => {
  const path = document.createElementNS(svgNS, "path");
  path.setAttribute("d", d);
  path.setAttribute("stroke", "#FF0000");
  path.setAttribute("stroke-width", "2");
  path.setAttribute("stroke-linecap", "round");
  path.setAttribute("stroke-linejoin", "round");
  svg.appendChild(path);
});

svg.addEventListener("click", () => {
  window.location.hash = `#${msg._id}`
  fetch(`/api/messages/${msg._id}`, {
    method: "DELETE"
  })
    .then(res => {
      if (!res.ok) throw new Error("Silinemedi");
      return res.json();
    })
    .then(data => {
      console.log("Silindi:", data);
      window.location.reload()
    })
    .catch(err => console.error(err));
    window.location.reload()
})
            
            const li = document.createElement("li");
            li.textContent = msg.ngl;
            li.style.display = "flex"
            li.style.justifyContent = "space-between"
            li.dataset.id = msg._id
            list.appendChild(li);
            li.appendChild(svg)

            li.addEventListener("click", () => {
                window.location.hash = `#${msg._id}`
            })
          });
        } catch (err) {
          console.error("Error loading messages:", err);
        }
      }
      
      // Mesajları yükle
      loadMessages();

      
  })
  .catch((err) => {
    //alert(err)
    window.location.href = "/login";
  });


async function checkMessageById(_id) {
    try {
      const res = await fetch(`/api/messages/${_id}`);
      if (!res.ok) {
        alert("Mesaj bulunamadı");
        window.location.reload()
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
    const element = document.querySelector("#altt"); // istediğin element
  const canvas = await html2canvas(element, { backgroundColor: "null" });
  const dataURL = canvas.toDataURL("image/png");

  const img = document.createElement("img");
  img.src = dataURL;
  img.alt = "Generated Image";
  img.style.maxWidth = "100%"; // responsive için

  const container = document.getElementById("altt");
  container.innerHTML = "";
  container.appendChild(img);

  const down_note = document.querySelector(".down_note")
  if (down_note.innerText == "") {
    down_note.innerText = "NGL'yi basılı tutarak fotoğraflara kaydet ve tekrar butona bas. Daha sonra hikaye kısmına NGL'yi yapıştır"
    down_note.style.color = "darkgreen"
  } else {
    window.location.href = "instagram://story-camera";

    const id = window.location.hash.replace("#", "");

if (id) {
  fetch(`/api/messages/${id}`, {
    method: "DELETE"
  })
    .then(res => {
      if (!res.ok) throw new Error("Silinemedi");
      return res.json();
    })
    .then(data => {
      console.log("Silindi:", data);
      window.location.href = "/";
    })
    .catch(err => console.error(err));
}

  }

  });
  
