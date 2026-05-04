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

    document.getElementById("form").style.display = "none";
    document.getElementById("gifts").style.display = "grid";

  } catch (error) {
    alert(error.message);
  }
}

async function draw(card) {
  if (!userName || !userMobile || !userGender) {
    alert("أدخلي بياناتك أول");
    return;
  }

  try {
    document.querySelectorAll(".scratch-card").forEach(c => {
      c.classList.add("disabled");
    });

    if (card) card.classList.add("opened");

    const data = await api("/api/draw", {
      method: "POST",
      body: JSON.stringify({
        name: userName,
        mobile: userMobile,
        gender: userGender
      })
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
    <div class="list-card">
      <b>${gift.name}</b><br>
      الكمية: ${gift.qty}<br>
      الفئة: ${gift.gender === "all" ? "للجميع" : gift.gender === "male" ? "رجال" : "نساء"}
    </div>
  `).join("");
}

async function resetGifts() {
  if (!confirm("هل أنتِ متأكدة من حذف جميع الهدايا؟")) return;
  if (!confirm("تأكيد نهائي: سيتم حذف جميع الهدايا ولا يمكن التراجع.")) return;

  await api("/api/reset-gifts", { method: "POST" });
  alert("تم حذف جميع الهدايا");
  renderGiftAdmin();
}

async function resetResults() {
  if (!confirm("هل أنتِ متأكدة من حذف جميع السحوبات؟")) return;
  if (!confirm("تأكيد نهائي: سيتم حذف جميع نتائج السحب ولا يمكن التراجع.")) return;

  await api("/api/reset-results", { method: "POST" });
  alert("تم حذف جميع السحوبات");
  location.reload();
}