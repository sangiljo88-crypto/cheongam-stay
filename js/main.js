/* ============================================================
   청암스테이 — Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     NAV — scroll effect + mobile toggle
  ============================================================ */
  const nav = document.querySelector('.nav');
  const navToggle = document.querySelector('.nav-toggle');
  const navDrawer = document.querySelector('.nav-drawer');

  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  if (navToggle && navDrawer) {
    navToggle.addEventListener('click', () => {
      const open = navDrawer.classList.toggle('open');
      navToggle.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    navDrawer.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navDrawer.classList.remove('open');
        navToggle.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && navDrawer.classList.contains('open')) {
        navDrawer.classList.remove('open');
        navToggle.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  /* ============================================================
     FADE UP — IntersectionObserver
  ============================================================ */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.fade-up').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('.fade-up').forEach(el => el.classList.add('visible'));
  }

  /* ============================================================
     FAQ ACCORDION
  ============================================================ */
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      // close all
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  /* ============================================================
     CALENDAR
  ============================================================ */
  const calendarEl = document.getElementById('mainCalendar');
  if (calendarEl) {
    initCalendar(calendarEl);
  }

  function initCalendar(el) {
    let currentDate = new Date();
    let checkIn = null;
    let checkOut = null;
    let selecting = 'checkin'; // 'checkin' | 'checkout'

    const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

    // Price map (fake data for demo)
    const prices = {};
    const today = new Date();
    for (let i = 0; i < 90; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const key = dateKey(d);
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      prices[key] = isWeekend ? '99,000' : '59,000';
    }

    function dateKey(d) {
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    }

    function isSameDay(a, b) {
      return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    }

    function isBetween(d, start, end) {
      return start && end && d > start && d < end;
    }

    function render() {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      el.innerHTML = `
        <div class="calendar-nav">
          <button class="cal-nav-btn" id="calPrev">‹</button>
          <h3>${year}년 ${monthNames[month]}</h3>
          <button class="cal-nav-btn" id="calNext">›</button>
        </div>
        <div class="calendar-grid">
          ${dayNames.map(d => `<div class="cal-day-name">${d}</div>`).join('')}
          ${Array.from({length: firstDay}, () => '<div></div>').join('')}
          ${Array.from({length: daysInMonth}, (_, i) => {
            const day = i + 1;
            const d = new Date(year, month, day);
            const key = dateKey(d);
            const isPast = d < new Date(new Date().setHours(0,0,0,0));
            const isToday = isSameDay(d, new Date());
            const isCheckIn = isSameDay(d, checkIn);
            const isCheckOut = isSameDay(d, checkOut);
            const inRange = isBetween(d, checkIn, checkOut);
            const price = prices[key];

            let cls = 'cal-day';
            if (isPast) cls += ' past';
            if (isToday) cls += ' today';
            if (isCheckIn) cls += ' selected check-in';
            else if (isCheckOut) cls += ' selected check-out';
            else if (inRange) cls += ' in-range';

            return `<div class="${cls}" data-date="${key}">
              <span>${day}</span>
              ${price && !isPast ? `<span class="cal-price">${price}</span>` : ''}
            </div>`;
          }).join('')}
        </div>
      `;

      // Nav buttons
      el.querySelector('#calPrev').addEventListener('click', () => {
        currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        render();
      });
      el.querySelector('#calNext').addEventListener('click', () => {
        currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        render();
      });

      // Day click
      el.querySelectorAll('.cal-day:not(.past):not(.disabled)').forEach(dayEl => {
        dayEl.addEventListener('click', () => {
          const [y, m, d] = dayEl.dataset.date.split('-').map(Number);
          const clicked = new Date(y, m - 1, d);

          if (selecting === 'checkin' || (checkIn && checkOut)) {
            checkIn = clicked;
            checkOut = null;
            selecting = 'checkout';
          } else if (selecting === 'checkout') {
            if (clicked <= checkIn) {
              checkIn = clicked;
              checkOut = null;
            } else {
              checkOut = clicked;
              selecting = 'checkin';
            }
          }

          updateBookingSummary();
          render();
        });
      });
    }

    function updateBookingSummary() {
      // Update check-in/out display fields if present
      const ciEl = document.getElementById('bookCheckIn');
      const coEl = document.getElementById('bookCheckOut');
      const nightsEl = document.getElementById('bookNights');
      const totalEl = document.getElementById('bookTotal');

      if (checkIn && ciEl) {
        ciEl.textContent = `${checkIn.getMonth()+1}월 ${checkIn.getDate()}일`;
      }
      if (checkOut && coEl) {
        coEl.textContent = `${checkOut.getMonth()+1}월 ${checkOut.getDate()}일`;
      }
      if (checkIn && checkOut && nightsEl) {
        const nights = Math.round((checkOut - checkIn) / (1000*60*60*24));
        nightsEl.textContent = `${nights}박`;

        // Simple price calc
        if (totalEl) {
          const basePrice = 99000;
          const discounted = Math.round(basePrice * 0.5 * nights);
          totalEl.textContent = discounted.toLocaleString() + '원';
        }
      }
    }

    render();
  }

  /* ============================================================
     GUEST COUNTER
  ============================================================ */
  document.querySelectorAll('.guest-counter').forEach(counter => {
    const display = counter.querySelector('.guest-count');
    const minus = counter.querySelector('.guest-minus');
    const plus = counter.querySelector('.guest-plus');
    if (!display || !minus || !plus) return;

    let count = parseInt(display.textContent) || 1;
    const min = parseInt(counter.dataset.min) || 1;
    const max = parseInt(counter.dataset.max) || 20;

    function update() {
      display.textContent = count;
      minus.disabled = count <= min;
      plus.disabled = count >= max;
      // Update summary if exists
      const summaryEl = document.getElementById('bookGuests');
      if (summaryEl) summaryEl.textContent = `성인 ${count}명`;
    }

    minus.addEventListener('click', () => { if (count > min) { count--; update(); } });
    plus.addEventListener('click', () => { if (count < max) { count++; update(); } });
    update();
  });

  /* ============================================================
     ROOM FILTER CHIPS
  ============================================================ */
  document.querySelectorAll('.chip[data-filter]').forEach(chip => {
    chip.addEventListener('click', () => {
      const group = chip.closest('.chips');
      if (group) {
        group.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      }
      chip.classList.add('active');

      const filter = chip.dataset.filter;
      document.querySelectorAll('.room-card[data-type]').forEach(card => {
        if (filter === 'all' || card.dataset.type === filter) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  /* ============================================================
     KAKAO INQUIRY — smooth CTA
  ============================================================ */
  document.querySelectorAll('[data-kakao]').forEach(btn => {
    btn.addEventListener('click', e => {
      const url = btn.dataset.kakao;
      if (url && url !== '#') {
        window.open(url, '_blank', 'noopener');
      }
    });
  });

  /* ============================================================
     BOOKING FORM — date fields click → scroll to calendar
  ============================================================ */
  document.querySelectorAll('.booking-date-field').forEach(field => {
    field.addEventListener('click', () => {
      const calendar = document.getElementById('mainCalendar') || document.querySelector('.calendar-section');
      if (calendar) {
        calendar.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ============================================================
     SMOOTH SCROLL for internal links
  ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 70;
        const top = target.getBoundingClientRect().top + window.scrollY - offset - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ============================================================
     GALLERY LIGHTBOX (simple)
  ============================================================ */
  const galleryMore = document.querySelector('.gallery-more');
  if (galleryMore) {
    galleryMore.addEventListener('click', () => {
      // Could expand to full gallery — for now scroll to gallery section
      const gallery = document.querySelector('.detail-gallery');
      if (gallery) gallery.scrollIntoView({ behavior: 'smooth' });
    });
  }

})();
