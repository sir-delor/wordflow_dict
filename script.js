// Глобальные переменные
let glossaryData = [];
let filteredData = [];
let currentIndex = 0;
const ITEMS_PER_PAGE = 5;

// Функция экранирования HTML для защиты от XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
}

// Загрузка данных через динамический импорт
async function loadGlossary() {
    try {
        // Динамический импорт модуля с данными
        const { glossaryDataRaw } = await import('./data/data-dict.js');

        // Фильтрация данных: оставляем только записи с заполненным термином
        glossaryData = glossaryDataRaw.filter(item =>
            item['Термин (RU/EN)'] && String(item['Термин (RU/EN)']).trim() !== ''
        );

        // Инициализация интерфейса
        renderAlphabet();
        resetAndRender(glossaryData);
    } catch (error) {
        document.getElementById('glossary').innerText = 'Ошибка загрузки данных :(';
        console.error('Ошибка загрузки модуля:', error);
    }
}

// Сброс и рендеринг данных
function resetAndRender(dataToRender) {
    filteredData = dataToRender;
    currentIndex = 0;
    document.getElementById('glossary').innerHTML = '';
    updateStats();
    renderNextBatch();
}

// Рендеринг следующей партии карточек
function renderNextBatch() {
    const container = document.getElementById('glossary');
    const nextBatch = filteredData.slice(currentIndex, currentIndex + ITEMS_PER_PAGE);

    if (nextBatch.length === 0) return;

    nextBatch.forEach(item => {
        const card = document.createElement('div');
        const tech = String(item['Технология'] || 'other').toLowerCase().trim();
        card.className = `card ${tech}`;
        card.innerHTML = `
            <span class="tag">${tech}</span>
            <h3>${escapeHtml(item['Термин (RU/EN)'])}</h3>
            <p>${escapeHtml(item['Определение'])}</p>
            ${item['Пример кода'] ? `<code>${escapeHtml(item['Пример кода'])}</code>` : ''}
        `;
        container.appendChild(card);
    });
    currentIndex += ITEMS_PER_PAGE;
    updateStats();
}

// Обновление статистики
function updateStats() {
    const stats = document.getElementById('stats');
    stats.innerText = `Показано: ${Math.min(currentIndex, filteredData.length)} из ${filteredData.length}`;
}

// Обработчик скролла для подгрузки данных
window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        if (currentIndex < filteredData.length) renderNextBatch();
    }
});

// Обработчик поиска
document.getElementById('search').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (query === '') {
        resetAndRender(glossaryData);
    } else {
        const filtered = glossaryData.filter(item =>
            String(item['Термин (RU/EN)']).toLowerCase().includes(query) ||
            String(item['Определение']).toLowerCase().includes(query)
        );
        resetAndRender(filtered);
    }
});

// Рендеринг алфавита для фильтрации
function renderAlphabet() {
    const abc = document.getElementById('alphabet');
    const letters = [...new Set(glossaryData
        .map(item => String(item['Термин (RU/EN)']).trim().charAt(0).toUpperCase())
    )].sort();

    abc.innerHTML = '<span class="letter active" id="btn-all">Все</span>';

    document.getElementById('btn-all').onclick = () => {
        document.querySelectorAll('.letter').forEach(el => el.classList.remove('active'));
        document.getElementById('btn-all').classList.add('active');
        resetAndRender(glossaryData);
    };

    letters.forEach(l => {
        const span = document.createElement('span');
        span.className = 'letter';
        span.innerText = l;
        span.onclick = () => {
            document.querySelectorAll('.letter').forEach(el => el.classList.remove('active'));
            span.classList.add('active');
            resetAndRender(
                glossaryData.filter(i => String(i['Термин (RU/EN)']).toUpperCase().startsWith(l))
            );
        };
        abc.appendChild(span);
    });
}

// Запуск загрузки данных при инициализации
loadGlossary();
