let userName = "";

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

function start() {
  const nameInput = document.getElementById("name");

  if (!nameInput || !nameInput.value.trim()) {
    alert("اكتبي اسمك أول");
    return;
  }

  userName = nameInput.value.trim();

  document.getElementById("form").style.display = "none";
  document.getElementById("gifts").style.display = "grid";
}

async function draw(card) {
  if (!userName) {
    alert("اكتبي اسمك أول");
    return;
  }

  try {
    document.querySelectorAll(".scratch-card").forEach(c => {
      c.classList.add("disabled");
    });

    if (card) {
      card.classList.add("opened");
    }

    const data = await api("/api/draw", {
      method: "POST",
      body: JSON.stringify({ name: userName })
    });

    setTimeout(() => {
      document.getElementById("giftText").innerText = data.gift;
      document.getElementById("result").classList.add("show");
    }, 700);

  } catch (error) {
    alert(error.message);

    document.querySelectorAll(".scratch-card").forEach(c => {
      c.classList.remove("disabled", "opened");
    });
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