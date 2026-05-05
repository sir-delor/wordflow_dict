// dict-script.js
console.log("dict-script.js: начало выполнения");
// js/dict-script.js
import { openModal } from "./modal.js";

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
const glossaryData = [
  ...htmlData,
  ...cssData,
  ...jsData,
  ...phpData,
  ...mysqlData,
].filter(
  (item) =>
    item["Термин (RU/EN)"] && String(item["Термин (RU/EN)"]).trim() !== "",
);

let filteredData = [...glossaryData];
let currentIndex = 0;
const ITEMS_PER_PAGE = 10;

let searchQuery = "";
let currentTech = "all";
let currentLetter = "all";

// 4. ЛОГИКА ФИЛЬТРАЦИИ
// Сначала описываем КАК фильтровать
function applyFilters() {
  filteredData = glossaryData.filter((item) => {
    // Добавляем .trim() к технологии, чтобы "MySQL " и "MySQL" совпадали
    const tech = String(item["Технология"] || "")
      .toLowerCase()
      .trim();
    const term = String(item["Термин (RU/EN)"] || "").toLowerCase();
    const definition = String(item["Определение"] || "").toLowerCase();

    const matchTech = currentTech === "all" || tech === currentTech;
    const matchLetter =
      currentLetter === "all" ||
      term.trim().toUpperCase().startsWith(currentLetter);
    const matchSearch =
      searchQuery === "" ||
      term.includes(searchQuery) ||
      definition.includes(searchQuery);

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

// 5.1 Отрисовка карточек
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

    // --- Доступность ---
    card.tabIndex = 0; // Позволяет выбрать карточку клавишей Tab
    card.setAttribute("role", "button"); // Сообщает скринридерам, что это кнопка
    card.setAttribute("aria-label", `Термин: ${item["Термин (RU/EN)"]}`);

    // Открытие модалки по клику
    card.onclick = () => openModal(item);

    // Открытие модалки по нажатию Enter или Пробела
    card.onkeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault(); // Предотвращаем прокрутку страницы при нажатии пробела
        openModal(item);
      }
    };

    card.innerHTML = `
        <dt>${escapeHtml(item["Термин (RU/EN)"])}</dt>
        <dd class="tag-wrapper">
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

// 5. Панели управления отрисовка букв
function renderAlphabet() {
  const abc = document.getElementById("alphabet");
  if (!abc) return;

  // Собираем только те буквы, которые реально есть в данных
  const letters = [
    ...new Set(
      glossaryData
        .map((item) =>
          String(item["Термин (RU/EN)"] || "")
            .trim()
            .charAt(0)
            .toUpperCase(),
        )
        .filter(Boolean), // Убираем пустые значения
    ),
  ].sort();

  // 1. Используем button для "Все"
  abc.innerHTML =
    '<button type="button" class="letter active" data-letter="all">Все</button>';

  // 2. Рендерим остальные буквы как кнопки
  letters.forEach((l) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "letter";
    btn.innerText = l;
    btn.dataset.letter = l;
    abc.appendChild(btn);
  });

  // 3. Обработка клика (делегирование)
  abc.onclick = (e) => {
    const btn = e.target.closest(".letter");
    if (!btn) return;

    // Переключаем активный класс только внутри этого блока
    abc
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

  // Используем <button>
  techBlock.innerHTML =
    '<button type="button" class="tech-btn active" data-tech="all">ВСЕ</button>';

  techs.forEach((t) => {
    const btn = document.createElement("button");
    btn.type = "button"; // Важно, чтобы форма не отправлялась
    btn.className = "tech-btn";
    btn.innerText = t.toUpperCase();
    btn.dataset.tech = t.toLowerCase();
    techBlock.appendChild(btn);
  });

  // Обработчик  (делегирование работает так же)
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

// 6. ОБРАБОТЧИКИ СОБЫТИЙ (Слушатели)

// --- Поиск и ввод ---
const searchInput = document.getElementById("search");
if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    // Объединяем логику поиска: обрезаем пробелы и приводим к нижнему регистру
    searchQuery = e.target.value.toLowerCase().trim();
    applyFilters();
  });
}

// --- Бесконечный скролл ---
window.addEventListener("scroll", () => {
  // Проверяем, достигли ли низа страницы (с запасом 500px)
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
    // Убеждаемся, что переменные существуют и есть что подгружать
    if (
      typeof currentIndex !== "undefined" &&
      typeof filteredData !== "undefined"
    ) {
      if (currentIndex < filteredData.length) {
        renderNextBatch();
      }
    }
  }
});

// --- Статистика ---
function updateStats() {
  const stats = document.getElementById("stats");
  if (stats && typeof filteredData !== "undefined") {
    stats.innerText = `Найдено: ${filteredData.length}`;
  }
}

// --- Панель фильтров (Доступность и Переключение) ---
const filterBtn = document.querySelector(".filter-btn");
const filterCheckbox = document.getElementById("filter-toggle");
const filterContainer = document.querySelector(".filter-container");

if (filterBtn && filterCheckbox) {
  // Обновление атрибутов доступности (ARIA)
  function updateAriaAttributes() {
    const isOpen = filterCheckbox.checked;
    filterBtn.setAttribute("aria-expanded", isOpen);
    if (filterContainer) {
      filterContainer.setAttribute("aria-hidden", !isOpen);
    }
    // Автофокус на кнопку "Все" при открытии панели
    if (isOpen) {
      const allTechBtn = document.querySelector('[data-tech="all"]');
      if (allTechBtn) setTimeout(() => allTechBtn.focus(), 100);
    }
  }

  // Программное переключение
  function toggleFilters() {
    filterCheckbox.checked = !filterCheckbox.checked;
    updateAriaAttributes();
  }

  // Клик по кнопке (с учетом того, что это может быть LABEL)
  filterBtn.addEventListener("click", (e) => {
    if (e.target.tagName !== "LABEL") {
      toggleFilters();
    } else {
      // Если это label, чекбокс сменится сам, обновляем ARIA с задержкой
      setTimeout(updateAriaAttributes, 10);
    }
  });

  // Управление фильтром с клавиатуры
  filterBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleFilters();
    }
  });

  // Синхронизация при любом изменении чекбокса
  filterCheckbox.addEventListener("change", updateAriaAttributes);
}

// --- Фильтр по технологиям ---
const techFilter = document.getElementById("tech-filter");
if (techFilter) {
  techFilter.addEventListener("click", (e) => {
    const btn = e.target.closest(".tech-btn");
    if (!btn) return;

    techFilter
      .querySelectorAll(".tech-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    currentTech = btn.dataset.tech;
    applyFilters();
  });
}

// --- Фильтр по алфавиту ---
const alphabetFilter = document.getElementById("alphabet");
if (alphabetFilter) {
  alphabetFilter.addEventListener("click", (e) => {
    const btn = e.target.closest(".letter");
    if (!btn) return;

    alphabetFilter
      .querySelectorAll(".letter")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    currentLetter = btn.dataset.letter;
    applyFilters();
  });
}

// --- Кнопка "Закрыть" внутри панели (Доступность) ---
const closeBtn = document.querySelector(".close-btn");
if (closeBtn) {
  // Позволяем закрывать панель через Enter/Space, если фокус на "Закрыть"
  closeBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      closeBtn.click(); // Label сам сбросит чекбокс
    }
  });
}

// реализации перемещения по карточкам с помощью стрелок (вверх, вниз, влево, вправо
document.addEventListener("keydown", (e) => {
    // Проверяем, что нажата стрелка
    const isArrow = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key);
    if (!isArrow) return;

    // Проверяем, что мы сейчас сфокусированы на карточке
    const activeCard = document.activeElement;
    if (!activeCard || !activeCard.classList.contains('card')) return;

    // Ищем все карточки, которые сейчас видны на странице
    const allCards = Array.from(document.querySelectorAll('.card'));
    const currentIndex = allCards.indexOf(activeCard);

    let nextIndex;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") nextIndex = currentIndex + 1;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") nextIndex = currentIndex - 1;

    if (nextIndex >= 0 && nextIndex < allCards.length) {
        e.preventDefault();
        allCards[nextIndex].focus();
    }
});


// 7. ИНИЦИАЛИЗАЦИЯ
function init() {
  console.log("Загружено всего записей:", glossaryData.length);
  // Проверяем наличие функций перед вызовом, чтобы не было ошибок
  if (typeof renderAlphabet === "function") renderAlphabet();
  if (typeof renderTechFilters === "function") renderTechFilters();
  applyFilters();
}

init();
