document.addEventListener('DOMContentLoaded', function () {
    // Hero Slider
    var heroSlides = document.querySelectorAll('.hero-slide');
    var heroDots = document.querySelectorAll('.hero-dot');
    var heroPrev = document.querySelector('.hero-prev');
    var heroNext = document.querySelector('.hero-next');
    var currentSlide = 0;
    var slideInterval;

    function showSlide(index) {
        heroSlides.forEach(function(slide) {
            slide.classList.remove('active');
        });
        heroDots.forEach(function(dot) {
            dot.classList.remove('active');
        });
        
        if (index >= heroSlides.length) {
            currentSlide = 0;
        } else if (index < 0) {
            currentSlide = heroSlides.length - 1;
        } else {
            currentSlide = index;
        }
        
        heroSlides[currentSlide].classList.add('active');
        heroDots[currentSlide].classList.add('active');
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    function prevSlide() {
        showSlide(currentSlide - 1);
    }

    function startSlideshow() {
        slideInterval = setInterval(nextSlide, 5000); // Смена каждые 5 секунд
    }

    function stopSlideshow() {
        clearInterval(slideInterval);
    }

    if (heroSlides.length > 0) {
        // Кнопки навигации
        if (heroNext) {
            heroNext.addEventListener('click', function() {
                nextSlide();
                stopSlideshow();
                startSlideshow();
            });
        }

        if (heroPrev) {
            heroPrev.addEventListener('click', function() {
                prevSlide();
                stopSlideshow();
                startSlideshow();
            });
        }

        // Индикаторы (точки)
        heroDots.forEach(function(dot, index) {
            dot.addEventListener('click', function() {
                showSlide(index);
                stopSlideshow();
                startSlideshow();
            });
        });

        // Запуск автоматической смены
        startSlideshow();

        // Пауза при наведении
        var heroSection = document.querySelector('.hero');
        if (heroSection) {
            heroSection.addEventListener('mouseenter', stopSlideshow);
            heroSection.addEventListener('mouseleave', startSlideshow);
        }
    }

    // Mobile menu toggle
    var mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    var navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        var links = navLinks.querySelectorAll('.nav-link');
        links.forEach(function(link) {
            link.addEventListener('click', function() {
                navLinks.classList.remove('active');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!mobileMenuToggle.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('active');
            }
        });
    }
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function (e) {
            var href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                var target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    var unitsEl = document.getElementById('calc-units');
    var adrEl = document.getElementById('calc-adr');
    var occEl = document.getElementById('calc-occ');
    var daysEl = document.getElementById('calc-days');
    var capexEl = document.getElementById('calc-capex');

    var revMonthEl = document.getElementById('calc-rev-month');
    var revYearEl = document.getElementById('calc-rev-year');
    var paybackEl = document.getElementById('calc-payback');

    function toNumber(value) {
        var n = Number(value);
        return isFinite(n) ? n : 0;
    }

    function clamp(n, min, max) {
        return Math.min(Math.max(n, min), max);
    }

    function formatCurrency(n) {
        return n.toLocaleString('ru-RU') + ' ₽';
    }

    function recalc() {
        if (!unitsEl || !adrEl || !occEl || !daysEl || !capexEl) return;

        var units = toNumber(unitsEl.value);
        var adr = toNumber(adrEl.value);
        var occ = clamp(toNumber(occEl.value), 0, 100);
        var days = clamp(toNumber(daysEl.value), 1, 31);
        var capex = Math.max(0, toNumber(capexEl.value));

        var revMonth = units * adr * (occ / 100) * days;
        var revYear = revMonth * 12;
        var payback = revMonth > 0 ? Math.ceil(capex / revMonth) : 0;

        if (revMonthEl) revMonthEl.textContent = formatCurrency(Math.round(revMonth));
        if (revYearEl) revYearEl.textContent = formatCurrency(Math.round(revYear));
        if (paybackEl) paybackEl.textContent = payback > 0 ? (payback.toLocaleString('ru-RU') + ' мес.') : '—';
    }

    if (unitsEl && adrEl && occEl && daysEl && capexEl) {
        [unitsEl, adrEl, occEl, daysEl, capexEl].forEach(function (el) {
            el.addEventListener('input', recalc);
            el.addEventListener('change', recalc);
        });
        recalc();
    }

    // Video play on hover
    var videoCards = document.querySelectorAll('.feature-card-video');
    videoCards.forEach(function(card) {
        var video = card.querySelector('.feature-video');
        if (video) {
            card.addEventListener('mouseenter', function() {
                video.play();
            });
            card.addEventListener('mouseleave', function() {
                video.pause();
                video.currentTime = 0;
            });
        }
    });

    // Catalog House Image Sliders
    var houseSliders = document.querySelectorAll('.house-slider');
    
    houseSliders.forEach(function(slider) {
        var images = slider.querySelectorAll('.slider-image');
        var dots = slider.querySelectorAll('.slider-dot');
        var prevBtn = slider.querySelector('.slider-prev');
        var nextBtn = slider.querySelector('.slider-next');
        var currentIndex = 0;

        function showImage(index) {
            // Remove active class from all
            images.forEach(function(img) {
                img.classList.remove('active');
            });
            dots.forEach(function(dot) {
                dot.classList.remove('active');
            });

            // Wrap around
            if (index >= images.length) {
                currentIndex = 0;
            } else if (index < 0) {
                currentIndex = images.length - 1;
            } else {
                currentIndex = index;
            }

            // Add active class
            images[currentIndex].classList.add('active');
            dots[currentIndex].classList.add('active');
        }

        // Next button
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                showImage(currentIndex + 1);
            });
        }

        // Previous button
        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                showImage(currentIndex - 1);
            });
        }

        // Dots navigation
        dots.forEach(function(dot, index) {
            dot.addEventListener('click', function() {
                showImage(index);
            });
        });
    });

    // ===== MODAL FUNCTIONALITY =====
    var modal = document.getElementById('planModal');
    var modalTitle = document.getElementById('modalTitle');
    var modalSliderTrack = document.getElementById('modalSliderTrack');
    var modalSliderDots = document.getElementById('modalSliderDots');
    var modalClose = document.querySelector('.modal-close');
    var modalPrev = document.querySelector('.modal-slider-prev');
    var modalNext = document.querySelector('.modal-slider-next');
    
    var currentModalSlide = 0;
    var modalImages = [];
    var modalDots = [];

    // House data for modal
    var houseData = {
        'taiga-30': {
            title: 'ТАЙГА-30 "Дачный"',
            images: [
                { src: 'images/catalog/taiga-30-plan.jpg', alt: 'Планировка ТАЙГА-30' },
                { src: 'images/catalog/taiga-30-ar.jpg', alt: 'Общий вид ТАЙГА-30' },
                { src: 'images/catalog/taiga-30-ar-2.jpg', alt: 'Общий вид ТАЙГА-30 (2)' }
            ]
        },
        'taiga-40': {
            title: 'ТАЙГА-40 "Комфорт"',
            images: [
                { src: 'images/catalog/taiga-40-plan.jpg', alt: 'Планировка ТАЙГА-40' },
                { src: 'images/catalog/taiga-40-ar.jpg', alt: 'Общий вид ТАЙГА-40' }
            ]
        },
        'taiga-50': {
            title: 'ТАЙГА-50 "Семейный"',
            images: [
                { src: 'images/catalog/taiga-50-plan.jpg', alt: 'Планировка ТАЙГА-50' },
                { src: 'images/catalog/taiga-50-ar.jpg', alt: 'Общий вид ТАЙГА-50' }
            ]
        },
        'taiga-54': {
            title: 'ТАЙГА-54 "Просторный"',
            images: [
                { src: 'images/catalog/taiga54-plan.jpg', alt: 'Планировка ТАЙГА-54' },
                { src: 'images/catalog/taiga54-1.png', alt: 'Общий вид ТАЙГА-54' }
            ]
        },
        'taiga-60': {
            title: 'ТАЙГА-60 "Премиум"',
            images: [
                { src: 'images/catalog/taiga-60-plan.jpg', alt: 'Планировка ТАЙГА-60' },
                { src: 'images/catalog/taiga-60-ar.jpg', alt: 'Общий вид ТАЙГА-60' }
            ]
        },
        'taiga-70': {
            title: 'ТАЙГА-70 "Просторный"',
            images: [
                { src: 'images/catalog/taiga-70-plan.jpg', alt: 'Планировка ТАЙГА-70' },
                { src: 'images/catalog/taiga-70-ar.jpg', alt: 'Общий вид ТАЙГА-70' }
            ]
        },
        'taiga-80': {
            title: 'ТАЙГА-80 "Элитный"',
            images: [
                { src: 'images/catalog/taiga-80-plan.jpg', alt: 'Планировка ТАЙГА-80' },
                { src: 'images/catalog/taiga-80-ar.jpg', alt: 'Общий вид ТАЙГА-80' }
            ]
        },
        'taiga-90': {
            title: 'ТАЙГА-90 "Резиденция"',
            images: [
                { src: 'images/catalog/taiga-90-plan.jpg', alt: 'Планировка ТАЙГА-90' },
                { src: 'images/catalog/taiga-90-ar.jpg', alt: 'Общий вид ТАЙГА-90' }
            ]
        }
    };

    // Open modal function
    function openModal(houseId) {
        var house = houseData[houseId];
        if (!house) return;

        modalTitle.textContent = house.title;
        modalImages = house.images;
        currentModalSlide = 0;

        // Clear previous content
        modalSliderTrack.innerHTML = '';
        modalSliderDots.innerHTML = '';

        // Add images to slider
        modalImages.forEach(function(imageData, index) {
            var img = document.createElement('img');
            img.src = imageData.src;
            img.alt = imageData.alt;
            modalSliderTrack.appendChild(img);

            // Create dot
            var dot = document.createElement('span');
            dot.className = 'modal-slider-dot';
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', function() {
                showModalSlide(index);
            });
            modalSliderDots.appendChild(dot);
        });

        // Update dots array
        modalDots = modalSliderDots.querySelectorAll('.modal-slider-dot');

        // Show modal
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        showModalSlide(0);
    }

    // Show specific slide in modal
    function showModalSlide(index) {
        if (modalImages.length === 0) return;

        // Wrap around
        if (index >= modalImages.length) {
            currentModalSlide = 0;
        } else if (index < 0) {
            currentModalSlide = modalImages.length - 1;
        } else {
            currentModalSlide = index;
        }

        // Update slider position
        var translateX = -currentModalSlide * 100;
        modalSliderTrack.style.transform = 'translateX(' + translateX + '%)';

        // Update dots
        modalDots.forEach(function(dot, i) {
            dot.classList.toggle('active', i === currentModalSlide);
        });
    }

    // Close modal function
    function closeModal() {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }

    // Event listeners for modal
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    if (modalPrev) {
        modalPrev.addEventListener('click', function() {
            showModalSlide(currentModalSlide - 1);
        });
    }

    if (modalNext) {
        modalNext.addEventListener('click', function() {
            showModalSlide(currentModalSlide + 1);
        });
    }

    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            closeModal();
        }
    });

    // Make plan images clickable
    var planImages = document.querySelectorAll('.house-image-plan');
    planImages.forEach(function(planImage) {
        planImage.addEventListener('click', function() {
            // Find the house card this plan belongs to
            var houseCard = planImage.closest('.house-card');
            if (!houseCard) return;

            // Extract house ID from the card
            var houseTitle = houseCard.querySelector('.house-title');
            if (!houseTitle) return;

            var titleText = houseTitle.textContent.toLowerCase();
            var houseId = '';

            if (titleText.includes('30')) houseId = 'taiga-30';
            else if (titleText.includes('40')) houseId = 'taiga-40';
            else if (titleText.includes('50')) houseId = 'taiga-50';
            else if (titleText.includes('54')) houseId = 'taiga-54';
            else if (titleText.includes('60')) houseId = 'taiga-60';
            else if (titleText.includes('70')) houseId = 'taiga-70';
            else if (titleText.includes('80')) houseId = 'taiga-80';
            else if (titleText.includes('90')) houseId = 'taiga-90';

            if (houseId) {
                openModal(houseId);
            }
        });
    });

    // ===== EXPANDABLE SECTIONS =====
    function toggleExpandable(button) {
        var content = button.nextElementSibling;
        var isExpanded = content.classList.contains('expanded');
        
        if (isExpanded) {
            // Скрываем
            content.classList.remove('expanded');
            button.classList.remove('expanded');
            button.querySelector('.expand-text').textContent = 'Подробнее';
        } else {
            // Показываем
            content.classList.add('expanded');
            button.classList.add('expanded');
            button.querySelector('.expand-text').textContent = 'Скрыть';
        }
    }

    // Делаем функцию глобальной для onclick
    window.toggleExpandable = toggleExpandable;
}); 