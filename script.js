/* ============================================
   PESKDO — script.js
   Interatividade · Animações · Conversão
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {

    // ==========================================
    // BANNER CAROUSEL (MOBILE)
    // ==========================================
    const carousel = document.getElementById('bannerCarousel');
    const dots = document.querySelectorAll('.banner-carousel-dots .dot');
    let currentSlide = 0;
    let autoPlayInterval;
    const totalSlides = 3;

    function goToSlide(index) {
        if (!carousel) return;
        currentSlide = index;
        carousel.style.transform = 'translateX(-' + (index * 100) + '%)';

        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }

    function nextSlide() {
        goToSlide((currentSlide + 1) % totalSlides);
    }

    // Auto-play do carrossel
    function startAutoPlay() {
        autoPlayInterval = setInterval(nextSlide, 4000);
    }

    function stopAutoPlay() {
        clearInterval(autoPlayInterval);
    }

    // Dots click
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            stopAutoPlay();
            goToSlide(index);
            startAutoPlay();
        });
    });

    // Touch/swipe support para o carrossel
    let touchStartX = 0;
    let touchEndX = 0;

    if (carousel) {
        carousel.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            stopAutoPlay();
        }, { passive: true });

        carousel.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
            startAutoPlay();
        }, { passive: true });
    }

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left -> next
                goToSlide((currentSlide + 1) % totalSlides);
            } else {
                // Swipe right -> prev
                goToSlide((currentSlide - 1 + totalSlides) % totalSlides);
            }
        }
    }

    // Inicia auto-play apenas se estiver em mobile
    if (window.innerWidth <= 768 && carousel) {
        startAutoPlay();
    }

    // Re-inicia auto-play ao redimensionar para mobile
    window.addEventListener('resize', () => {
        if (window.innerWidth <= 768 && carousel) {
            stopAutoPlay();
            startAutoPlay();
        } else {
            stopAutoPlay();
        }
    });

    // ==========================================
    // NAVBAR SCROLL EFFECT
    // ==========================================
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    function handleScroll() {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    // ==========================================
    // MOBILE MENU TOGGLE
    // ==========================================
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    navToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Fecha menu ao clicar fora (mobile)
    document.addEventListener('click', function(e) {
        if (!navbar.contains(e.target) && navMenu.classList.contains('active')) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // ==========================================
    // SMOOTH SCROLL PARA ANCHORS
    // ==========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ==========================================
    // INTERSECTION OBSERVER — ANIMAÇÕES SCROLL
    // ==========================================
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('aos-animate');

                // Se for stat-item, anima o número
                if (entry.target.classList.contains('stat-item')) {
                    animateNumber(entry.target);
                }

                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('[data-aos], .stat-item').forEach(el => {
        observer.observe(el);
    });

    // ==========================================
    // ANIMAÇÃO DE CONTADOR
    // ==========================================
    function animateNumber(element) {
        const numberEl = element.querySelector('.stat-number');
        if (!numberEl) return;

        const text = numberEl.textContent;
        const match = text.match(/([0-9]+)/);
        if (!match) return;

        const target = parseInt(match[1]);
        const suffix = text.replace(/[0-9]+/, '');
        const duration = 2000;
        const start = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);

            // Easing ease-out
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(easeOut * target);

            numberEl.innerHTML = current + '<span>' + suffix.replace(/^[0-9]+/, '') + '</span>';

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                numberEl.innerHTML = target + '<span>' + suffix.replace(/^[0-9]+/, '') + '</span>';
            }
        }

        requestAnimationFrame(update);
    }

    // ==========================================
    // MÁSCARA DE TELEFONE
    // ==========================================
    const telefoneInput = document.getElementById('telefone');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');

            if (value.length > 11) {
                value = value.slice(0, 11);
            }

            if (value.length > 10) {
                value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
            } else if (value.length > 6) {
                value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
            } else if (value.length > 2) {
                value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2');
            } else {
                value = value.replace(/(\d{0,2})/, '($1');
            }

            e.target.value = value;
        });
    }

    // ==========================================
    // FORMULÁRIO → WHATSAPP
    // Envia TODOS os campos preenchidos para o WhatsApp
    // ==========================================
    const contatoForm = document.getElementById('contatoForm');
    if (contatoForm) {
        contatoForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Captura TODOS os valores dos campos
            const nome = document.getElementById('nome').value.trim();
            const email = document.getElementById('email').value.trim();
            const telefone = document.getElementById('telefone').value.trim();
            const tipo = document.getElementById('tipo').value;
            const mensagem = document.getElementById('mensagem').value.trim();

            // Mapa de tipos de negócio
            const tipoLabels = {
                'supermercado': 'Supermercado',
                'restaurante': 'Restaurante',
                'distribuidor': 'Distribuidor',
                'outro': 'Outro'
            };

            const tipoNegocio = tipoLabels[tipo] || tipo || 'Não informado';

            // Monta a mensagem com TODOS os dados do formulário
            let text = '*Novo contato pelo site Peskdo*';
            text += '%0A%0A';
            text += '*Nome:* ' + encodeURIComponent(nome);
            text += '%0A';
            text += '*E-mail:* ' + encodeURIComponent(email);
            text += '%0A';
            text += '*WhatsApp:* ' + encodeURIComponent(telefone);
            text += '%0A';
            text += '*Tipo de negócio:* ' + encodeURIComponent(tipoNegocio);
            text += '%0A%0A';
            text += '*Mensagem:*';
            text += '%0A' + encodeURIComponent(mensagem);

            // URL do WhatsApp com número do cliente e mensagem completa
            const whatsappUrl = 'https://wa.me/5521998716964?text=' + text;

            // Abre WhatsApp em nova aba
            window.open(whatsappUrl, '_blank');

            // Feedback visual no botão
            const btn = contatoForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Mensagem Enviada!';
            btn.style.background = '#22c55e';
            btn.style.borderColor = '#22c55e';
            btn.disabled = true;

            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = '';
                btn.style.borderColor = '';
                btn.disabled = false;
                contatoForm.reset();
            }, 3000);
        });
    }

    // ==========================================
    // PARALLAX SUAVE NO HERO
    // ==========================================
    const heroBg = document.querySelector('.hero-bg');
    if (heroBg) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            heroBg.style.transform = 'translateY(' + (scrolled * 0.3) + 'px)';
        }, { passive: true });
    }

    // ==========================================
    // HEADER HIDE/SHOW NO SCROLL (mobile)
    // ==========================================
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const currentScroll = window.pageYOffset;
            if (currentScroll > lastScroll && currentScroll > 300 && window.innerWidth <= 768) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }
            lastScroll = currentScroll;
        }, 50);
    }, { passive: true });

    navbar.style.transition = 'transform 0.3s ease, background 0.3s ease, box-shadow 0.3s ease';

    // ==========================================
    // ACTIVE NAV LINK ON SCROLL (DESKTOP)
    // ==========================================
    const sections = document.querySelectorAll('section[id]');

    function setActiveLink() {
        const scrollPos = window.pageYOffset + 120;
        let currentSection = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                currentSection = sectionId;
            }
        });

        // Se estiver no topo, ativa o início
        if (window.pageYOffset < 100) {
            currentSection = 'inicio';
        }

        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === '#' + currentSection) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', setActiveLink, { passive: true });
    // Executa uma vez ao carregar
    setActiveLink();

    // ==========================================
    // LAZY LOAD IMAGES
    // ==========================================
    const lazyImages = document.querySelectorAll('img');
    const imgObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.style.opacity = '0';
                img.style.transition = 'opacity 0.5s ease';

                if (img.complete) {
                    img.style.opacity = '1';
                } else {
                    img.addEventListener('load', function() {
                        img.style.opacity = '1';
                    });
                }

                imgObserver.unobserve(img);
            }
        });
    }, { rootMargin: '50px' });

    lazyImages.forEach(img => imgObserver.observe(img));

    // ==========================================
    // BOTÃO VOLTAR AO TOPO
    // ==========================================
    const backToTop = document.createElement('button');
    backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTop.className = 'back-to-top';
    backToTop.setAttribute('aria-label', 'Voltar ao topo');
    backToTop.style.cssText = 'position:fixed;bottom:110px;right:30px;width:48px;height:48px;background:var(--primary);color:#fff;border:none;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1rem;cursor:pointer;opacity:0;visibility:hidden;transform:translateY(20px);transition:all 0.3s ease;box-shadow:var(--shadow);z-index:998;';
    document.body.appendChild(backToTop);

    backToTop.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 600) {
            backToTop.style.opacity = '1';
            backToTop.style.visibility = 'visible';
            backToTop.style.transform = 'translateY(0)';
        } else {
            backToTop.style.opacity = '0';
            backToTop.style.visibility = 'hidden';
            backToTop.style.transform = 'translateY(20px)';
        }
    }, { passive: true });

    // ==========================================
    // CONSOLE BRANDING
    // ==========================================
    console.log('%c PESKDO ', 'background: #0066A1; color: #fff; font-size: 20px; font-weight: bold; padding: 10px 20px; border-radius: 8px;');
    console.log('%cSite otimizado para conversão B2B', 'color: #0066A1; font-size: 14px;');
});