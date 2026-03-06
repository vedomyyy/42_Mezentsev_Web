window.addEventListener('load', function() {
    console.log('Страница загружена');

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
});