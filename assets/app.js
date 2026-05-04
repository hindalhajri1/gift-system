let userName = "";

let gifts = JSON.parse(localStorage.getItem("gifts")) || [
  { name: "بطاقة 100 ريال", qty: 3, gender: "all" },
  { name: "قسيمة شرائية", qty: 2, gender: "all" },
  { name: "كوب قهوة", qty: 5, gender: "all" }
];

let results = JSON.parse(localStorage.getItem("results")) || [];

function saveData() {
  localStorage.setItem("gifts", JSON.stringify(gifts));
  localStorage.setItem("results", JSON.stringify(results));
}

function start() {
  const nameInput = document.getElementById("name");

  if (!nameInput.value.trim()) {
    alert("اكتب اسمك أول");
    return;
  }

  userName = nameInput.value.trim();

  const alreadyPlayed = results.some(r => r.name === userName);
  if (alreadyPlayed) {
    alert("تم تسجيلك مسبقًا ولا يمكن السحب مرة أخرى");
    return;
  }

  document.getElementById("form").style.display = "none";
  document.getElementById("gifts").style.display = "grid";
}

function draw() {
  const availableGifts = gifts.filter(g => Number(g.qty) > 0);

  if (availableGifts.length === 0) {
    alert("انتهت جميع الهدايا");
    return;
  }

  const selected = availableGifts[Math.floor(Math.random() * availableGifts.length)];

  selected.qty = Number(selected.qty) - 1;

  results.push({
    name: userName,
    gift: selected.name,
    date: new Date().toLocaleString("ar-SA")
  });

  saveData();

  document.getElementById("giftText").innerText = selected.name;
  document.getElementById("result").classList.add("show");
  document.getElementById("gifts").style.pointerEvents = "none";
}

function addGift() {
  const name = document.getElementById("giftName").value.trim();
  const qty = document.getElementById("giftQty").value;
  const gender = document.getElementById("giftGender").value;

  if (!name || !qty) {
    alert("اكتبي اسم الهدية والكمية");
    return;
  }

  gifts.push({
    name,
    qty: Number(qty),
    gender
  });

  saveData();

  document.getElementById("giftName").value = "";
  document.getElementById("giftQty").value = "";

  renderGiftAdmin();
}

function deleteGift(index) {
  if (!confirm("هل تريدين حذف الهدية؟")) return;

  gifts.splice(index, 1);
  saveData();
  renderGiftAdmin();
}

function renderGiftAdmin() {
  const list = document.getElementById("giftList");
  if (!list) return;

  if (gifts.length === 0) {
    list.innerHTML = "<p>لا توجد هدايا مضافة.</p>";
    return;
  }

  list.innerHTML = gifts.map((gift, index) => `
    <div style="background:white;border:1px solid #e5eef5;border-radius:14px;padding:14px;margin-bottom:10px;">
      <b>${gift.name}</b><br>
      الكمية: ${gift.qty}<br>
      الفئة: ${gift.gender === "all" ? "للجميع" : gift.gender === "male" ? "رجال" : "نساء"}
      <br><br>
      <button onclick="deleteGift(${index})" style="background:#b42318;">حذف</button>
    </div>
  `).join("");
}