document.addEventListener('DOMContentLoaded', function () {
  // Плавное появление элементов при скролле
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // Фильтр портфолио (работает только на странице portfolio.html)
  var buttons = document.querySelectorAll('.filters button');
  var imgs = document.querySelectorAll('#grid img');
  if (buttons.length && imgs.length) {
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var filter = btn.dataset.filter;
        imgs.forEach(function (img) {
          img.classList.toggle('hidden', filter !== 'all' && img.dataset.category !== filter);
        });
      });
    });
  }

  // Форма отзыва - отправка в Telegram через Cloudflare Worker (см. план)
  var reviewForm = document.getElementById('review-form');
  if (reviewForm) {
    var WORKER_URL = 'https://2.kasp3r42-gmail-com.workers.dev';
    reviewForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var formData = new FormData(reviewForm);
      var submitBtn = reviewForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Отправка...';
      fetch(WORKER_URL, { method: 'POST', body: formData })
        .then(function (res) {
          if (!res.ok) throw new Error('Ошибка отправки');
          alert('Спасибо за отзыв! Он отправлен.');
          reviewForm.reset();
        })
        .catch(function () {
          alert('Не получилось отправить отзыв. Попробуйте позже или напишите в Telegram/WhatsApp.');
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Отправить';
        });
    });
  }

  // Кнопка "Оставить отзыв" - показывает скрытую форму
  var showReviewBtn = document.getElementById('show-review-form');
  if (showReviewBtn && reviewForm) {
    showReviewBtn.addEventListener('click', function () {
      reviewForm.classList.remove('hidden');
      showReviewBtn.closest('.review-cta').style.display = 'none';
      reviewForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  // Модалка "Оставить заявку" - показывает ссылки на соцсети вместо прокрутки к контактам
  var modalOverlay = document.getElementById('contact-modal-overlay');
  if (modalOverlay) {
    var modalClose = document.getElementById('contact-modal-close');
    var ctaButtons = document.querySelectorAll('a.cta-button[href="#contacts"]');
    ctaButtons.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        modalOverlay.classList.add('open');
      });
    });
    if (modalClose) {
      modalClose.addEventListener('click', function () { modalOverlay.classList.remove('open'); });
    }
    modalOverlay.addEventListener('click', function (e) {
      if (e.target === modalOverlay) modalOverlay.classList.remove('open');
    });
  }

  // Лайтбокс портфолио - увеличение фото по клику, листание стрелочками
  var lightboxOverlay = document.getElementById('lightbox-overlay');
  var lightboxImg = document.getElementById('lightbox-img');
  var lightboxClose = document.getElementById('lightbox-close');
  var lightboxPrev = document.getElementById('lightbox-prev');
  var lightboxNext = document.getElementById('lightbox-next');
  if (lightboxOverlay && lightboxImg) {
    var galleryImgs = [];
    var currentIndex = -1;

    function getVisibleImgs() {
      return Array.prototype.filter.call(document.querySelectorAll('#grid img'), function (img) {
        return !img.classList.contains('hidden');
      });
    }

    function showLightboxImage() {
      var img = galleryImgs[currentIndex];
      if (!img) return;
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
    }

    function showPrev() {
      if (!galleryImgs.length) return;
      currentIndex = (currentIndex - 1 + galleryImgs.length) % galleryImgs.length;
      showLightboxImage();
    }

    function showNext() {
      if (!galleryImgs.length) return;
      currentIndex = (currentIndex + 1) % galleryImgs.length;
      showLightboxImage();
    }

    document.querySelectorAll('#grid img').forEach(function (img) {
      img.addEventListener('click', function () {
        galleryImgs = getVisibleImgs();
        currentIndex = galleryImgs.indexOf(img);
        showLightboxImage();
        lightboxOverlay.classList.add('open');
      });
    });
    if (lightboxClose) {
      lightboxClose.addEventListener('click', function () { lightboxOverlay.classList.remove('open'); });
    }
    if (lightboxPrev) {
      lightboxPrev.addEventListener('click', function (e) { e.stopPropagation(); showPrev(); });
    }
    if (lightboxNext) {
      lightboxNext.addEventListener('click', function (e) { e.stopPropagation(); showNext(); });
    }
    lightboxOverlay.addEventListener('click', function (e) {
      if (e.target === lightboxOverlay) lightboxOverlay.classList.remove('open');
    });
    document.addEventListener('keydown', function (e) {
      if (!lightboxOverlay.classList.contains('open')) return;
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'Escape') lightboxOverlay.classList.remove('open');
    });
  }
});
