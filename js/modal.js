// js/modal.js

// Универсальная функция экранирования HTML
const escapeHtml = (text) => {
  if (typeof text !== "string") return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
};

// Функция открытия модального окна
function openModal(item) {
  const modal = document.getElementById("modal");
  const modalBody = document.getElementById("modal-body");

  if (!modal || !modalBody) {
    console.error("Элементы модального окна не найдены");
    return;
  }

  modalBody.innerHTML = `
    <div class="modal-header-info">
      <span class="tag">${escapeHtml(item["Технология"] || "Не указана")}</span>
      ${item["уровень"] ? `<span class="badge">${escapeHtml(item["уровень"])}</span>` : ""}
    </div>
    <dl class="modal-definition-list">
      <dt class="modal-term">${escapeHtml(item["Термин (RU/EN)"])}</dt>
      <dd class="modal-main-desc">
        <strong>Определение:</strong>
        <p>${escapeHtml(item["Определение"] || "Нет данных")}</p>
      </dd>
      ${item["Перевод"] ? `<dd><strong>Перевод:</strong> ${escapeHtml(item["Перевод"])}</dd>` : ""}
      ${
        item["Синтаксис"]
          ? `<dd class="modal-syntax"><strong>Синтаксис:</strong><code>${escapeHtml(item["Синтаксис"])}</code></dd>`
          : ""
      }
      ${
        item["Основные атрибуты"]
          ? `<dd><strong>Основные атрибуты:</strong><p>${escapeHtml(item["Основные атрибуты"])}</p></dd>`
          : ""
      }
      ${
        item["Связанные термины"]
          ? `<dd class="modal-related"><strong>Связанные термины:</strong><p>${escapeHtml(item["Связанные термины"]).replace(/\. /g, ".<br>")}</p></dd>`
          : ""
      }
      ${
        item["Пример кода"]
          ? `<dd class="modal-code"><strong>Пример кода:</strong><pre><code>${escapeHtml(item["Пример кода"])}</code></pre></dd>`
          : ""
      }
      ${
        item["Примечания"]
          ? `<dd class="modal-notes"><strong>Примечания:</strong><p>${escapeHtml(item["Примечания"])}</p></dd>`
          : ""
      }
      ${
        item["Ссылка"]
          ? `<dd class="modal-link"><a href="${item["Ссылка"]}" target="_blank" class="reference">Читать подробнее на источнике →</a></dd>`
          : ""
      }
    </dl>
  `;

  modal.classList.add("show");
  document.body.style.overflow = "hidden";
}

// Функция закрытия модального окна
function closeModal() {
  const modal = document.getElementById("modal");
  if (modal) {
    modal.classList.remove("show");
    document.body.style.overflow = "";
  }
}

// Инициализация обработчиков событий для модального окна
function initModalHandlers() {
  // Закрытие по ESC
  const handleKeydown = (e) => {
    if (e.key === "Escape") closeModal();
  };
  document.removeEventListener("keydown", handleKeydown);
  document.addEventListener("keydown", handleKeydown);

  const modal = document.getElementById("modal");
  if (modal) {
    const closeBtn =
      modal.querySelector(".close-modal") || modal.querySelector(".close");

    if (closeBtn && closeBtn._closeHandler) {
      closeBtn.removeEventListener("click", closeBtn._closeHandler);
    }

    const clickHandler = () => closeModal();
    closeBtn?.addEventListener("click", clickHandler);
    closeBtn._closeHandler = clickHandler;

    const modalClickHandler = (e) => {
      if (e.target === modal) closeModal();
    };
    modal.removeEventListener("click", modalClickHandler);
    modal.addEventListener("click", modalClickHandler);
  }
}

// Очистка обработчиков
function cleanupModalHandlers() {
  document.removeEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
  const modal = document.getElementById("modal");
  if (modal) {
    const closeBtn =
      modal.querySelector(".close-modal") || modal.querySelector(".close");
    if (closeBtn) closeBtn.onclick = null;
    modal.onclick = null;
  }
}

// Экспорт функций
