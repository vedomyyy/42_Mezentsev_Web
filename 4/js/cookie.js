
function setCookie(name, value, days = 365, path = '/') {
    try {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = `expires=${date.toUTCString()}`;
        document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)};${expires};path=${path};SameSite=Strict`;
        console.log(`Cookie "${name}" успешно установлена`);
    } catch (error) {
        console.error(`Ошибка при установке cookie "${name}":`, error);
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
    } catch (error) {
        console.error(`Ошибка при удалении cookie "${name}":`, error);
    }
}


function setCookieJSON(name, data, days = 365) {
    try {
        const jsonString = JSON.stringify(data);
        setCookie(name, jsonString, days);
    } catch (error) {
        console.error(`Ошибка при сериализации данных для cookie "${name}":`, error);
    }
}

function getCookieJSON(name) {
    try {
        const value = getCookie(name);
        if (value) {
            return JSON.parse(value);
        }
        return null;
    } catch (error) {
        console.error(`Ошибка при парсинге JSON из cookie "${name}":`, error);
        return null;
    }
}

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

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        setCookie,
        getCookie,
        deleteCookie,
        setCookieJSON,
        getCookieJSON,
        hasCookie,
        getAllCookies
    };
}

