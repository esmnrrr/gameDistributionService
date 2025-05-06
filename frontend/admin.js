document.getElementById("addGameForm").addEventListener("submit", async (e) => {
    e.preventDefault(); // Sayfanın yenilenmesini engeller
    
    const gameData = {
      gameTitle: document.getElementById("title").value,
      gameDescription: document.getElementById("description").value,
      gameGenres: document.getElementById("genre").value,
      gamePlatforms: document.getElementById("platform").value.split(',').map(p => p.trim()),
      gameImage: document.getElementById("imageUrl").value,
      releaseDate: document.getElementById("releaseDate").value
    };
  
    try {
      const res = await fetch("https://gamedistributionservice.onrender.com/api/games/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gameData)
      });
  
      const data = await res.json();
      document.getElementById("statusMessage").innerText = data.message;
    } catch (err) {
      document.getElementById("statusMessage").innerText = "Hata oluştu: " + err.message;
    }
  });
  
  async function deleteGame() {
    const id = document.getElementById("deleteId").value;
  
    try {
      const res = await fetch(`https://gamedistributionservice.onrender.com/games/delete/${id}`, {
        method: "DELETE"
      });
  
      const data = await res.json();
      alert(data.message);
    } catch (err) {
      alert("Silme sırasında hata: " + err.message);
    }
  }
  