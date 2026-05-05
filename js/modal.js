// Вспомогательная функция (нужна внутри модуля)
function escapeHtml(text) {
    if (!text) return "";
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

// Экспортируем ОДНУ функцию
export function openModal(item) {
    const modal = document.getElementById("modal");
    const modalBody = document.getElementById("modal-body");

    if (!modal || !modalBody) return;

    const techName = String(item["Технология"] || "other").trim();
    const techClass = techName.toLowerCase();

    modalBody.innerHTML = `
        <div class="modal-header-info">
            <span class="tag" data-tech="${techClass}">${techName}</span>
            ${item["уровень"] ? `<span class="badge level-${item["уровень"].toLowerCase()}">${item["уровень"]}</span>` : ""}
        </div>
        <dl class="modal-definition-list">
            <dt class="modal-term">${escapeHtml(item["Термин (RU/EN)"])}</dt>
            <dd class="modal-main-desc">
                <strong>Определение:</strong>
                <p>${escapeHtml(item["Определение"])}</p>
            </dd>
            ${item["Перевод"] ? `<dd><strong>Перевод:</strong> ${escapeHtml(item["Перевод"])}</dd>` : ""}
            ${item["Синтаксис"] ? `<dd class="modal-syntax"><strong>Синтаксис:</strong> <code>${escapeHtml(item["Синтаксис"])}</code></dd>` : ""}
            ${item["Основные атрибуты"] ? `<dd><strong>Основные атрибуты:</strong> <p>${escapeHtml(item["Основные атрибуты"])}</p></dd>` : ""}
 
${ item["Связанные термины"] ? `
    <dd class="modal-related">
        <strong>Связанные термины:</strong>
        <div class="related-tags-container">
            ${item["Связанные термины"]
                .split(/[\r\n,;]+/)
                .map(term => term.trim())
                .filter(term => term.length > 0)
                .map(term => `
                    <button type="button" 
                            class="related-tag js-related-link" 
                            data-term="${escapeHtml(term)}">
                        ${escapeHtml(term)}
                    </button>
                `)
                .join('')}
        </div>
    </dd>
` : ""}



            ${item["Пример кода"] ? `<dd class="modal-code-section"><strong>Пример кода:</strong> <pre class="code-block"><code>${escapeHtml(item["Пример кода"])}</code></pre></dd>` : ""}
            ${item["Примечания"] ? `<dd class="modal-notes"><strong>Примечания:</strong> <p>${escapeHtml(item["Примечания"])}</p></dd>` : ""}
            ${item["Ссылка"] ? `<dd class="modal-link"><a href="${item["Ссылка"]}" target="_blank" class="reference">Читать подробнее на источнике →</a></dd>` : ""}
        </dl>
    `;

const relatedLinks = modalBody.querySelectorAll('.js-related-link');
relatedLinks.forEach(link => {
    link.onclick = () => {
        const searchTerm = link.dataset.term;
        const searchInput = document.getElementById('search');
        
        if (searchInput) {
            searchInput.value = searchTerm;
            // Имитируем ввод, чтобы сработал ваш поиск и фильтрация
            searchInput.dispatchEvent(new Event('input', { bubbles: true }));
            
            // Закрываем модалку, чтобы показать результат
            modal.classList.remove("show");
            
            // Скроллим вверх к результатам
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
});





    modal.classList.add("show");

    const closeModal = () => {
        modal.classList.remove("show");
    };

    const closeBtn = modal.querySelector(".close-modal") || modal.querySelector(".close");
    if (closeBtn) closeBtn.onclick = closeModal;

    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };

    // Закрытие по Escape
    const onEsc = (e) => {
        if (e.key === "Escape") {
            closeModal();
            document.removeEventListener("keydown", onEsc);
        }
    };
    document.addEventListener("keydown", onEsc);
}


