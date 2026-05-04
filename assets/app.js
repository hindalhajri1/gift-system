let userName = "";

const gifts = [
  "🎁 بطاقة 100 ريال",
  "🎁 قسيمة شرائية",
  "🎁 كوب قهوة",
  "🎁 مفاجأة 🎉"
];

function start() {
  const nameInput = document.getElementById("name");

  if (!nameInput.value) {
    alert("اكتب اسمك أول");
    return;
  }

  userName = nameInput.value;

  document.getElementById("form").style.display = "none";
  document.getElementById("gifts").style.display = "grid";
}

function draw() {
  const randomGift = gifts[Math.floor(Math.random() * gifts.length)];

  document.getElementById("giftText").innerText = randomGift;
  document.getElementById("result").classList.add("show");
}