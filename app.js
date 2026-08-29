console.log("APP JS TEST - V2");

document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM READY - APP JS BERHASIL");

  var loginPage = document.getElementById("loginPage");
  var appContainer = document.getElementById("appContainer");

  if (loginPage) {
    loginPage.style.display = "block";
  }

  if (appContainer) {
    appContainer.style.display = "none";
  }
});
