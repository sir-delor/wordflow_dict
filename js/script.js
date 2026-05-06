// --- Блок поиска ---
const searchInput = document.getElementById('search');
const resetBtn = document.getElementById('search-reset');

// Проверка на существование элементов, чтобы не было ошибок в консоли
if (resetBtn && searchInput) {
    resetBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchInput.focus();
        searchInput.dispatchEvent(new Event('input'));
    });
}

// --- Блок кнопки "Наверх" ---
const scrollBtn = document.getElementById("scrollTopBtn"); // Переименовали в scrollBtn

window.onscroll = function() {
    if (scrollBtn) {
        if (window.scrollY > window.innerHeight * 1) {
            scrollBtn.classList.add("show");
        } else {
            scrollBtn.classList.remove("show");
        }
    }
};

// --- Блок меню ---
const menuBtn = document.getElementById("menu-btn"); // Переименовали в menuBtn
const nav = document.getElementById("footer-nav");

if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => {
        const isExpanded = menuBtn.getAttribute("aria-expanded") === "true";
        menuBtn.setAttribute("aria-expanded", !isExpanded);
        nav.toggleAttribute("hidden");
    });

    document.addEventListener("click", (event) => {
        if (!nav.contains(event.target) && event.target !== menuBtn) {
            menuBtn.setAttribute("aria-expanded", "false");
            nav.setAttribute("hidden", "");
        }
    });
}
