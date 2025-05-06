document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const gameId = urlParams.get("id");

  const token = localStorage.getItem("token");
  let userId = null;

  if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    userId = payload.id; // veya payload._id, backend'in nasıl tanımladığına bağlı
  }
  
  async function fetchGameDetails() {
    try {
      const response = await fetch(`https://gamedistributionservice-frontend.onrender.com/api/games/${gameId}`);
      if (!response.ok) throw new Error("Oyun detayları yüklenemedi");

      const game = await response.json();
      console.log("Oyun Detayları:", game);
      document.getElementById("gameTitle").textContent = game.gameTitle || "Başlık yok";
      document.getElementById("gameImage").src = game.gameImage || "https://via.placeholder.com/300x200?text=No+Image";
      document.getElementById("gameGenres").textContent = `Tür: ${game.gameGenres?.join(", ") || "Belirtilmemiş"}`;
      document.getElementById("gameDescription").textContent = `Açıklama: ${game.gameDescription || "Yok"}`;
      document.getElementById("game-rating").textContent = game.rating?.toFixed(1) || "-";

      // Yorumları yükle
      loadComments(gameId);

      // Eğer giriş yaptıysa formu göster
      if (token) {
        document.getElementById("comment-section").style.display = "block";
      }
    } catch (err) {
      console.error("fetchGameDetails hatası:", err);
      document.body.innerHTML = `<p>Oyun detayları yüklenemedi.</p>`;
    }
  }

async function loadComments(gameId) {
  try {
    const response = await fetch(`https://gamedistributionservice-frontend.onrender.com/api/games/${gameId}`);
    const game = await response.json();
    const commentList = document.getElementById('commentList');
    commentList.innerHTML = '';

    let toplamPuan = 0;
    let yorumSayisi = 0;

    game.comments.forEach(comment => {
      if (!comment.user || !comment.user.username) return; // Kullanıcı silinmişse geç

      const li = document.createElement('li');
      const oynamaSuresi = (comment.play_time !== undefined && comment.play_time !== null) ? ` - ${comment.play_time} dakika oynadı.` : "";
      li.textContent = `${comment.user.username}: ${comment.comment} (${comment.rating}/5)${oynamaSuresi}`;
      commentList.appendChild(li);

      toplamPuan += comment.rating;
      yorumSayisi += 1;
    });

    const averageRating = yorumSayisi > 0 ? (toplamPuan / yorumSayisi).toFixed(1) : "-";
    document.getElementById("game-rating").textContent = averageRating;
  } catch (err) {
    console.error("Yorumlar yüklenemedi:", err);
  }
}

  async function postComment(comment, rating, play_time) {
    try {
      const response = await fetch(`https://gamedistributionservice-frontend.onrender.com/api/games/${gameId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ comment, rating, play_time }), 
      });
      const data = await response.json();
      console.log("Yorum gönderildi:", data);

      if (response.ok) {
        alert("Yorum başarıyla eklendi!");
        document.getElementById("comment").value = "";
        document.getElementById("rating").value = "";
        document.getElementById("playTime").value = "";
        
        //await updatePlaytime(userId, gameId, play_time);
        //await loadComments(gameId);
        await fetchGameDetails();
        await updateUserProfile(userId); 
      } else {
        alert(data.message || "Yorum eklenemedi.");
      }
    } catch (err) {
      console.error("postComment hatası:", err);
      alert("Yorum gönderilirken bir hata oluştu.");
    }
  }

  async function updateUserProfile(userId) {
    try {
        const response = await fetch(`https://gamedistributionservice-frontend.onrender.com/users/profile/${userId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });

        const updatedUser = await response.json();
        localStorage.setItem("user", JSON.stringify(updatedUser));
        console.log("Profil bilgileri güncellendi:", updatedUser);
    } catch (err) {
        console.error("Profil bilgileri güncellenemedi:", err);
    }
  }

  // Formu dinle
  const commentForm = document.getElementById("comment-form");
  if (commentForm) {
    commentForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const rating = document.getElementById("rating").value;
      const comment = document.getElementById("comment").value;
      const play_time = document.getElementById("playTime").value;
      await postComment(comment, rating, play_time);
      commentForm.reset();
    });
  }

  // Kullanıcı silme işlemi


  // Sayfa yüklendiğinde başla
  fetchGameDetails();
});
