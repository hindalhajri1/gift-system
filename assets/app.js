let userName = "";
let userMobile = "";
let userGender = "";

async function api(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  const text = await res.text();
  let data = {};

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(text);
    }
  }

  if (!res.ok) {
    throw new Error(data.error || "حدث خطأ في الاتصال بالـ API");
  }

  return data;
}

function normalizeMobile(mobile) {
  return mobile.replace(/\s/g, "").replace(/^966/, "0");
}
async function start() {
    const nameInput = document.getElementById("name");
    const mobileInput = document.getElementById("mobile");
    const genderInput = document.getElementById("gender");
  
    const name = nameInput.value.trim();
    const mobile = normalizeMobile(mobileInput.value.trim());
    const gender = genderInput.value;
  
    if (!name || !mobile || !gender) {
      alert("اكتبي الاسم ورقم الجوال واختاري الفئة");
      return;
    }
  
    if (!/^05\d{8}$/.test(mobile)) {
      alert("رقم الجوال غير صحيح، مثال: 05xxxxxxxx");
      return;
    }
  
    try {
      const check = await api(`/api/check?mobile=${encodeURIComponent(mobile)}`);
  
      if (check.exists) {
        alert(`تم تسجيلك مسبقًا، هديتك هي: ${check.gift}`);
        return;
      }
  
      userName = name;
      userMobile = mobile;
      userGender = gender;
  
      const data = await api("/api/draw", {
        method: "POST",
        body: JSON.stringify({
          name: userName,
          mobile: userMobile,
          gender: userGender
        })
      });
  
      document.getElementById("giftText").innerText = data.gift;
      document.getElementById("form").style.display = "none";
      document.getElementById("gifts").style.display = "flex";
  
      setTimeout(initScratchCanvas, 100);
  
    } catch (error) {
      alert(error.message);
    }
  }

async function addGift() {
  const name = document.getElementById("giftName").value.trim();
  const qty = document.getElementById("giftQty").value;
  const gender = document.getElementById("giftGender").value;

  if (!name || !qty) {
    alert("اكتبي اسم الهدية والكمية");
    return;
  }

  try {
    await api("/api/gifts", {
      method: "POST",
      body: JSON.stringify({ name, qty, gender })
    });

    document.getElementById("giftName").value = "";
    document.getElementById("giftQty").value = "";

    renderGiftAdmin();

  } catch (error) {
    alert(error.message);
  }
}

async function renderGiftAdmin() {
  const list = document.getElementById("giftList");
  if (!list) return;

  const gifts = await api("/api/gifts");

  if (gifts.length === 0) {
    list.innerHTML = "<p>لا توجد هدايا مضافة.</p>";
    return;
  }

  list.innerHTML = gifts.map(gift => `
    <div class="list-card">
      <b>${gift.name}</b><br>
      الكمية: ${gift.qty}<br>
      الفئة: ${gift.gender === "all" ? "للجميع" : gift.gender === "male" ? "رجال" : "نساء"}
    </div>
  `).join("");
}

async function resetGifts() {
    if (!confirm("هل أنتِ متأكدة من حذف جميع الهدايا؟")) return;
  
    try {
      await api("/api/reset-gifts", { method: "POST" });
      alert("تم حذف جميع الهدايا بنجاح");
      renderGiftAdmin();
    } catch (error) {
      alert(error.message);
    }
  }

  async function resetResults() {
    if (!confirm("هل أنتِ متأكدة من حذف جميع السحوبات؟")) return;
  
    try {
      await api("/api/reset-results", { method: "POST" });
      alert("تم حذف جميع السحوبات بنجاح");
      location.reload();
    } catch (error) {
      alert(error.message);
    }
  }

  function initScratchCanvas() {
    const canvas = document.getElementById("scratchCanvas");
    if (!canvas) return;
  
    const card = canvas.parentElement;
    const ctx = canvas.getContext("2d");
  
    canvas.width = card.offsetWidth;
    canvas.height = card.offsetHeight;
  
    ctx.fillStyle = "#003b71";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    ctx.fillStyle = "rgba(255,255,255,.9)";
    ctx.font = "bold 18px Tahoma";
    ctx.textAlign = "center";
    ctx.fillText("امسح هنا لإظهار الهدية", canvas.width / 2, canvas.height / 2);
  
    let isDrawing = false;
  
    function getPos(e) {
      const rect = canvas.getBoundingClientRect();
      const point = e.touches ? e.touches[0] : e;
  
      return {
        x: point.clientX - rect.left,
        y: point.clientY - rect.top
      };
    }
  
    function scratch(e) {
      if (!isDrawing) return;
  
      e.preventDefault();
  
      const pos = getPos(e);
  
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 26, 0, Math.PI * 2);
      ctx.fill();
  
      checkScratchProgress();
    }
  
    function checkScratchProgress() {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let cleared = 0;
  
      for (let i = 3; i < imageData.data.length; i += 4) {
        if (imageData.data[i] === 0) cleared++;
      }
  
      const percent = cleared / (imageData.data.length / 4);
  
      if (percent > 0.55) {
        canvas.style.transition = "opacity .4s ease";
        canvas.style.opacity = "0";
        setTimeout(() => {
          canvas.style.display = "none";
        }, 400);
      }
    }
  
    canvas.addEventListener("mousedown", () => isDrawing = true);
    canvas.addEventListener("mouseup", () => isDrawing = false);
    canvas.addEventListener("mouseleave", () => isDrawing = false);
    canvas.addEventListener("mousemove", scratch);
  
    canvas.addEventListener("touchstart", () => isDrawing = true);
    canvas.addEventListener("touchend", () => isDrawing = false);
    canvas.addEventListener("touchmove", scratch);
  }
  async function loadUser() {
    try {
      const res = await fetch("/api/me");
      const data = await res.json();
  
      if (data.name) {
        document.getElementById("welcomeText").innerText =
          "مرحباً، " + data.name;
      }
    } catch (e) {
      console.log(e);
    }
  }
  
  function logout() {
    window.location.href = "https://gift.hindtech.sa/cdn-cgi/access/logout";
  }

  async function loadUser() {
    try {
      const res = await fetch("/api/me");
      const data = await res.json();
  
      document.getElementById("userName").innerText =
        "مرحباً " + data.name;
    } catch {
      document.getElementById("userName").innerText = "مرحباً";
    }
  }
  
  function logout() {
    window.location.href = "/cdn-cgi/access/logout";
  }