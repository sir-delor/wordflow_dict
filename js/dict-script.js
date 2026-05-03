// dict-script.js
console.log("dict-script.js: начало выполнения");

// 1. Импорты (словарей)
import { htmlData } from "../data/dict-data-html.js";
import { cssData } from "../data/dict-data-css.js";
import { jsData } from "../data/dict-data-js.js";
import { phpData } from "../data/dict-data-php.js";
import { mysqlData } from "../data/dict-data-mysql.js";

// 2. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
function escapeHtml(text) {
    if (typeof text !== "string") return "";
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;"); 
}

// 3. ДАННЫЕ И СОСТОЯНИЕ
const glossaryData = [...htmlData, ...cssData, ...jsData, ...phpData, ...mysqlData].filter(
    (item) => item["Термин (RU/EN)"] && String(item["Термин (RU/EN)"]).trim() !== ""
);

let filteredData = [...glossaryData];
let currentIndex = 0;
const ITEMS_PER_PAGE = 10;

let currentTech = "all";
let currentLetter = "all";
let searchQuery = "";

// 4. ЛОГИКА ФИЛЬТРАЦИИ
function applyFilters() {
    filteredData = glossaryData.filter((item) => {
        // Добавляем .trim() к технологии, чтобы "MySQL " и "MySQL" совпадали
        const tech = String(item["Технология"] || "").toLowerCase().trim();
        const term = String(item["Термин (RU/EN)"] || "").toLowerCase();
        const definition = String(item["Определение"] || "").toLowerCase();

        const matchTech = currentTech === "all" || tech === currentTech;
        const matchLetter = currentLetter === "all" || term.trim().toUpperCase().startsWith(currentLetter);
        const matchSearch = searchQuery === "" || term.includes(searchQuery) || definition.includes(searchQuery);

        return matchTech && matchLetter && matchSearch;
    });
    
    // Проверка для отладки
    console.log(`Фильтр: ${currentTech}, Найдено: ${filteredData.length}`);
    
    if (typeof resetAndRender === "function") {
        resetAndRender();
    }
}


// 5. ФУНКЦИИ ОТРИСОВКИ 
function resetAndRender() {
  currentIndex = 0;
  document.getElementById("glossary").innerHTML = "";
  updateStats();
  renderNextBatch();
}

// 3. Отрисовка карточек
function renderNextBatch() {
  const container = document.getElementById("glossary");
  if (!container) return;

  const nextBatch = filteredData.slice(
    currentIndex,
    currentIndex + ITEMS_PER_PAGE,
  );

  if (nextBatch.length === 0 && currentIndex === 0) {
    container.innerHTML = '<div class="empty-msg">Ничего не найдено</div>';
    return;
  }

  nextBatch.forEach((item) => {
    const card = document.createElement("dl");
    const techName = String(item["Технология"] || "other").trim();
    const techClass = techName.toLowerCase();

    card.className = `card ${techClass}`;
    card.style.cursor = "pointer";
    card.onclick = () => openModal(item);

    card.innerHTML = `
        <dt>${escapeHtml(item["Термин (RU/EN)"])}</dt>
        <dd class="tag-wrapper">
            <!-- Добавляем data-tech для CSS и выводим оригинальное имя технологии -->
            <span class="tag" data-tech="${techClass}">${techName}</span>
        </dd>
        <dd class="definition">
            ${escapeHtml(item["Определение"])}
        </dd>
        <dd class="more-link-wrapper">
            <span class="more-link">Подробнее →</span>
        </dd>
    `;
    container.appendChild(card);
  });

  currentIndex += ITEMS_PER_PAGE;
  updateStats();
}

// 4. Панели управления
function renderAlphabet() {
  const abc = document.getElementById("alphabet");
  if (!abc) return;
  const letters = [
    ...new Set(
      glossaryData.map((item) =>
        String(item["Термин (RU/EN)"]).trim().charAt(0).toUpperCase(),
      ),
    ),
  ].sort();

  abc.innerHTML = '<span class="letter active" data-letter="all">Все</span>';
  letters.forEach((l) => {
    const span = document.createElement("span");
    span.className = "letter";
    span.innerText = l;
    span.dataset.letter = l;
    abc.appendChild(span);
  });

  abc.onclick = (e) => {
    const btn = e.target.closest(".letter");
    if (!btn) return;
    document
      .querySelectorAll(".letter")
      .forEach((el) => el.classList.remove("active"));
    btn.classList.add("active");
    currentLetter = btn.dataset.letter;
    applyFilters();
  };
}

function renderTechFilters() {
  const techBlock = document.getElementById("tech-filter");
  if (!techBlock) return;
  const techs = [
    ...new Set(
      glossaryData
        .map((i) => String(i["Технология"] || "").trim())
        .filter(Boolean),
    ),
  ].sort();

  techBlock.innerHTML =
    '<span class="tech-btn active" data-tech="all">Все</span>';
  techs.forEach((t) => {
    const span = document.createElement("span");
    span.className = "tech-btn";
    span.innerText = t.toUpperCase();
    span.dataset.tech = t.toLowerCase();
    techBlock.appendChild(span);
  });

  techBlock.onclick = (e) => {
    const btn = e.target.closest(".tech-btn");
    if (!btn) return;
    document
      .querySelectorAll(".tech-btn")
      .forEach((el) => el.classList.remove("active"));
    btn.classList.add("active");
    currentTech = btn.dataset.tech;
    applyFilters();
  };
}

// 5. Обработчики событий
document.getElementById("search").addEventListener("input", (e) => {
  searchQuery = e.target.value.toLowerCase().trim();
  applyFilters();
});

window.addEventListener("scroll", () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
    if (currentIndex < filteredData.length) renderNextBatch();
  }
});

function updateStats() {
  const stats = document.getElementById("stats");
  if (stats) stats.innerText = `Найдено: ${filteredData.length}`;
}

function openModal(item) {
  const modal = document.getElementById("modal");
  const modalBody = document.getElementById("modal-body");

  // Подготовка данных
  const techName = String(item["Технология"] || "other").trim();
  const techClass = techName.toLowerCase();

  modalBody.innerHTML = `
    <div class="modal-header-info">
      <!-- Добавляем атрибут data-tech для подхвата цветов из CSS -->
      <span class="tag" data-tech="${techClass}">${techName}</span>
      
      ${item["уровень"] ? `<span class="badge level-${item["уровень"].toLowerCase()}">${item["уровень"]}</span>` : ""}
    </div>

        <dl class="modal-definition-list">
            <!-- Главный заголовок -->
            <dt class="modal-term">${escapeHtml(item["Термин (RU/EN)"])}</dt>
            
            <dd class="modal-main-desc">
                <strong>Определение:</strong>
                <p>${escapeHtml(item["Определение"])}</p>
            </dd>

            ${item["Перевод"] ? `<dd><strong>Перевод:</strong> ${escapeHtml(item["Перевод"])}</dd>` : ""}

            ${
              item["Синтаксис"]
                ? `
                <dd class="modal-syntax">
                    <strong>Синтаксис:</strong>
                    <code>${escapeHtml(item["Синтаксис"])}</code>
                </dd>
            `
                : ""
            }

            ${
              item["Основные атрибуты"]
                ? `
                <dd>
                    <strong>Основные атрибуты:</strong>
                    <p>${escapeHtml(item["Основные атрибуты"])}</p>
                </dd>
            `
                : ""
            }

            ${
              item["Связанные термины"]
                ? `
                <dd class="modal-related">
                    <strong>Связанные термины:</strong>
                    <!-- Заменяем точку с пробелом на перенос строки для красоты -->
                    <p>${escapeHtml(item["Связанные термины"]).replace(/\. /g, ".<br>")}</p>
                </dd>
            `
                : ""
            }

${
  item["Пример кода"]
    ? `
  <dd class="modal-code-section">
    <strong>Пример кода:</strong>
    <pre class="code-block"><code>${escapeHtml(item["Пример кода"])}</code></pre>
  </dd>`
    : ""
}


            ${
              item["Примечания"]
                ? `
                <dd class="modal-notes">
                    <strong>Примечания:</strong>
                    <p>${escapeHtml(item["Примечания"])}</p>
                </dd>
            `
                : ""
            }

            ${
              item["Ссылка"]
                ? `
                <dd class="modal-link">
                    <a href="${item["Ссылка"]}" target="_blank" class="reference">Читать подробнее на источнике →</a>
                </dd>
            `
                : ""
            }
        </dl>
    `;

  modal.classList.add("show");

  const closeModal = () => {
    modal.classList.remove("show");
  };

  // Исправлено: ищем крестик внутри модалки
  const closeBtn =
    modal.querySelector(".close-modal") || modal.querySelector(".close");
  if (closeBtn) closeBtn.onclick = closeModal;

  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };
}


// 6. ОБРАБОТЧИКИ СОБЫТИЙ (Слушатели)
const searchInput = document.getElementById("search");
if (searchInput) {
    searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value.toLowerCase();
        applyFilters();
    });
}


// 7. ИНИЦИАЛИЗАЦИЯ 
function init() {
    console.log("Загружено всего записей:", glossaryData.length);
    // Проверяем наличие функций перед вызовом, чтобы не было ошибок
    if (typeof renderAlphabet === "function") renderAlphabet();
    if (typeof renderTechFilters === "function") renderTechFilters();
    applyFilters();
}

init(); 


