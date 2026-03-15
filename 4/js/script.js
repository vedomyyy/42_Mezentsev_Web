document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен');
    
    initTheme();
    initReviews();
    initToiletScroll();
    initOrderButton();
});

// ===== ФУНКЦИИ ДЛЯ ТЕМЫ =====
function initTheme() {
    if (!document.getElementById('themeToggle')) {
        const themeBtn = document.createElement('button');
        themeBtn.className = 'theme-toggle';
        themeBtn.id = 'themeToggle';
        themeBtn.setAttribute('aria-label', 'Переключить тему');
        themeBtn.textContent = '🌙';
        document.body.appendChild(themeBtn);
    }
    
    const themeToggle = document.getElementById('themeToggle');
    
    const savedTheme = getCookie('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggle.textContent = '☀️';
    }
    
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-theme');
        
        if (document.body.classList.contains('dark-theme')) {
            themeToggle.textContent = '☀️';
            setCookie('theme', 'dark', 365);
        } else {
            themeToggle.textContent = '🌙';
            setCookie('theme', 'light', 365);
        }
    });
}

// ===== ФУНКЦИИ ДЛЯ ОТЗЫВОВ =====
function initReviews() {
    const reviewsContainer = document.getElementById('reviewsContainer');
    const reviewForm = document.getElementById('reviewForm');

    const defaultReviews = [
        {
            id: '1',
            name: 'Елена',
            text: 'Сынок боялся ходить один в туалет, он больше не ходит вообще!!!',
            image: null,
            date: new Date().toISOString()
        },
        {
            id: '2',
            name: 'Дмитрий',
            text: 'Доктор сказал, что жидкий стул это плохо, а вот моему новому другу нравится',
            image: null,
            date: new Date().toISOString()
        },
        {
            id: '3',
            name: 'Варвара',
            text: 'Знаете, после родов я обсиралась по-страшному, и муж, слыша это, осуждал меня. Но с этим унитазом я перестала стесняться. Муж ушел.',
            image: null,
            date: new Date().toISOString()
        },
        {
            id: '4',
            name: 'Кирилл',
            text: 'Выдавил прямую кишку, а унитазу понравилось, спасибо!!!!',
            image: null,
            date: new Date().toISOString()
        }
    ];

    // Загружаем из cookies (теперь используется улучшенная функция из cookie.js)
    let reviews = getCookieJSON('reviews') || defaultReviews;
    
    // Очищаем старые отзывы (старше 30 дней)
    cleanOldCookieData('reviews', 30);
    
    displayReviews(reviews);

    const imageInput = document.getElementById('reviewImage');
    const imagePreview = document.getElementById('imagePreview');
    
    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
                if (!allowedTypes.includes(file.type)) {
                    alert('Пожалуйста, выберите изображение в формате JPG, PNG, GIF или WEBP');
                    imageInput.value = '';
                    imagePreview.innerHTML = '';
                    return;
                }
                
                const maxSize = 500 * 1024;
                if (file.size > maxSize) {
                    alert('Файл слишком большой. Максимальный размер - 500KB');
                    imageInput.value = '';
                    imagePreview.innerHTML = '';
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 100px; max-height: 100px;">`;
                };
                reader.readAsDataURL(file);
            } else {
                imagePreview.innerHTML = '';
            }
        });
    }

    if (reviewForm) {
        reviewForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const nameInput = document.getElementById('reviewName');
            const textInput = document.getElementById('reviewText');
            const imageFile = document.getElementById('reviewImage').files[0];

            if (!validateForm(nameInput, textInput)) return;

            const newReview = {
                id: Date.now().toString(),
                name: nameInput.value.trim(),
                text: textInput.value.trim(),
                image: null,
                date: new Date().toISOString()
            };

            if (imageFile) {
                compressImageForCookie(imageFile, function(compressedBase64) {
                    newReview.image = compressedBase64;
                    saveReview(newReview);
                });
            } else {
                saveReview(newReview);
            }
        });
    }
    
    function validateForm(nameInput, textInput) {
        let isValid = true;
        
        if (!nameInput.value.trim()) {
            showError(nameInput, 'Имя обязательно для заполнения');
            isValid = false;
        } else if (nameInput.value.trim().length < 2) {
            showError(nameInput, 'Имя должно содержать минимум 2 символа');
            isValid = false;
        } else {
            clearError(nameInput);
        }
        
        if (!textInput.value.trim()) {
            showError(textInput, 'Текст отзыва обязателен для заполнения');
            isValid = false;
        } else if (textInput.value.trim().length < 5) {
            showError(textInput, 'Текст отзыва должен содержать минимум 5 символов');
            isValid = false;
        } else {
            clearError(textInput);
        }
        
        return isValid;
    }
    
    function compressImageForCookie(file, callback) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        
        reader.onload = function(readerEvent) {
            const img = new Image();
            img.src = readerEvent.target.result;
            
            img.onload = function() {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const maxSize = 150;
                
                if (width > maxSize) {
                    height = Math.round(height * (maxSize / width));
                    width = maxSize;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
                callback(compressedBase64);
            };
        };
    }
    
    function saveReview(newReview) {
        reviews.unshift(newReview);
        
        if (reviews.length > 10) {
            reviews = reviews.slice(0, 10);
        }
        
        // Используем улучшенную функцию из cookie.js
        const saved = setCookieJSON('reviews', reviews, 30);
        
        if (!saved) {
            alert('Не удалось сохранить отзыв: слишком большой размер. Попробуйте без фото или с фото меньшего размера.');
            reviews.shift(); // Удаляем только что добавленный отзыв
            return;
        }
        
        displayReviews(reviews);
        
        document.getElementById('reviewForm').reset();
        document.getElementById('imagePreview').innerHTML = '';
        
        alert('Спасибо за отзыв!');
    }
    
    function displayReviews(reviewsArray) {
        if (!reviewsContainer) return;
        
        reviewsContainer.innerHTML = '';
        
        if (reviewsArray.length === 0) {
            reviewsContainer.innerHTML = '<p class="no-reviews">Пока нет отзывов. Будьте первым!</p>';
            return;
        }
        
        reviewsArray.forEach(review => {
            reviewsContainer.appendChild(createReviewElement(review));
        });
    }
    
    function createReviewElement(review) {
        const article = document.createElement('article');
        article.className = `review-item ${review.image ? 'with-image' : ''}`;
        
        let html = '';
        
        if (review.image) {
            html += `<img src="${review.image}" alt="Фото отзыва" class="review-image" loading="lazy">`;
            html += '<div class="review-content">';
        }
        
        html += `
            <blockquote>
                <p>«${escapeHtml(review.text)}»</p>
            </blockquote>
            <footer class="review-author">
                — ${escapeHtml(review.name)}
                <small>${new Date(review.date).toLocaleDateString()}</small>
            </footer>
        `;
        
        if (review.image) {
            html += '</div>';
        }
        
        article.innerHTML = html;
        return article;
    }
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    function showError(input, message) {
        const formGroup = input.closest('.form-group');
        formGroup.classList.add('error');
        let errorDiv = formGroup.querySelector('.error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            formGroup.appendChild(errorDiv);
        }
        errorDiv.textContent = message;
    }
    
    function clearError(input) {
        const formGroup = input.closest('.form-group');
        formGroup.classList.remove('error');
        const errorDiv = formGroup.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.remove();
        }
    }
}

// ===== ФУНКЦИИ ДЛЯ СКРОЛЛА УНИТАЗА =====
function initToiletScroll() {
    const toiletSection = document.querySelector('.toilet-section');
    const poopImg = document.getElementById('poopImg');
    const splashImg = document.getElementById('splashImg');
    const speechBubble = document.getElementById('speechBubble');
    const reasonsBlock = document.querySelector('.reasons');

    if (!toiletSection || !poopImg || !splashImg || !speechBubble) {
        console.error('Ошибка: не все элементы найдены!');
        return;
    }
    
    const START_TOP = 0;
    const END_TOP = 240;

    let splashShown = false;
    let bubbleShown = false;
    let lastProgress = 0;
    let reasonsTriggered = false;

    function resetToInitial() {
        poopImg.style.top = START_TOP + 'px';
        poopImg.style.opacity = '1';
        poopImg.style.filter = 'blur(3px) drop-shadow(0 4px 2px #b09b89)';
        
        splashImg.classList.remove('show');
        splashImg.style.display = 'none';
        splashImg.style.opacity = '0';
        splashImg.style.transform = 'translateX(-50%) scale(0)';
        
        speechBubble.classList.remove('show');
        
        splashShown = false;
        bubbleShown = false;
    }
    
    function updatePoopPosition() {
        if (reasonsBlock) {
            const reasonsRect = reasonsBlock.getBoundingClientRect();
            
            if (reasonsRect.top <= 0 && !reasonsTriggered) {
                resetToInitial();
                reasonsTriggered = true;
            }
            
            if (reasonsRect.top > 0) {
                reasonsTriggered = false;
            }
        }

        const sectionRect = toiletSection.getBoundingClientRect();
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const sectionTop = sectionRect.top + scrollY;
        
        const pixelsScrolled = scrollY + windowHeight - sectionTop;
        const sectionHeight = sectionRect.height;
        
        let progress = pixelsScrolled / sectionHeight;
        progress = Math.max(0, Math.min(1, progress));
        
        const scrollingDown = progress > lastProgress;
        const currentTop = START_TOP + (END_TOP - START_TOP) * progress;

        poopImg.style.top = currentTop + 'px';

        const blurAmount = 3 - (progress * 2.5);
        poopImg.style.filter = `blur(${Math.max(0, blurAmount)}px) drop-shadow(0 4px 2px #b09b89)`;

        if (progress > 0.85) {
            poopImg.style.opacity = 1 - ((progress - 0.85) * 6.67);
        } else {
            poopImg.style.opacity = '1';
        }

        const isPoopInvisible = progress >= 0.98 || parseFloat(poopImg.style.opacity) <= 0.05;
        
        if (scrollingDown && isPoopInvisible && !splashShown) {
            splashImg.style.display = 'block';
            splashImg.style.opacity = '0.9';
            splashImg.style.transform = 'translateX(-50%) scale(1.3)';
            splashImg.classList.add('show');
            
            splashShown = true;
            
            setTimeout(() => {
                if (!bubbleShown && splashShown) {
                    speechBubble.classList.add('show');
                    bubbleShown = true;
                }
            }, 300);
        }

        if (!scrollingDown && progress < 0.3) {
            resetToInitial();
        }
        
        lastProgress = progress;
    }
    
    poopImg.style.transition = 'none';
    window.addEventListener('scroll', updatePoopPosition);
    window.addEventListener('resize', updatePoopPosition);
    
    updatePoopPosition();
}

// ===== ФУНКЦИЯ ДЛЯ КНОПКИ ЗАКАЗА =====
function initOrderButton() {
    const orderButton = document.getElementById('orderButton');
    if (orderButton) {
        orderButton.addEventListener('click', function() {
            alert('СПАСИБО ЗА ЗАКАЗ!\nВаш унитаз приедет к вам в течение 30 лет 💩.');
        });
    }
}

