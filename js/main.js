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
     SEARCH BAR DATE PICKER POPUP
  ============================================================ */
  initSearchDatePicker();

  function initSearchDatePicker() {
    const checkinInput  = document.getElementById('searchCheckin');
    const checkoutInput = document.getElementById('searchCheckout');
    if (!checkinInput && !checkoutInput) return;

    // 팝업 DOM 생성
    const overlay = document.createElement('div');
    overlay.id = 'datePickerOverlay';
    overlay.style.cssText = `
      display:none; position:fixed; inset:0; z-index:200;
      background:rgba(23,19,15,.45); backdrop-filter:blur(2px);
      align-items:center; justify-content:center;
    `;

    const popup = document.createElement('div');
    popup.style.cssText = `
      background:#fffaf1; border-radius:24px; box-shadow:0 24px 80px rgba(23,19,15,.25);
      padding:32px; max-width:760px; width:95vw; max-height:90vh; overflow-y:auto;
      position:relative;
    `;

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = `
      position:absolute; top:16px; right:18px; background:none; border:none;
      font-size:20px; cursor:pointer; color:#756a5f; line-height:1;
    `;
    closeBtn.addEventListener('click', closePopup);

    const title = document.createElement('div');
    title.style.cssText = 'font-size:18px; font-weight:900; letter-spacing:-.04em; margin-bottom:6px;';
    title.textContent = '날짜를 선택하세요';

    const subtitle = document.createElement('div');
    subtitle.style.cssText = 'font-size:13px; color:#756a5f; margin-bottom:24px;';
    subtitle.textContent = '체크인 → 체크아웃 순으로 클릭하세요';

    // 두 달 나란히 표시
    const calWrap = document.createElement('div');
    calWrap.style.cssText = 'display:grid; grid-template-columns:1fr 1fr; gap:24px;';

    const cal1El = document.createElement('div');
    const cal2El = document.createElement('div');
    calWrap.appendChild(cal1El);
    calWrap.appendChild(cal2El);

    // 선택 결과 표시
    const selectedBar = document.createElement('div');
    selectedBar.style.cssText = `
      margin-top:20px; padding:16px 20px;
      background:rgba(36,27,21,.04); border-radius:14px;
      display:flex; gap:20px; align-items:center; flex-wrap:wrap;
    `;
    selectedBar.innerHTML = `
      <div style="flex:1">
        <div style="font-size:10px;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:#756a5f;margin-bottom:3px">체크인</div>
        <div id="popupCheckIn" style="font-size:16px;font-weight:800">날짜 선택</div>
      </div>
      <div style="color:#9b9085;font-size:20px">→</div>
      <div style="flex:1">
        <div style="font-size:10px;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:#756a5f;margin-bottom:3px">체크아웃</div>
        <div id="popupCheckOut" style="font-size:16px;font-weight:800">날짜 선택</div>
      </div>
      <div style="flex:1">
        <div style="font-size:10px;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:#756a5f;margin-bottom:3px">숙박</div>
        <div id="popupNights" style="font-size:16px;font-weight:800">—</div>
      </div>
    `;

    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = '날짜 선택 완료';
    confirmBtn.style.cssText = `
      margin-top:16px; width:100%; height:52px; background:#241b15; color:#fff;
      border:none; border-radius:999px; font-size:15px; font-weight:900;
      cursor:pointer; transition:background .2s;
    `;
    confirmBtn.addEventListener('click', () => {
      if (checkIn && checkOut) closePopup();
    });
    confirmBtn.addEventListener('mouseover', () => confirmBtn.style.background = '#000');
    confirmBtn.addEventListener('mouseout',  () => confirmBtn.style.background = '#241b15');

    popup.appendChild(closeBtn);
    popup.appendChild(title);
    popup.appendChild(subtitle);
    popup.appendChild(calWrap);
    popup.appendChild(selectedBar);
    popup.appendChild(confirmBtn);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // 오버레이 바깥 클릭으로 닫기
    overlay.addEventListener('click', e => { if (e.target === overlay) closePopup(); });

    // 상태
    let checkIn  = null;
    let checkOut = null;
    let selecting = 'checkin';
    let currentMonth1 = new Date();
    let currentMonth2 = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);

    function openPopup(mode) {
      selecting = mode || 'checkin';
      title.textContent = mode === 'checkout' ? '체크아웃 날짜를 선택하세요' : '체크인 날짜를 선택하세요';
      overlay.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      renderBoth();
    }

    function closePopup() {
      overlay.style.display = 'none';
      document.body.style.overflow = '';
    }

    function fmt(d) {
      if (!d) return '날짜 선택';
      return `${d.getMonth()+1}월 ${d.getDate()}일 (${['일','월','화','수','목','금','토'][d.getDay()]})`;
    }
    function fmtInput(d) {
      if (!d) return '';
      return `${d.getMonth()+1}/${d.getDate()}`;
    }

    function updateDisplay() {
      document.getElementById('popupCheckIn').textContent  = fmt(checkIn);
      document.getElementById('popupCheckOut').textContent = fmt(checkOut);
      if (checkIn && checkOut) {
        const n = Math.round((checkOut - checkIn) / 86400000);
        document.getElementById('popupNights').textContent = `${n}박 ${n+1}일`;
      } else {
        document.getElementById('popupNights').textContent = '—';
      }
      if (checkinInput)  checkinInput.value  = checkIn  ? fmtInput(checkIn)  : '';
      if (checkoutInput) checkoutInput.value = checkOut ? fmtInput(checkOut) : '';
      if (checkinInput && !checkinInput.value)   checkinInput.placeholder  = '날짜 선택';
      if (checkoutInput && !checkoutInput.value) checkoutInput.placeholder = '날짜 선택';
    }

    function onDayClick(d) {
      if (selecting === 'checkin' || (checkIn && checkOut)) {
        checkIn = d; checkOut = null; selecting = 'checkout';
        title.textContent = '체크아웃 날짜를 선택하세요';
      } else {
        if (d <= checkIn) { checkIn = d; checkOut = null; }
        else { checkOut = d; selecting = 'checkin'; title.textContent = '날짜를 선택하세요'; }
      }
      updateDisplay();
      renderBoth();
    }

    function renderMiniCal(container, baseDate) {
      const year = baseDate.getFullYear();
      const month = baseDate.getMonth();
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const todayMs = new Date().setHours(0,0,0,0);
      const monthNames = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
      const dayNames = ['일','월','화','수','목','금','토'];

      const weekdayPrices = { 0:59000, 1:59000, 2:59000, 3:59000, 4:59000, 5:79000, 6:79000 };

      container.innerHTML = `
        <div style="font-size:15px;font-weight:900;letter-spacing:-.03em;margin-bottom:12px;text-align:center">
          ${year}년 ${monthNames[month]}
        </div>
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px">
          ${dayNames.map(d => `<div style="text-align:center;font-size:10px;font-weight:900;color:#9b9085;padding:6px 0">${d}</div>`).join('')}
          ${Array.from({length:firstDay}, () => '<div></div>').join('')}
          ${Array.from({length:daysInMonth}, (_,i) => {
            const day = i + 1;
            const d = new Date(year, month, day);
            const dMs = d.getTime();
            const isPast = dMs < todayMs;
            const isCI = checkIn && d.toDateString() === checkIn.toDateString();
            const isCO = checkOut && d.toDateString() === checkOut.toDateString();
            const inRange = checkIn && checkOut && d > checkIn && d < checkOut;
            const price = weekdayPrices[d.getDay()];
            const isToday = dMs === todayMs;

            let bg = 'transparent', color = '#241b15', border = 'none', radius = '8px', cursor = 'pointer';
            if (isPast) { color = '#c8bfb6'; cursor = 'not-allowed'; }
            else if (isCI || isCO) { bg = '#241b15'; color = '#fff'; radius = isCI ? '50% 0 0 50%' : '0 50% 50% 0'; }
            else if (inRange) { bg = 'rgba(36,27,21,.08)'; radius = '0'; }
            if (isToday && !isCI && !isCO) border = '2px solid #b89055';

            return `<div
              data-date="${year}-${month+1}-${day}"
              style="aspect-ratio:1;display:flex;flex-direction:column;align-items:center;justify-content:center;
                background:${bg};color:${color};border:${border};border-radius:${radius};cursor:${cursor};gap:1px;
                font-size:13px;font-weight:700;transition:background .15s"
              ${isPast ? '' : 'class="cal-pick"'}
            >
              <span>${day}</span>
              ${!isPast ? `<span style="font-size:8px;color:${isCI||isCO?'rgba(255,255,255,.7)':'#b89055'};font-weight:700">${(price/1000).toFixed(0)}k</span>` : ''}
            </div>`;
          }).join('')}
        </div>
      `;

      container.querySelectorAll('.cal-pick').forEach(el => {
        el.addEventListener('mouseenter', () => { if (el.style.cursor !== 'not-allowed') el.style.opacity = '.75'; });
        el.addEventListener('mouseleave', () => { el.style.opacity = '1'; });
        el.addEventListener('click', () => {
          const [y,m,d] = el.dataset.date.split('-').map(Number);
          onDayClick(new Date(y, m-1, d));
        });
      });
    }

    function renderBoth() {
      renderMiniCal(cal1El, currentMonth1);
      renderMiniCal(cal2El, currentMonth2);

      // 월 이동 버튼 추가 (cal1 상단)
      const nav1 = document.createElement('div');
      nav1.style.cssText = 'display:flex;justify-content:space-between;margin-bottom:8px';
      nav1.innerHTML = `
        <button id="pp-prev" style="background:none;border:1px solid #e0d8cc;border-radius:8px;width:30px;height:30px;cursor:pointer;font-size:14px">‹</button>
        <button id="pp-next" style="background:none;border:1px solid #e0d8cc;border-radius:8px;width:30px;height:30px;cursor:pointer;font-size:14px">›</button>
      `;
      cal1El.insertBefore(nav1, cal1El.firstChild);

      document.getElementById('pp-prev').addEventListener('click', () => {
        currentMonth1 = new Date(currentMonth1.getFullYear(), currentMonth1.getMonth()-1, 1);
        currentMonth2 = new Date(currentMonth1.getFullYear(), currentMonth1.getMonth()+1, 1);
        renderBoth();
      });
      document.getElementById('pp-next').addEventListener('click', () => {
        currentMonth1 = new Date(currentMonth1.getFullYear(), currentMonth1.getMonth()+1, 1);
        currentMonth2 = new Date(currentMonth1.getFullYear(), currentMonth1.getMonth()+1, 1);
        renderBoth();
      });
    }

    // 검색바 입력 클릭 이벤트
    if (checkinInput) {
      checkinInput.addEventListener('click', () => openPopup('checkin'));
      checkinInput.readOnly = true;
      checkinInput.style.cursor = 'pointer';
    }
    if (checkoutInput) {
      checkoutInput.addEventListener('click', () => openPopup('checkout'));
      checkoutInput.readOnly = true;
      checkoutInput.style.cursor = 'pointer';
    }
  }

  /* ============================================================
     CALENDAR (reservation 페이지용)
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
