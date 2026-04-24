console.log("dict-script.js: начало выполнения");

let glossaryData = [];
let filteredData = [];
let currentIndex = 0;
const ITEMS_PER_PAGE = 5;

// Функция для декодирования HTML‑сущностей (например, &lt; → <)
function decodeHtmlEntities(text) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/html');
  return doc.documentElement.textContent;
}

// Функция для экранирования HTML‑сущностей перед выводом в DOM (защита от XSS)
function escapeHtml(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Обработчик события для поля поиска
document.getElementById("search").addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase().trim();

  if (query === "") {
    // Если строка поиска пуста — показываем все термины
    resetAndRender(glossaryData);
  } else {
    // Фильтруем данные: декодируем перед сравнением
    const filtered = glossaryData.filter((item) => {
      // Декодируем значения полей перед поиском
      const decodedTerm = decodeHtmlEntities(String(item["Термин (RU/EN)"]));
      const decodedDefinition = decodeHtmlEntities(String(item["Определение"]));

      // Ищем запрос в декодированных данных (без учёта регистра)
      return decodedTerm.toLowerCase().includes(query) ||
             decodedDefinition.toLowerCase().includes(query);
    });

    // Отображаем отфильтрованные результаты
    resetAndRender(filtered);
  }
});



async function loadGlossary() {
  console.log("Начинаем загрузку данных...");
  try {
    const { glossaryDataRaw } = await import("./data/data-dict.js");
    console.log("Данные успешно загружены:", glossaryDataRaw);

    glossaryData = glossaryDataRaw.filter(
      (item) =>
        item["Термин (RU/EN)"] && String(item["Термин (RU/EN)"]).trim() !== "",
    );

    renderAlphabet();
    resetAndRender(glossaryData);
  } catch (error) {
    console.error("Критическая ошибка загрузки:", error);
    document.getElementById("glossary").innerHTML = `
            <div class="error">
                Ошибка загрузки данных:<br>
                ${escapeHtml(error.message)}
            </div>
        `;
  }
}

function resetAndRender(dataToRender) {
  filteredData = dataToRender;
  currentIndex = 0;
  document.getElementById("glossary").innerHTML = "";
  updateStats();
  renderNextBatch();
}

function renderNextBatch() {
  const container = document.getElementById("glossary");
  const nextBatch = filteredData.slice(
    currentIndex,
    currentIndex + ITEMS_PER_PAGE,
  );

  if (nextBatch.length === 0) return;

  nextBatch.forEach((item) => {
    const card = document.createElement("div");
    const tech = String(item["Технология"] || "other")
      .toLowerCase()
      .trim();
    card.className = `card ${tech}`;
    card.innerHTML = `
            <span class="tag">${escapeHtml(tech)}</span>
            <h3>${escapeHtml(item["Термин (RU/EN)"])}</h3>
            <p>${escapeHtml(item["Определение"])}</p>
            ${item["Пример кода"] ? `<code>${escapeHtml(item["Пример кода"])}</code>` : ""}
        `;
    container.appendChild(card);
  });
  currentIndex += ITEMS_PER_PAGE;
  updateStats();
}

function updateStats() {
  const stats = document.getElementById("stats");
  stats.innerText = `Показано: ${Math.min(currentIndex, filteredData.length)} из ${filteredData.length}`;
}

window.addEventListener("scroll", () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
    if (currentIndex < filteredData.length) renderNextBatch();
  }
});



document.getElementById("search").addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase().trim();
  if (query === "") {
    resetAndRender(glossaryData);
  } else {
    const filtered = glossaryData.filter(
      (item) =>
        String(item["Термин (RU/EN)"]).toLowerCase().includes(query) ||
        String(item["Определение"]).toLowerCase().includes(query),
    );
    resetAndRender(filtered);
  }
});


function renderAlphabet() {
  const abc = document.getElementById("alphabet");
  const letters = [
    ...new Set(
      glossaryData.map((item) =>
        String(item[escapeHtml("Термин (RU/EN)")])
          .trim()
          .charAt(0)
          .toUpperCase(),
      ),
    ),
  ].sort();
  
  

  abc.innerHTML = `<span class="letter active" id="btn-all">${escapeHtml("Все")}</span>`;

  document.getElementById("btn-all").onclick = () => {
    document

      .querySelectorAll(".letter")
      .forEach((el) => el.classList.remove("active"));
    document.getElementById("btn-all").classList.add("active");
    resetAndRender(glossaryData);
  };
  

  
  letters.forEach((l) => {
    const span = document.createElement("span");
    span.className = "letter";
    span.innerText = escapeHtml(l);

    span.onclick = () => {
      document
        .querySelectorAll(".letter")
        .forEach((el) => el.classList.remove("active"));
      span.classList.add("active");
      resetAndRender(
        glossaryData.filter((i) =>
          String(i["Термин (RU/EN)"]).toUpperCase().startsWith(l),
        ),
      );
    };
    abc.appendChild(span);
  });
}

// Запуск загрузки данных при инициализации
loadGlossary();
