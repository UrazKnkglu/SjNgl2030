const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
document.getElementById('confirm_btn').addEventListener('click', async () => {
  const code = [
    'num1', 'num2', 'num3', 'num4', 'num5', 'num6'
  ].map(id => document.getElementById(id).value).join('');

  if (code.length !== 6) {
    document.querySelector("#error").querySelector(".down_note").innerText = 'Please enter a 6-digit code.';
    return;
  }

  try {
    // Create or get deviceId

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
      const trustDevice = document.getElementById("trustDevice")?.checked;
      const res = await fetch('/api/confirm-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, code, trustDevice, deviceId })
    });
  
    
    const data = await res.json();

    if (res.ok) {
        document.querySelector("#error").querySelector(".down_note").innerText = 'Code verified!';
      // Redirect based on the purpose returned by server
      if (data.purpose === 'forgot') {
        window.location.href = `/reset-password?token=${token}`;
      } else if (data.purpose === 'register') {
        document.querySelector("#error").querySelector(".down_note").innerText = ('Email verified! You can now log in.');
        window.location.href = '/login';
      } else if (data.purpose === "twofa_login") {
        window.location.href = "/profile";
      }
    } else {
        document.querySelector("#error").querySelector(".down_note").innerText = data.error || 'Verification failed.';
    }
  } catch (err) {
    console.error(err);
    document.querySelector("#error").querySelector(".down_note").innerText = 'An error occurred. Please try again.';
  }
});
document.querySelectorAll("input").forEach(input => {
  input.addEventListener("input", () => {
    // Move forward on input
    let currentIndex = parseInt(input.id.slice(3, 4));
    let nextInput = document.getElementById(`num${currentIndex + 1}`);
    if (nextInput && input.value.length > 0) {
      nextInput.focus();
    }

    if (input.value.length === 6) {
      input.value.split('').forEach((digit, index) => {
        document.querySelector(`#num${index+1}`).value = digit
      })
      document.querySelector("#num6").focus()
    }
  });
  input.addEventListener("keydown", (event) => {
    // Go back on Backspace or Delete if empty
    let currentIndex = parseInt(input.id.slice(3, 4));
    if (input.value.length === 0) {
      if ((event.key === "Backspace" || event.key === "Delete")) {
        let prevInput = document.getElementById(`num${currentIndex - 1}`);
        if (prevInput) {
          prevInput.focus();
          prevInput.value = ""
          event.preventDefault(); // prevent default to avoid browser quirks
        }
      }
    }
  });
});

async function checkTokenPurpose() {
  try {
    const res = await fetch('/api/decode-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });

    const data = await res.json();
    const descriptionEl = document.querySelector("#description");

    if (data.purpose === "forgot") {
      descriptionEl.innerText = "A 6-digit code is sent to your email to reset your password. If the code didn't work, you can click the sent link to enter your code.";
    } else if (data.purpose === "register") {
      descriptionEl.innerText = "A 6-digit code is sent to your email to register. If the code didn't work, you can click the sent link to enter your code.";
    } else if (data.purpose === "twofa_login") {
      descriptionEl.innerText = "A 6-digit code is sent to your email to log into your account. If the code didn't work, you can click the sent link to enter your code.";

      // Create wrapper div
      const wrapper = document.createElement("div");
      wrapper.style.marginTop = "10px";

      // Create label
      const label = document.createElement("label");

      // Create checkbox input
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = "trustDevice";

      // Add text next to checkbox
      const labelText = document.createTextNode(" Trust this device");

      // Assemble
      label.appendChild(checkbox);
      label.appendChild(labelText);
      wrapper.appendChild(label);
      document.getElementById("background").appendChild(wrapper)

    } else {
      descriptionEl.innerText = `Unknown purpose: ${data.purpose}`;
    }

  } catch (err) {
    console.error("Failed to decode token:", err);
  }
}

checkTokenPurpose();

