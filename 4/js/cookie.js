// cookie.js

// Базовые функции для работы с cookies
function setCookie(name, value, days = 365, path = '/') {
    try {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = `expires=${date.toUTCString()}`;
        document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)};${expires};path=${path};SameSite=Strict`;
        console.log(`Cookie "${name}" успешно установлена`);
        return true;
    } catch (error) {
        console.error(`Ошибка при установке cookie "${name}":`, error);
        return false;
    }
}

function getCookie(name) {
    try {
        const cookieName = `${encodeURIComponent(name)}=`;
        const cookies = document.cookie.split(';');
        
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.indexOf(cookieName) === 0) {
                const value = cookie.substring(cookieName.length, cookie.length);
                return decodeURIComponent(value);
            }
        }
        return null;
    } catch (error) {
        console.error(`Ошибка при получении cookie "${name}":`, error);
        return null;
    }
}

function deleteCookie(name, path = '/') {
    try {
        document.cookie = `${encodeURIComponent(name)}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=${path}`;
        console.log(`Cookie "${name}" успешно удалена`);
        return true;
    } catch (error) {
        console.error(`Ошибка при удалении cookie "${name}":`, error);
        return false;
    }
}

// ===== НОВЫЕ ФУНКЦИИ ДЛЯ РАБОТЫ С ОБЪЕКТАМИ =====

/**
 * Сохраняет объект в cookie с проверкой размера
 * @param {string} name - имя cookie
 * @param {Object} data - данные для сохранения
 * @param {number} days - срок хранения в днях
 * @returns {boolean} - успешно ли сохранено
 */
function setCookieJSON(name, data, days = 365) {
    try {
        // Проверяем размер данных
        const jsonString = JSON.stringify(data);
        const sizeInBytes = new Blob([jsonString]).size;
        
        // Максимальный размер cookie ~4KB (4096 байт), оставляем запас
        if (sizeInBytes > 3500) {
            console.warn(`Данные для cookie "${name}" слишком большие (${sizeInBytes} bytes). Обрезаем...`);
            
            // Если это массив отзывов, применяем сжатие
            if (Array.isArray(data) && data[0] && data[0].hasOwnProperty('image')) {
                const compressedData = compressReviewsData(data);
                const compressedString = JSON.stringify(compressedData);
                setCookie(name, compressedString, days);
                console.log(`Данные сжаты до ${new Blob([compressedString]).size} bytes`);
                return true;
            }
        }
        
        // Если размер нормальный или это не массив отзывов
        setCookie(name, jsonString, days);
        return true;
    } catch (error) {
        console.error(`Ошибка при сериализации данных для cookie "${name}":`, error);
        return false;
    }
}

/**
 * Сжимает данные отзывов для cookie
 * @param {Array} reviews - массив отзывов
 * @returns {Array} - сжатый массив отзывов
 */
function compressReviewsData(reviews) {
    if (!Array.isArray(reviews)) return reviews;
    
    return reviews.map((review, index) => {
        // Копируем отзыв без изменений
        const compressedReview = { ...review };
        
        // Если есть изображение и это не первые 3 отзыва или изображение слишком большое
        if (compressedReview.image) {
            // Проверяем размер изображения (base64 строки)
            const imageSize = new Blob([compressedReview.image]).size;
            
            // Если изображение больше 500 байт или это старый отзыв (не первые 3)
            if (imageSize > 500 || index > 2) {
                // Сильно сжимаем или удаляем
                if (compressedReview.image.length > 1000) {
                    // Обрезаем base64 строку
                    compressedReview.image = compressedReview.image.substring(0, 500) + '...';
                }
            }
        }
        
        return compressedReview;
    });
}

/**
 * Получает и десериализует объект из cookie
 * @param {string} name - имя cookie
 * @returns {Object|null} - полученные данные или null
 */
function getCookieJSON(name) {
    try {
        const value = getCookie(name);
        if (value) {
            // Пробуем распарсить JSON
            return JSON.parse(value);
        }
        return null;
    } catch (error) {
        console.error(`Ошибка при парсинге JSON из cookie "${name}":`, error);
        return null;
    }
}

/**
 * Проверяет, можно ли сохранить данные в cookie
 * @param {Object} data - данные для проверки
 * @returns {Object} - результат проверки
 */
function canSaveToCookie(data) {
    try {
        const jsonString = JSON.stringify(data);
        const sizeInBytes = new Blob([jsonString]).size;
        
        return {
            canSave: sizeInBytes <= 3500,
            size: sizeInBytes,
            maxSize: 3500,
            message: sizeInBytes <= 3500 ? 'OK' : `Слишком большой: ${sizeInBytes} байт`
        };
    } catch (error) {
        return {
            canSave: false,
            size: 0,
            maxSize: 3500,
            message: 'Ошибка проверки'
        };
    }
}

/**
 * Очищает старые данные из cookies (для отзывов)
 * @param {string} name - имя cookie
 * @param {number} maxAge - максимальный возраст в днях
 */
function cleanOldCookieData(name, maxAge = 30) {
    const data = getCookieJSON(name);
    if (!data || !Array.isArray(data)) return;
    
    const now = new Date();
    const maxAgeMs = maxAge * 24 * 60 * 60 * 1000;
    
    // Фильтруем только свежие отзывы
    const freshData = data.filter(item => {
        if (!item.date) return true;
        const itemDate = new Date(item.date);
        return (now - itemDate) <= maxAgeMs;
    });
    
    // Если данных стало меньше, сохраняем
    if (freshData.length < data.length) {
        setCookieJSON(name, freshData, maxAge);
        console.log(`Очищено ${data.length - freshData.length} старых записей из cookie "${name}"`);
    }
}

/**
 * Получает информацию о размере всех cookies
 * @returns {Object} - информация о размерах
 */
function getCookiesInfo() {
    const cookies = getAllCookies();
    let totalSize = 0;
    const details = {};
    
    for (let [name, value] of Object.entries(cookies)) {
        const size = new Blob([`${name}=${value}`]).size;
        details[name] = size;
        totalSize += size;
    }
    
    return {
        totalSize,
        details,
        isOverLimit: totalSize > 4000 // Общий лимит для всех cookies
    };
}

// Оставляем старые функции для совместимости
function hasCookie(name) {
    return getCookie(name) !== null;
}

function getAllCookies() {
    const cookies = {};
    try {
        document.cookie.split(';').forEach(cookie => {
            const [name, value] = cookie.trim().split('=');
            if (name && value) {
                cookies[decodeURIComponent(name)] = decodeURIComponent(value);
            }
        });
    } catch (error) {
        console.error('Ошибка при получении всех cookie:', error);
    }
    return cookies;
}

// Экспорт для Node.js (если нужно)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        setCookie,
        getCookie,
        deleteCookie,
        setCookieJSON,
        getCookieJSON,
        hasCookie,
        getAllCookies,
        canSaveToCookie,
        cleanOldCookieData,
        getCookiesInfo
    };
}