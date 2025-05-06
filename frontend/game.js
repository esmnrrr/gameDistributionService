document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (token) {
    document.getElementById("comment-section").style.display = "block";
  }

  const commentForm = document.getElementById("comment-form");
  const urlParams = new URLSearchParams(window.location.search);
  const gameId = urlParams.get("id"); // URL'den oyun ID'sini al

  console.log("Gelen ID:", gameId);
  commentForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const rating = document.getElementById("rating").value;
    const comment = document.getElementById("comment").value;
    const play_time = document.getElementById("playTime").value;

    if (!token) {
      alert("Giriş yapmadan yorum ekleyemezsin!");
      return;
    }

    try {
      const response = await fetch(`https://gamedistributionservice.onrender.com/api/games/${gameId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ rating, comment, play_time })
      });

      const data = await response.json();
      if (response.ok) {
          document.getElementById("commentStatus").textContent = "Yorum başarıyla gönderildi!";
          commentForm.reset();

          const userId = JSON.parse(atob(token.split('.')[1])).id; // JWT içinden userId çekiyoruz
          await fetch(`https://gamedistributionservice.onrender.com/users/updateStats/${userId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              field: "comments",
              increment: 1
            })
          });

          console.log("Kullanıcının yorum sayısı +1 yapıldı!");

          // Yeni yorumları yeniden yükle
          loadComments(gameId);
      } else {
          document.getElementById("commentStatus").textContent = data.message || "Bir hata oluştu.";
      }

    } catch (err) {
      console.error("Yorum gönderme hatası:", err);
    }
  });

    async function updatePlaytime(userId, gameId, duration, token) {
    try {
      const response = await fetch(`https://gamedistributionservice.onrender.com/api/users/updatePlaytime/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Eğer token gerekiyorsa
        },
        body: JSON.stringify({ gameId, duration }),
      });
  
      const data = await response.json();
  
      if (!response.ok) throw new Error(data.message || "Bilinmeyen hata");
  
      console.log("✅", data.message);
    } catch (err) {
      console.error("❌ Oynama süresi güncellenemedi:", err.message);
    }
  }
  document.getElementById("submitButton").addEventListener("click", () => {
    updatePlaytime(userId, gameId, duration, token);
  });
  
});

