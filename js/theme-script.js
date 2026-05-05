// Тема
let themeToggle = document.getElementById("theme-toggle");
("dark" === localStorage.getItem("theme") &&
  (document.documentElement.setAttribute("data-theme", "dark"),
  (themeToggle.innerText = "☀️")),
  themeToggle.addEventListener("click", () => {
    var e = "dark" === document.documentElement.getAttribute("data-theme");
    (document.documentElement.setAttribute("data-theme", e ? "light" : "dark"),
      localStorage.setItem("theme", e ? "light" : "dark"),
      (themeToggle.innerText = e ? "🌙" : "☀️"));
  }));
