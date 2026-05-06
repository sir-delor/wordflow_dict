// запуск конвертации через Как запустить: Просто введите в терминале:bash      node js/converter.js

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Пути: выходим из scripts (..) и идем в data
const DATA_DIR = path.join(__dirname, '..', 'data');
const EXCEL_FILE = path.join(DATA_DIR, 'Термины по технологиям.xlsx');

function runConverter() {
    try {
        if (!fs.existsSync(EXCEL_FILE)) {
            console.error(`Ошибка: Файл ${EXCEL_FILE} не найден!`);
            return;
        }

        const workbook = XLSX.readFile(EXCEL_FILE);
        console.log('=== ОТЧЕТ ПО КОНВЕРТАЦИИ ===\n');

        workbook.SheetNames.forEach((sheetName) => {
            const worksheet = workbook.Sheets[sheetName];
            const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
            const excelCount = rawData.length;

            // 1. Фильтрация по обязательным полям
            const filteredData = rawData.filter((item) => {
                return String(item["Технология"]).trim() !== "" &&
                       String(item["Буква"]).trim() !== "" &&
                       String(item["Термин (RU/EN)"]).trim() !== "" &&
                       String(item["Определение"]).trim() !== "";
            });

            const newCount = filteredData.length;
            const fileName = `dict-data-${sheetName.toLowerCase()}.js`;
            const filePath = path.join(DATA_DIR, fileName);

            // 2. Считаем, сколько записей было в старом файле
            let oldCount = 0;
            if (fs.existsSync(filePath)) {
                const oldContent = fs.readFileSync(filePath, 'utf8');
                // Ищем количество совпадений структуры объекта (простой способ подсчета)
                const matches = oldContent.match(/\{[\s\S]*?\}/g);
                oldCount = matches ? matches.length : 0;
            }

            // 3. Запись нового файла
            if (excelCount > 0) {
                const varName = sheetName.toLowerCase().replace(/[^a-z0-9]/g, '') + 'Data';
                const fileContent = `export const ${varName} = ${JSON.stringify(filteredData, null, 2)};`;
                
                fs.writeFileSync(filePath, fileContent, 'utf8');

                // 4. Вывод расширенной статистики
                console.log(`Лист [${sheetName}]:`);
                console.log(`  - В Excel найдено: ${excelCount}`);
                console.log(`  - Прошло проверку: ${newCount} (отсеяно пустых: ${excelCount - newCount})`);
                console.log(`  -----------------------------------`);
                console.log(`  - БЫЛО записей в файле:  ${oldCount}`);
                console.log(`  - СТАЛО записей в файле: ${newCount}`);
                
                const diff = newCount - oldCount;
                const diffText = diff >= 0 ? `ДОБАВЛЕНО: +${diff}` : `УДАЛЕНО: ${diff}`;
                console.log(`  - ИЗМЕНЕНИЕ: ${diffText}`);
                console.log(`  - Файл: ${fileName} успешно обновлен.\n`);
            }
        });

    } catch (error) {
        console.error('Ошибка:', error.message);
    }
}

runConverter();
