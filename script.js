// ===== HERO LOAD =====
window.addEventListener('load', () => {
    document.body.classList.add('is-loaded');
});

window.addEventListener('scroll', () => {
    closeAllToggles();
});

document.addEventListener('click', (e) => {
    const isInside = e.target.closest('[data-toggle-card]');
    const isTrigger = e.target.closest('[data-toggle-trigger]');

    if (!isInside && !isTrigger) {
        closeAllToggles();
    }
});

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        closeAllToggles();
    }
});


// ===== DETECT DESKTOP =====
const isDesktop = window.matchMedia('(min-width: 1024px)').matches;


// ===== MOBILE MENU =====
const menuToggle = document.getElementById('menu-toggle');
const mobileNav = document.getElementById('mobile-nav');

if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => {
        const isOpen = mobileNav.classList.toggle('is-open');
        menuToggle.setAttribute('aria-expanded', String(isOpen));
        mobileNav.setAttribute('aria-hidden', String(!isOpen));

        document.querySelector('.hero__topbar')
            .classList.toggle('is-light', isOpen);

        menuToggle.classList.toggle('is-active', isOpen);
    });

    mobileNav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            mobileNav.classList.remove('is-open');
            menuToggle.setAttribute('aria-expanded', 'false');
            mobileNav.setAttribute('aria-hidden', 'true');
        });
    });
}


// ===== MODALS =====
function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');

    const video = modal.querySelector('video');

    if (video) {
        video.currentTime = 0;
        video.muted = false;
        video.volume = 1;
        video.play().catch(() => {});
    }

    // === АВТОЦЕНТРОВКА КАРТЫ ===
    if (id === 'map-modal') {
        const iframe = document.getElementById('map-frame');

        if (iframe) {
            const isMobile = window.innerWidth <= 768;
            const zoom = isMobile ? '12' : '16';

            const src =
                `https://yandex.ru/map-widget/v1/?ll=30.3160,59.9391&z=${zoom}`;

            iframe.src = src;
        }
    }
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;

    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');

    const video = modal.querySelector('video');

    if (video) {
        video.pause();
        video.currentTime = 0;
    }

    // === ОЧИСТКА КАРТЫ ===
    if (id === 'map-modal') {
        const iframe = document.getElementById('map-frame');

        if (iframe) {
            iframe.src = '';
        }
    }

    if (!document.querySelector('.modal.is-open')) {
        document.body.classList.remove('modal-open');
    }
}


// ===== MODAL TRIGGERS =====
document.getElementById('intro-open')
    ?.addEventListener('click', () => openModal('intro-modal'));

document.getElementById('qualification-open')
    ?.addEventListener('click', () => {
        const more = document.getElementById('qualification-more');
        const expand = document.getElementById('qualification-expand');
        const panel = document.querySelector('#qualification-modal .modal__panel');

        if (more) more.setAttribute('hidden', '');
        if (panel) panel.classList.remove('is-expanded');

        if (expand) {
            expand.textContent = 'Смотреть ещё';
            expand.setAttribute('aria-expanded', 'false');
        }

        openModal('qualification-modal');
    });

document.querySelectorAll('[data-open-consult]')
    .forEach(btn => btn.addEventListener('click', () => openModal('consult-modal')));


// ===== CLOSE MODALS =====
document.querySelectorAll('[data-close]').forEach((btn) => {
    btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-close');
        if (id) closeModal(id);
    });
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.is-open')
            .forEach((m) => closeModal(m.id));
    }
});


// ===== TOGGLE CARDS (MOBILE CLICK / DESKTOP HOVER) =====

function closeAllToggles() {
    document.querySelectorAll('[data-toggle-card].is-open')
        .forEach(card => {
            card.classList.remove('is-open');
            card.querySelector('[data-toggle-trigger]')
                ?.setAttribute('aria-expanded', 'false');
        });
}

function setupToggleCards(selector) {
    const cards = document.querySelectorAll(selector);

    cards.forEach((card) => {
        const trigger = card.querySelector('[data-toggle-trigger]');
        if (!trigger) return;

        if (!isDesktop) {
            trigger.addEventListener('click', () => {
                const isOpen = card.classList.contains('is-open');

                cards.forEach((c) => {
                    c.classList.remove('is-open');
                    c.querySelector('[data-toggle-trigger]')
                        ?.setAttribute('aria-expanded', 'false');
                });
if (isOpen) {
    closeAllToggles();
} else {
    closeAllToggles();
    card.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
}
            });
        } else {
trigger.addEventListener('mouseenter', () => {
    card.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
});

card.addEventListener('mouseleave', () => {
    card.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
});
        }
    });
}

setupToggleCards('.help [data-toggle-card]');
setupToggleCards('.formats [data-toggle-card]');
setupToggleCards('.faq [data-toggle-card]');



 // ===== FORM: WEB3FORMS =====
const consultForm = document.querySelector('.consult-form');

if (consultForm) {
    const submitButton = consultForm.querySelector('[type="submit"]');
    const statusElement = consultForm.querySelector('.consult-form__status');

    let isSubmitting = false;
    let lastSubmitTime = 0;
    let lastSuccessfulPayload = '';
    let formOpenedAt = Date.now();

    function showFormStatus(message, state) {
        if (!statusElement) return;

        statusElement.textContent = message;
        statusElement.dataset.state = state;
    }

    function isGarbageText(text) {
        const clean = text.toLowerCase().replace(/\s/g, '');

        if (!clean) return false;

        if (/(.)\1{4,}/i.test(clean)) return true;

        const uniqueChars = new Set(clean).size;

        if (clean.length > 10 && uniqueChars < 4) return true;

        const hasVowels = /[aeiouаеёиоуыэюя]/i.test(clean);

        if (clean.length > 6 && !hasVowels) return true;

        return false;
    }

    document.querySelectorAll('[data-open-consult]').forEach((button) => {
        button.addEventListener('click', () => {
            formOpenedAt = Date.now();
            showFormStatus('', '');
        });
    });

    consultForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (isSubmitting) return;

        if (!consultForm.checkValidity()) {
            consultForm.reportValidity();
            return;
        }

        const now = Date.now();

        if (now - lastSubmitTime < 10000) {
            showFormStatus(
                'Подождите немного перед повторной отправкой.',
                'error'
            );
            return;
        }

        if (now - formOpenedAt < 3000) {
            showFormStatus(
                'Пожалуйста, проверьте данные перед отправкой.',
                'error'
            );
            return;
        }

        const honeypot = consultForm.querySelector('[name="botcheck"]');

        if (honeypot && honeypot.checked) return;

        const message = consultForm.querySelector('[name="message"]');

        if (message && isGarbageText(message.value)) {
            showFormStatus('Проверьте текст комментария.', 'error');
            return;
        }

        const formData = new FormData(consultForm);
        const payload = JSON.stringify([...formData.entries()]);

        if (payload === lastSuccessfulPayload) {
            showFormStatus(
                'Эта заявка уже была отправлена.',
                'error'
            );
            return;
        }

        isSubmitting = true;
        if (submitButton) submitButton.disabled = true;

        showFormStatus('Отправляем заявку…', 'pending');

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        try {
            const response = await fetch(
                'https://api.web3forms.com/submit',
                {
                    method: 'POST',
                    body: formData,
                    headers: {
                        Accept: 'application/json'
                    },
                    signal: controller.signal
                }
            );

            let result;

            try {
                result = await response.json();
            } catch {
                throw new Error('Некорректный ответ сервиса.');
            }

            if (!response.ok || result.success !== true) {
                throw new Error(
                    result.message || 'Сервис не подтвердил отправку.'
                );
            }

            lastSuccessfulPayload = payload;
            lastSubmitTime = Date.now();

            showFormStatus(
                'Заявка принята сервисом. Спасибо!',
                'success'
            );

            consultForm.reset();
            formOpenedAt = Date.now();

            // Даём человеку увидеть подтверждение перед закрытием.
            setTimeout(() => {
                closeModal('consult-modal');
                showFormStatus('', '');
            }, 1800);

        } catch (error) {
            if (error.name === 'AbortError') {
                showFormStatus(
                    'Сервис отвечает слишком долго. Проверьте соединение и попробуйте снова.',
                    'error'
                );
            } else {
                showFormStatus(
                    'Не удалось подтвердить отправку. Проверьте соединение и попробуйте позже.',
                    'error'
                );
            }

            console.error('Ошибка отправки формы:', error);

        } finally {
            clearTimeout(timeoutId);
            isSubmitting = false;

            if (submitButton) submitButton.disabled = false;
        }
    });
}



// ===== QUALIFICATION EXPAND =====
const expandBtn = document.getElementById('qualification-expand');
const moreBlock = document.getElementById('qualification-more');
const qualPanel = document.querySelector('#qualification-modal .modal__panel');

if (expandBtn && moreBlock && qualPanel) {
    expandBtn.addEventListener('click', () => {
        const open = moreBlock.hasAttribute('hidden');

        if (open) {
            moreBlock.removeAttribute('hidden');
            qualPanel.classList.add('is-expanded');
            expandBtn.textContent = 'Свернуть';
        } else {
            moreBlock.setAttribute('hidden', '');
            qualPanel.classList.remove('is-expanded');
            expandBtn.textContent = 'Смотреть ещё';
        }
    });
}


// ===== FOOTER MAP =====
const mapBtn = document.getElementById('open-map');
const mapArrow = document.getElementById('map-arrow');

if (mapBtn) {
    const mapItem = mapBtn.closest('.footer__item--map');

    [mapBtn, mapArrow].forEach(el => {
        if (!el) return;

        el.addEventListener('click', () => {
            mapItem.classList.toggle('is-open');
        });
    });
}


// ===== HERO LOAD =====

const statsScroll = document.querySelector('.stats-scroll');

if (statsScroll) {

    // ===== DRAG TO SCROLL =====

    let isDown = false;
    let startX;
    let scrollLeft;

    statsScroll.addEventListener('mousedown', (e) => {

        isDown = true;

        statsScroll.classList.add('is-dragging');

        startX = e.pageX - statsScroll.offsetLeft;
        scrollLeft = statsScroll.scrollLeft;

    });

    statsScroll.addEventListener('mouseleave', () => {

        isDown = false;

        statsScroll.classList.remove('is-dragging');

    });

    statsScroll.addEventListener('mouseup', () => {

        isDown = false;

        statsScroll.classList.remove('is-dragging');

    });

    statsScroll.addEventListener('mousemove', (e) => {

        if (!isDown) return;

        e.preventDefault();

        const x = e.pageX - statsScroll.offsetLeft;
        const walk = (x - startX) * 1.2;

        statsScroll.scrollLeft = scrollLeft - walk;

    });


    // ===== СТРЕЛОЧКИ =====

    statsScroll.addEventListener('scroll', () => {

        const isAtEnd =
            statsScroll.scrollLeft + statsScroll.clientWidth >=
            statsScroll.scrollWidth - 1;

        document.querySelectorAll('.stat-arrow img').forEach((arrow) => {

            arrow.style.transform =
                isAtEnd ? 'rotate(180deg)' : 'rotate(0deg)';

        });

    });


    // ===== АВТОСКРОЛЛ =====

    let ticking = false;
    let currentScroll = 0;

    window.addEventListener('scroll', () => {

        if (!ticking) {

            window.requestAnimationFrame(() => {

                const rect =
                    statsScroll.getBoundingClientRect();

                const inView =
                    rect.top < window.innerHeight &&
                    rect.bottom > 0;

                if (inView && !isDown) {

                    const start = window.innerHeight;
                    const end = -rect.height;

                    const progress =
                        (start - rect.top) / (start - end);

                    const clamped =
                        Math.max(0, Math.min(1, progress));

                    const maxScroll =
                        statsScroll.scrollWidth -
                        statsScroll.clientWidth;

                    const targetScroll =
                        maxScroll * clamped;

                    const ease = 0.08;

                    currentScroll +=
                        (targetScroll - currentScroll) * ease;

                    statsScroll.scrollLeft = currentScroll;

                }

                ticking = false;

            });

            ticking = true;

        }

    });

}

document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();

        const targetId = link.getAttribute('href');
        const target = document.querySelector(targetId);

        if (!target) return;

        const y =
            target.getBoundingClientRect().top +
            window.pageYOffset -
            (window.innerHeight / 2) +
            (target.offsetHeight / 2);

        window.scrollTo({
            top: y,
            behavior: 'smooth'
        });

        // закрытие мобильного меню
        if (mobileNav?.classList.contains('is-open')) {
            mobileNav.classList.remove('is-open');

            menuToggle?.setAttribute(
                'aria-expanded',
                'false'
            );

            mobileNav.setAttribute(
                'aria-hidden',
                'true'
            );
        }
    });
});

// ===== HERO CITY MAP TRIGGER =====

const footerMapTrigger = document.getElementById('footer-map-trigger');

if (footerMapTrigger) {

    footerMapTrigger.addEventListener('click', () => {

        const footer = document.getElementById('contacts');
        const mapItem = document.querySelector('.footer__item--map');

        if (!footer || !mapItem) return;

        footer.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });

        setTimeout(() => {
            mapItem.classList.add('is-open');
        }, 700);

    });

}

function isValidPhone(value) {
    const v = value.trim();

    return /^[\d\s()+-]{7,20}$/.test(v);
}

document.addEventListener('DOMContentLoaded', () => {

    // ===== CLOSE ALL MODALS SAFETY =====
    function closeAllModals() {
        document.querySelectorAll('.modal.is-open').forEach(m => {
            m.classList.remove('is-open');
            m.setAttribute('aria-hidden', 'true');
        });

        document.querySelector('.mobile-nav')?.classList.remove('is-open');
        document.querySelector('.lightbox')?.classList.remove('is-open');
    }

    // ===== OPTIONAL: enforce one modal at a time =====
    window.closeAllModals = closeAllModals;

});

document.addEventListener('DOMContentLoaded', () => {
    const cookieBanner = document.getElementById('cookie-consent');
    const accept = document.getElementById('cookie-accept');
    const decline = document.getElementById('cookie-decline');

    if (!cookieBanner || !accept || !decline) return;

    const STORAGE_KEY = 'cookieConsent';
    const EXPIRY_DAYS = 30; // через сколько дней снова показывать

    function getConsent() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;

        try {
            return JSON.parse(raw);
        } catch {
            return null;
        }
    }

    function saveConsent(status) {
        const data = {
            status,
            date: Date.now()
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        cookieBanner.style.display = 'none';
    }

    function isExpired(date) {
        const now = Date.now();
        const diffDays = (now - date) / (1000 * 60 * 60 * 24);
        return diffDays > EXPIRY_DAYS;
    }

    const consent = getConsent();

    // если уже есть решение
    if (consent) {
        const expired = isExpired(consent.date);

        // если не истёк срок — скрываем баннер
        if (!expired) {
            cookieBanner.style.display = 'none';

            // сюда потом можно:
            // if (consent.status === 'accepted') loadAnalytics();

            return;
        }

        // если истёк — чистим и показываем снова
        localStorage.removeItem(STORAGE_KEY);
    }

    accept.addEventListener('click', () => saveConsent('accepted'));
    decline.addEventListener('click', () => saveConsent('declined'));
});

function fixTypography(node) {

    if (node.nodeType === Node.TEXT_NODE) {

        node.textContent = node.textContent.replace(
            /(\s|^)([А-Яа-яA-Za-z]{1,2})\s+/g,
            '$1$2\u00A0'
        );

        return;
    }

    if (
        node.nodeType === Node.ELEMENT_NODE &&
        !['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(node.tagName)
    ) {

        node.childNodes.forEach(fixTypography);

    }
}

document.addEventListener('DOMContentLoaded', () => {
    fixTypography(document.body);
});
