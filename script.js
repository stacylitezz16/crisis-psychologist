// ===== HERO LOAD =====
window.addEventListener('load', () => {
    setTimeout(() => {
        document.body.classList.add('is-loaded');
    }, 100);
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
    document.body.style.overflow = 'hidden';

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
        document.body.style.overflow = '';
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


// ===== FORM =====
const consultForm = document.querySelector('.consult-form');

if (consultForm) {

    let lastSubmitTime = 0;
    let lastPayload = '';
    let formOpenedAt = Date.now();

    function isGarbageText(text) {

        const clean = text
            .toLowerCase()
            .replace(/\s/g, '');

        const repeatedPattern = /(.)\1{4,}/i;

        if (repeatedPattern.test(clean)) {
            return true;
        }

        const uniqueChars = new Set(clean).size;

        if (clean.length > 10 && uniqueChars < 4) {
            return true;
        }

        const hasVowels = /[aeiouаеёиоуыэюя]/i.test(clean);

        if (clean.length > 6 && !hasVowels) {
            return true;
        }

        return false;
    }

    consultForm.addEventListener('submit', (e) => {

        // ===== HTML VALIDATION =====

        if (!consultForm.checkValidity()) {

            e.preventDefault();
            consultForm.reportValidity();

            return;
        }

        // ===== ANTISPAM TIME =====

        const now = Date.now();

        if (now - lastSubmitTime < 10000) {

            e.preventDefault();

            alert('Подождите немного перед повторной отправкой.');

            return;
        }

        // ===== TOO FAST =====

        const timeSpent = Date.now() - formOpenedAt;

        if (timeSpent < 3000) {

            e.preventDefault();

            return;
        }

        // ===== HONEYPOT =====

        const honeypot =
            consultForm.querySelector('[name="website"]');

        if (honeypot && honeypot.value.trim() !== '') {

            e.preventDefault();

            return;
        }

        // ===== GARBAGE TEXT =====

        const message =
            consultForm.querySelector('textarea[name="comment"]');

        if (message && isGarbageText(message.value)) {

            e.preventDefault();

            alert('Введите корректные данные.');

            return;
        }

        // ===== DUPLICATE PAYLOAD =====

        const data = new FormData(consultForm);

        const payload =
            JSON.stringify(Object.fromEntries(data));

        if (payload === lastPayload) {

            e.preventDefault();

            return;
        }

        lastPayload = payload;
        lastSubmitTime = now;

        // ===== SUCCESS =====

        setTimeout(() => {

            closeModal('consult-modal');

            consultForm.reset();

            formOpenedAt = Date.now();

        }, 300);

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

const cookieBanner = document.getElementById('cookie-consent');
const accept = document.getElementById('cookie-accept');
const decline = document.getElementById('cookie-decline');

if (localStorage.getItem('cookieConsent')) {
  cookieBanner.style.display = 'none';
}

function hideCookie() {
  cookieBanner.style.display = 'none';
  localStorage.setItem('cookieConsent', 'true');
}

accept.addEventListener('click', hideCookie);
decline.addEventListener('click', hideCookie);

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