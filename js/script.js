/**
<<<<<<< HEAD
 * Глоссарий: 
 * Функции: кнопку сброса reset в панели поиска 
 */

const searchInput = document.getElementById('search');
const resetBtn = document.getElementById('search-reset');

resetBtn.addEventListener('click', () => {
  // 1. Очищаем значение
  searchInput.value = '';
  
  // 2. Возвращаем фокус на поле ввода
  searchInput.focus();
  
  // 3. Вызываем событие input вручную, 
  // чтобы сработали ваши фильтры (если они есть)
  searchInput.dispatchEvent(new Event('input'));
  
  // 4. Если вы скрываете блоки/алфавит, можно добавить вызов функции обновления
  // updateList(); 
});

=======
 * Глоссарий: Полный интерактивный скрипт
 * Функции: Динамические фильтры (Буквы + Технологии), Поиск, Infinite Scroll
 */
>>>>>>> 803490dbd3852bdcf0ad8bae6bbf3484d7c8ea1e
