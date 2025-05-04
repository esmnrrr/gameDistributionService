document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const statusText = document.getElementById("loginStatus");

  try {
    const response = await fetch("http://localhost:5001/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json(); 

    if (response.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      statusText.textContent = "Giriş başarılı! Yönlendiriliyorsunuz...";
      statusText.style.color = "green";

      setTimeout(() => {
        window.location.href = "profile.html";
      }, 1500);
    } else {
      statusText.textContent = data.message || "Giriş başarısız.";
      statusText.style.color = "red";
    }
  } catch (error) {
    console.error("Hata:", error);
    statusText.textContent = "Sunucuya ulaşılamıyor. Lütfen tekrar deneyin.";
    statusText.style.color = "red";
  }
});
