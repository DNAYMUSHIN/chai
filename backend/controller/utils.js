const ExcelJS = require('exceljs');


async function convectorNumbersToWord(num){
    const units = ['', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять'];
    const teens = ['десять', 'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать', 'пятнадцать', 'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать'];
    const tens = ['', '', 'двадцать', 'тридцать', 'сорок', 'пятьдесят', 'шестьдесят', 'семьдесят', 'восемьдесят', 'девяносто'];
    const hundreds = ['', 'сто', 'двести', 'триста', 'четыреста', 'пятьсот', 'шестьсот', 'семьсот', 'восемьсот', 'девятьсот'];
    const thousands = ['', 'тысяча', 'тысячи', 'тысяч'];

    if (num === 0) return 'ноль рублей';

    let result = '';

    // Обработка тысяч
    const thousand = Math.floor(num / 1000);
    if (thousand > 0) {
        if (thousand === 1) {
            result += 'одна ' + thousands[1] + ' ';
        } else if (thousand >= 2 && thousand <= 4) {
            result += getHundredsTensUnits(thousand, units, teens, tens) + ' ' + thousands[2] + ' ';
        } else {
            result += getHundredsTensUnits(thousand, units, teens, tens) + ' ' + thousands[3] + ' ';
        }
        num %= 1000;
    }

    // Обработка оставшейся части (сотни, десятки, единицы)
    if (num > 0) {
        result += await getHundredsTensUnits(num, units, teens, tens, hundreds) + ' ';
    }

    // Определение правильной формы слова "рубль"
    const lastTwo = num % 100;
    const lastDigit = num % 10;

    if (lastTwo >= 11 && lastTwo <= 19) {
        result += 'рублей';
    } else {
        switch (lastDigit) {
            case 1:
                result += 'рубль';
                break;
            case 2:
            case 3:
            case 4:
                result += 'рубля';
                break;
            default:
                result += 'рублей';
        }
    }

    return result.trim();
}



async function getHundredsTensUnits(num, units, teens, tens, hundreds = null) {
    let str = '';
    if (hundreds) {
        const hundred = Math.floor(num / 100);
        if (hundred > 0) {
            str += hundreds[hundred] + ' ';
        }
        num %= 100;
    }

    if (num >= 10 && num <= 19) {
        str += teens[num - 10] + ' ';
    } else {
        const ten = Math.floor(num / 10);
        if (ten > 0) {
            str += tens[ten] + ' ';
        }
        const unit = num % 10;
        if (unit > 0) {
            str += units[unit] + ' ';
        }
    }

    return str.trim();
}


async function generateProduct(products, res, buyer = 'ЧАЙНАЯ ЛАВКА'){
    const data = new Date()
    const d = data.toISOString().slice(0, 10).split('-').reverse().join(".")
    try{
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(`Отчет по товарам ${d}`);
        worksheet.columns = [
            { width: 5 },  // №
            { width: 25 }, // Товар
            { width: 10 }, // Кол-во
            { width: 5 },  // Ед.
            { width: 10 }, // Цена
            { width: 10 }  // Сумма
        ];

        worksheet.mergeCells('A1:F1');
        worksheet.getCell('A1').value = `Отчет на день - ${d}`;
        worksheet.getCell('A1').font = { bold: true, size: 14 };
        worksheet.getCell('A1').alignment = { horizontal: 'center' };

        const headerRow = worksheet.addRow(['№', 'Товар', 'Количество', 'Ед.', 'Цена', 'Сумма']);
        headerRow.font = { bold: true };
        headerRow.alignment = { horizontal: 'center' };
        headerRow.eachCell(cell => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });


        fillingcell(worksheet, products)

        await workbook.xlsx.write(res)
    }
    catch(err){
        console.log("Ошибка - ", err)
        throw err
    }
}


async function generateReportRevenueForPeriod(orders, products, start, end, res, buyer = "ЧАЙНАЯ ЛАВКА") {
    try {
        const workbook = new ExcelJS.Workbook();

        // 1. Создаем лист со сводкой по заказам
        const summarySheet = workbook.addWorksheet('Сводка по заказам');
        summarySheet.columns = [
            { header: 'Номер заказа', key: 'Номер заказа', width: 20 },
            { header: 'Дата заказа', key: 'Дата заказа', width: 15 },
            { header: 'Сумма заказа', key: 'Сумма заказа', width: 15, style: { numFmt: '#,##0.00' } }
        ];
        summarySheet.addRows(summaryData);

        // Добавляем итоговую сумму
        const totalSum = summaryData.reduce((sum, order) => sum + parseFloat(order["Сумма заказа"]), 0);
        summarySheet.addRow({
            "Номер заказа": "ИТОГО:",
            "Сумма заказа": totalSum
        });

        // 2. Создаем лист с детализацией товаров
        const detailSheet = workbook.addWorksheet('Детализация товаров');
        detailSheet.columns = [
            { header: 'Номер заказа', key: 'Номер заказа', width: 20 },
            { header: 'Название товара', key: 'Название товара', width: 40 },
            { header: 'Тип товара', key: 'Тип товара', width: 15 },
            { header: 'Количество', key: 'Количество', width: 12 },
            { header: 'Цена за единицу', key: 'Цена за единицу', width: 15, style: { numFmt: '#,##0.00' } },
            { header: 'Сумма', key: 'Сумма', width: 15, style: { numFmt: '#,##0.00' } }
        ];
        detailSheet.addRows(detailData);

        // 3. Записываем книгу в ответ
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error("Ошибка при генерации Excel:", error);
        throw error;
    }
}


async function foo(products, buyer = 'ЧАЙНАЯ ЛАВКА', day) {

    const data = new Date()
    const d = data.toISOString().slice(0, 10).split('-').reverse().join(".")
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Отчет по продажам за ${day}`);

    // Настройка колонок
    worksheet.columns = [
        { width: 5 },  // №
        { width: 25 }, // Товар
        { width: 10 }, // Кол-во
        { width: 5 },  // Ед.
        { width: 10 }, // Цена
        { width: 10 }  // Сумма
    ];

    // Заголовок
    worksheet.mergeCells('A1:F1');
    worksheet.getCell('A1').value = `Отчет за день - ${d}`;
    worksheet.getCell('A1').font = { bold: true, size: 14 };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    // Покупатель и поставщик
    // worksheet.mergeCells('A3:F3');
    // worksheet.getCell('A3').value = 'Покупатель:';
    // worksheet.getCell('A3').font = { bold: true };

    worksheet.mergeCells('A4:G4');
    worksheet.getCell('A4').value = `"${buyer}"`;
    worksheet.getCell('A4').alignment = { horizontal: 'center' };

    // worksheet.mergeCells('A5:F5');
    // worksheet.getCell('A5').value = 'Поставщик:';
    // worksheet.getCell('A5').font = { bold: true };

    // worksheet.mergeCells('A6:F6');
    // worksheet.getCell('A6').value = '"______"';
    // worksheet.getCell('A6').alignment = { horizontal: 'center' };

    // Шапка таблицы
    const headerRow = worksheet.addRow(['№', 'Товар', 'Количество', 'Ед.', 'Цена', 'Сумма']);
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: 'center' };
    headerRow.eachCell(cell => {
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    });

    // Заполнение данными из массива products
    fillingcell(worksheet, products)


    // Итоговая строка
    const totalRowNum = worksheet.rowCount + 1;
    worksheet.mergeCells(`A${totalRowNum}:E${totalRowNum}`);
    worksheet.getCell(`A${totalRowNum}`).value = 'Итого (Выручка):';
    worksheet.getCell(`A${totalRowNum}`).font = { bold: true };
    worksheet.getCell(`A${totalRowNum}`).alignment = { horizontal: 'right' };

    worksheet.getCell(`F${totalRowNum}`).value = totalSum.toFixed(2);
    worksheet.getCell(`F${totalRowNum}`).font = { bold: true };

    // Дополнительная информация
    const infoRow1 = worksheet.addRow(['']);
    worksheet.mergeCells(`A${worksheet.rowCount}:F${worksheet.rowCount}`);
    worksheet.getCell(`A${worksheet.rowCount}`).value =
        `Всего наименований ${products.length}, на сумму ${totalSum.toFixed(2)}`;
    worksheet.getCell(`A${worksheet.rowCount}`).alignment = { horizontal: 'center' };

    // Функция для преобразования числа в пропись (упрощенная версия)


    const infoRow2 = worksheet.addRow(['']);
    worksheet.mergeCells(`A${worksheet.rowCount}:F${worksheet.rowCount}`);
    worksheet.getCell(`A${worksheet.rowCount}`).value = await convectorNumbersToWord(totalSum);
    worksheet.getCell(`A${worksheet.rowCount}`).font = { bold: true };
    worksheet.getCell(`A${worksheet.rowCount}`).alignment = { horizontal: 'center' };

    // Подписи
    const signRow = worksheet.addRow(['']);
    worksheet.mergeCells(`A${worksheet.rowCount}:B${worksheet.rowCount}`);
    worksheet.getCell(`A${worksheet.rowCount}`).value = 'Руководитель ______ (______)';

    worksheet.mergeCells(`E${worksheet.rowCount}:F${worksheet.rowCount}`);
    worksheet.getCell(`E${worksheet.rowCount}`).value = 'Бухгалтер ______ (______)';

    // Сохранение файла
    const fileName = `Заказ_${buyer}.xlsx`;
    await workbook.xlsx.writeFile(fileName);
    console.log(`Файл "${fileName}" успешно создан!`);
    return fileName;
}

async function generationRepProduct(product) {
    const data = new Date()
    const d = data.toISOString().slice(0, 10).split('-').reverse().join(".")
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet(`Товары`);
    worksheet.columns = [
        { width: 5 },  // №
        { width: 25 }, // Товар
        { width: 15 }, // Кол-во
        { width: 15 },  // Ед.
        { width: 15 }, // Цена
        { width: 15 }, // Сумма
    ];
    worksheet.mergeCells('B2:H2')
    worksheet.getCell('B2').value = `Отчетность по имеющимся товарам за ${d}`
    worksheet.insertRow(8, ["№", "Название товара", "Тип продукта", "Количество", "Цена", "Сумма"])
    await fillingcell(worksheet, product)

    const fileName = `Отчет_${d}.xlsx`;
    await workbook.xlsx.write(fileName);

}



async function fillingcell(worksheet, products) {
    let totalSum = 0;
    products.forEach((products, index) => {
        // Определяем единицы измерения на основе типа товара
        const unit = products.status === 1 ? 'кг' : 'шт';

        // Рассчитываем сумму для строки
        const sum = products.price_unit * products.quantity;
        totalSum += sum;

        const row = worksheet.addRow([
            index + 1,
            products.product_name,
            unit,
            products.quantity,
            products.price_unit,
            sum
        ]);

        row.eachCell(cell => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });
    });
    return worksheet
}






module.exports = {foo, generationRepProduct, generateProduct, generateReportRevenueForPeriod}