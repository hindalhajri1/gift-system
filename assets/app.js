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

  const name = String(nameInput.value || "").trim();
  const mobile = normalizeMobile(String(mobileInput.value || "").trim());
  const gender = String(genderInput.value || "").trim();

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

    const data = await api("/api/draw", {
      method: "POST",
      body: JSON.stringify({
        name: name,
        mobile: mobile,
        gender: gender
      })
    });

    document.getElementById("giftText").innerText = data.gift;
    const content = document.querySelector(".prize-content");
    if (content) content.classList.remove("show");
let oldImg = document.getElementById("giftImagePreview");
if (oldImg) oldImg.remove();

if (data.image && prizeContent) {
  const img = document.createElement("img");
  img.id = "giftImagePreview";
  img.src = data.image;
  img.alt = data.gift;
  img.style.width = "140px";
  img.style.height = "140px";
  img.style.objectFit = "contain";
  img.style.marginTop = "14px";
  img.style.display = "block";

  prizeContent.appendChild(img);
}

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
  const image = document.getElementById("giftImage").value.trim();

  if (!name || !qty) {
    alert("اكتبي اسم الهدية والكمية");
    return;
  }

  try {
    await api("/api/gifts", {
      method: "POST",
      body: JSON.stringify({ name, qty, gender, image })    });

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
    <div class="list-card gift-item">
  
      <div style="display:flex; gap:12px; align-items:center;">
        
        ${gift.image ? `<img src="${gift.image}" style="width:60px;height:60px;border-radius:8px;object-fit:cover;">` : ""}
  
        <div>
          <b>${gift.name}</b><br>
          الكمية المتبقية: ${gift.qty}<br>
          الفئة: ${gift.gender === "all" ? "للجميع" : gift.gender === "male" ? "رجال" : "نساء"}
        </div>
  
      </div>
  
      <button class="gift-delete-btn" onclick="deleteGift(${gift.id})">×</button>
    </div>
  `).join("");
}

async function deleteGift(id) {
  if (!confirm("هل تريدين حذف هذه الهدية؟")) return;

  try {
    await api("/api/delete-gift", {
      method: "POST",
      body: JSON.stringify({ id })
    });

    renderGiftAdmin();

  } catch (error) {
    alert(error.message);
  }
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
  let finished = false;

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const point = e.touches ? e.touches[0] : e;

    return {
      x: point.clientX - rect.left,
      y: point.clientY - rect.top
    };
  }

  function scratch(e) {
    if (!isDrawing || finished) return;

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

    if (percent > 0.55 && !finished) {
      finished = true;
    
      // إظهار المحتوى بعد الكشط
      const content = document.querySelector(".prize-content");
      if (content) content.classList.add("show");
    
      if (typeof confetti === "function") {
        confetti({
          particleCount: 40,
          spread: 50,
          colors: ["#003b71", "#60cad8", "#ffffff"]
        });
      }
    
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
  const el = document.getElementById("userName");
  if (!el) return;

  try {
    const res = await fetch("/api/me");
    const data = await res.json();
    el.innerText = "مرحباً " + (data.name || "مستخدم");
  } catch {
    el.innerText = "مرحباً مستخدم";
  }
}

function logout() {
  window.location.href = "/cdn-cgi/access/logout";
}
console.log(data);