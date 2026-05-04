let userName = "";

async function api(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "حدث خطأ غير متوقع");
  }

  return data;
}

async function start() {
  const nameInput = document.getElementById("name");

  if (!nameInput.value.trim()) {
    alert("اكتب اسمك أول");
    return;
  }

  userName = nameInput.value.trim();

  document.getElementById("form").style.display = "none";
  document.getElementById("gifts").style.display = "grid";
}

async function draw() {
  try {
    const data = await api("/api/draw", {
      method: "POST",
      body: JSON.stringify({ name: userName })
    });

    document.getElementById("giftText").innerText = data.gift;
    document.getElementById("result").classList.add("show");
    document.getElementById("gifts").style.pointerEvents = "none";

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
    <div style="background:white;border:1px solid #e5eef5;border-radius:14px;padding:14px;margin-bottom:10px;">
      <b>${gift.name}</b><br>
      الكمية: ${gift.qty}<br>
      الفئة: ${gift.gender === "all" ? "للجميع" : gift.gender === "male" ? "رجال" : "نساء"}
    </div>
  `).join("");
}