document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (user.username) {
    document.getElementById("username").textContent = user.username;
    document.getElementById("email").textContent = user.email;
  } else {
    document.getElementById("username").textContent = "Bilinmeyen Kullanıcı";
    document.getElementById("email").textContent = "-";
  }
  
  const userId = user?._id;
  if (!token || !userId) {
    alert("Giriş yapmadınız. Lütfen önce giriş yapın.");
    window.location.href = "login.html";
    return;
  }

  fetch(`https://gamedistributionservice-frontend.onrender.com/users/profile/${userId}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    }
  })
    .then(res => res.json())
    .then(data => {
      console.log("Gelen Profil Verisi:", data);
      document.getElementById("rating").textContent = data.ratings ?? 0;
      document.getElementById("playtimes").textContent = data.playtimes ?? 0;
      document.getElementById("comment").textContent = data.comments ?? 0;
    })
    .catch(err => {
      console.error("Profil verisi alınamadı:", err);
      alert("Profil bilgileri alınırken bir hata oluştu.");
    });

  document.getElementById("homeBtn").addEventListener("click", () => {
    window.location.href = "index.html";
  });

  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    alert("Çıkış yapıldı!");
    window.location.href = "index.html";
  });

  document.getElementById("deleteBtn").addEventListener("click", () => {
    const confirmed = confirm("Hesabınızı silmek istediğinize emin misiniz?");
    if (confirmed) {
      deleteUser(userId);
    }
  });

  // Kullanıcı silme işlemi
  async function deleteUser(userId) {
    try {
      const res = await fetch(`https://gamedistributionservice-frontend.onrender.com/users/profile/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
  
      const data = await res.json();
      console.log(data.message);
      alert("Hesabınız silindi!");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    } catch (error) {
      console.error("Hata:", error);
    }
  }
  
  
});
