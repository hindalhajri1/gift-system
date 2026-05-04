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