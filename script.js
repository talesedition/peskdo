/* ============================================
   PESKDO — script.js
   Interatividade · Animações · Conversão
   v2.0 — Otimizado e Corrigido
   ============================================ */

(function() {
    'use strict';

    /* ==========================================
       CONFIGURAÇÕES & UTILITÁRIOS
       ========================================== */
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

    /* ==========================================
       NAVBAR — SCROLL UNIFICADO (RAF)
       ========================================== */
    const navbar = document.getElementById('navbar');
    let lastScrollY = window.scrollY;
    let ticking = false;

    function updateNavbar(currentScroll) {
        // Efeito de background/blur
        navbar.classList.toggle('scrolled', currentScroll > 50);

        // Hide/show no mobile (scroll para baixo esconde, para cima mostra)
        if (window.innerWidth <= 768) {
            if (currentScroll > lastScrollY && currentScroll > 300) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }
        } else {
            navbar.style.transform = 'translateY(0)';
        }
    }

    function updateActiveLink(currentScroll) {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        const scrollPos = currentScroll + 120;
        let currentSection = '';

        sections.forEach(function(section) {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                currentSection = sectionId;
            }
        });

        if (currentScroll < 100) currentSection = 'inicio';

        navLinks.forEach(function(link) {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + currentSection) {
                link.classList.add('active');
            }
        });
    }

    function updateParallax(currentScroll) {
        const heroBg = document.querySelector('.hero-bg');
        if (heroBg && !prefersReducedMotion) {
            heroBg.style.transform = 'translateY(' + (currentScroll * 0.3) + 'px)';
        }
    }

    function onScroll() {
        const currentScroll = window.scrollY;
        updateNavbar(currentScroll);
        updateActiveLink(currentScroll);
        updateParallax(currentScroll);
        lastScrollY = currentScroll;
    }

    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                onScroll();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // Estado inicial
    onScroll();

    /* ==========================================
       MOBILE MENU TOGGLE
       ========================================== */
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            const isActive = navMenu.classList.toggle('active');
            navToggle.classList.toggle('active', isActive);
            document.body.style.overflow = isActive ? 'hidden' : '';
        });

        navLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Fecha ao clicar fora
        document.addEventListener('click', function(e) {
            if (!navbar.contains(e.target) && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        // Fecha ao redimensionar para desktop
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768 && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    /* ==========================================
       SMOOTH SCROLL PARA ÂNCORAS
       ========================================== */
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: prefersReducedMotion ? 'auto' : 'smooth'
                });
            }
        });
    });

    /* ==========================================
       UTILITÁRIO: CARROSSEL BASE
       ========================================== */
    function initCarousel(config) {
        const {
            track,
            slides,
            dots,
            prevBtn,
            nextBtn,
            delay,
            onChange
        } = config;

        let current = 0;
        let interval = null;
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;
        let isVisible = true;

        function goTo(index) {
            if (index < 0) index = slides.length - 1;
            if (index >= slides.length) index = 0;

            slides.forEach(function(slide, i) {
                slide.classList.toggle('active', i === index);
            });

            if (dots) {
                dots.forEach(function(dot, i) {
                    dot.classList.toggle('active', i === index);
                    dot.setAttribute('aria-current', i === index ? 'true' : 'false');
                });
            }

            current = index;
            if (typeof onChange === 'function') onChange(index);
        }

        function next() { goTo(current + 1); }
        function prev() { goTo(current - 1); }

        function start() {
            if (prefersReducedMotion || !isVisible) return;
            stop();
            interval = setInterval(next, delay);
        }

        function stop() {
            if (interval) clearInterval(interval);
            interval = null;
        }

        // Dots
        if (dots) {
            dots.forEach(function(dot, index) {
                dot.addEventListener('click', function() {
                    stop();
                    goTo(index);
                    start();
                });
            });
        }

        // Botões prev/next
        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                stop();
                prev();
                start();
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                stop();
                next();
                start();
            });
        }

        // Touch swipe (apenas horizontal)
        if (track) {
            track.addEventListener('touchstart', function(e) {
                touchStartX = e.changedTouches[0].screenX;
                touchStartY = e.changedTouches[0].screenY;
                stop();
            }, { passive: true });

            track.addEventListener('touchend', function(e) {
                touchEndX = e.changedTouches[0].screenX;
                touchEndY = e.changedTouches[0].screenY;
                handleSwipe();
                start();
            }, { passive: true });
        }

        function handleSwipe() {
            const diffX = touchStartX - touchEndX;
            const diffY = touchStartY - touchEndY;

            // Só processa se o movimento for predominantemente horizontal
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    next();
                } else {
                    prev();
                }
            }
        }

        // Pausa ao passar o mouse (desktop)
        if (track && !isTouchDevice) {
            track.addEventListener('mouseenter', stop);
            track.addEventListener('mouseleave', start);
        }

        // Pausa quando sai da viewport (economia de bateria)
        const visibilityObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                isVisible = entry.isIntersecting;
                if (isVisible) {
                    start();
                } else {
                    stop();
                }
            });
        }, { threshold: 0.1 });

        if (track) visibilityObserver.observe(track);

        // Inicia
        goTo(0);
        start();

        // API pública
        return { goTo, next, prev, stop, start };
    }

    /* ==========================================
       BANNERS CARROSSEL FULL-WIDTH
       ========================================== */
    const bannersTrack = document.getElementById('bannersTrack');
    const bannerSlides = document.querySelectorAll('.banner-slide');
    const bannerDots = document.querySelectorAll('#bannerDots .dot');

    if (bannersTrack && bannerSlides.length > 0) {
        initCarousel({
            track: bannersTrack,
            slides: bannerSlides,
            dots: bannerDots,
            delay: 5000
        });
    }

    /* ==========================================
       CARROSSEL DE GALERIA
       ========================================== */
    const galeriaTrack = document.getElementById('galeriaTrack');
    const galeriaSlides = document.querySelectorAll('.galeria-slide');
    const galeriaDots = document.querySelectorAll('#galeriaDots .dot');
    const galeriaPrev = document.getElementById('galeriaPrev');
    const galeriaNext = document.getElementById('galeriaNext');

    let galeriaApi = null;
    if (galeriaTrack && galeriaSlides.length > 0) {
        galeriaApi = initCarousel({
            track: galeriaTrack,
            slides: galeriaSlides,
            dots: galeriaDots,
            prevBtn: galeriaPrev,
            nextBtn: galeriaNext,
            delay: 5000
        });

        // Navegação por teclado (setas) quando a galeria está em foco
        galeriaTrack.setAttribute('tabindex', '0');
        galeriaTrack.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                galeriaApi.stop();
                galeriaApi.prev();
                galeriaApi.start();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                galeriaApi.stop();
                galeriaApi.next();
                galeriaApi.start();
            }
        });
    }

    /* ==========================================
       INTERSECTION OBSERVER — ANIMAÇÕES SCROLL
       ========================================== */
    const animObserverOptions = {
        root: null,
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.05
    };

    const animObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('aos-animate');

                if (entry.target.classList.contains('stat-item')) {
                    animateNumber(entry.target);
                }

                animObserver.unobserve(entry.target);
            }
        });
    }, animObserverOptions);

    document.querySelectorAll('[data-aos], .stat-item').forEach(function(el) {
        if (prefersReducedMotion) {
            // Sem animação: mostra imediatamente
            el.classList.add('aos-animate');
            if (el.classList.contains('stat-item')) {
                animateNumber(el);
            }
        } else {
            animObserver.observe(el);
        }
    });

    /* ==========================================
       ANIMAÇÃO DE CONTADOR
       ========================================== */
    function animateNumber(element) {
        const numberEl = element.querySelector('.stat-number');
        if (!numberEl) return;

        const text = numberEl.textContent;
        const match = text.match(/([0-9]+)/);
        if (!match) return;

        const target = parseInt(match[1], 10);
        const suffix = text.replace(/[0-9]+/, '');
        const duration = 2000;
        const start = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(easeOut * target);

            numberEl.innerHTML = current + '<span>' + suffix + '</span>';

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                numberEl.innerHTML = target + '<span>' + suffix + '</span>';
            }
        }

        requestAnimationFrame(update);
    }

    /* ==========================================
       MÁSCARA DE TELEFONE
       ========================================== */
    function aplicarMascaraTelefone(input) {
        if (!input) return;

        input.addEventListener('input', function(e) {
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

    aplicarMascaraTelefone(document.getElementById('telefoneLead'));
    aplicarMascaraTelefone(document.getElementById('whatsappFinal'));

    /* ==========================================
       FORMULÁRIO LEAD (NO INÍCIO) → WHATSAPP
       ========================================== */
    const leadForm = document.getElementById('leadFormElement');
    if (leadForm) {
        leadForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const nome = document.getElementById('nomeLead').value.trim();
            const email = document.getElementById('emailLead').value.trim();
            const telefone = document.getElementById('telefoneLead').value.trim();
            const tipo = document.getElementById('tipoLead').value;
            const mensagem = document.getElementById('mensagemLead').value.trim();

            if (!nome || !email || !telefone || !tipo || !mensagem) return;

            const tipoLabels = {
                'supermercado': 'Supermercado',
                'restaurante': 'Restaurante',
                'distribuidor': 'Distribuidor',
                'outro': 'Outro'
            };

            const tipoInteresse = tipoLabels[tipo] || tipo;

            let text = '*Novo contato pelo site Peskdo*';
            text += '%0A%0A';
            text += '*Nome:* ' + encodeURIComponent(nome);
            text += '%0A';
            text += '*E-mail:* ' + encodeURIComponent(email);
            text += '%0A';
            text += '*WhatsApp:* ' + encodeURIComponent(telefone);
            text += '%0A';
            text += '*Interesse:* ' + encodeURIComponent(tipoInteresse);
            text += '%0A%0A';
            text += '*Mensagem:*';
            text += '%0A' + encodeURIComponent(mensagem);

            const whatsappUrl = 'https://wa.me/5521998716964?text=' + text;
            window.open(whatsappUrl, '_blank');

            const btn = leadForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Mensagem Enviada!';
            btn.style.background = '#22c55e';
            btn.style.borderColor = '#22c55e';
            btn.disabled = true;

            setTimeout(function() {
                btn.innerHTML = originalText;
                btn.style.background = '';
                btn.style.borderColor = '';
                btn.disabled = false;
                leadForm.reset();
            }, 3000);
        });
    }

    /* ==========================================
       FORMULÁRIO FINAL (CONTATO) → WHATSAPP
       ========================================== */
    const contatoFormFinal = document.getElementById('contatoFormFinal');
    if (contatoFormFinal) {
        contatoFormFinal.addEventListener('submit', function(e) {
            e.preventDefault();

            const tipoNegocio = document.getElementById('tipoNegocio').value;
            const qtdEstabelecimentos = document.getElementById('qtdEstabelecimentos').value.trim();
            const email = document.getElementById('emailFinal').value.trim();
            const whatsapp = document.getElementById('whatsappFinal').value.trim();
            const mensagem = document.getElementById('mensagemFinal').value.trim();

            if (!tipoNegocio || !qtdEstabelecimentos || !email || !whatsapp || !mensagem) return;

            const tipoLabels = {
                'supermercado': 'Supermercado',
                'restaurante': 'Restaurante',
                'outro': 'Outro'
            };

            const tipoNegocioLabel = tipoLabels[tipoNegocio] || tipoNegocio;

            let text = '*Novo contato pelo site Peskdo — Formulário Final*';
            text += '%0A%0A';
            text += '*Qual o seu negócio?:* ' + encodeURIComponent(tipoNegocioLabel);
            text += '%0A';
            text += '*Quantos estabelecimentos?:* ' + encodeURIComponent(qtdEstabelecimentos);
            text += '%0A';
            text += '*E-mail:* ' + encodeURIComponent(email);
            text += '%0A';
            text += '*WhatsApp:* ' + encodeURIComponent(whatsapp);
            text += '%0A%0A';
            text += '*Mensagem:*';
            text += '%0A' + encodeURIComponent(mensagem);

            const whatsappUrl = 'https://wa.me/5521998716964?text=' + text;
            window.open(whatsappUrl, '_blank');

            const btn = contatoFormFinal.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Mensagem Enviada!';
            btn.style.background = '#22c55e';
            btn.style.borderColor = '#22c55e';
            btn.disabled = true;

            setTimeout(function() {
                btn.innerHTML = originalText;
                btn.style.background = '';
                btn.style.borderColor = '';
                btn.disabled = false;
                contatoFormFinal.reset();
            }, 3000);
        });
    }

    /* ==========================================
       LAZY LOADING NATIVO (sem FOUC)
       ========================================== */
    // Aplica loading="lazy" nativo do navegador em todas as imagens
    // exceto o logo, que é above-the-fold e deve carregar imediatamente
    document.querySelectorAll('img').forEach(function(img) {
        if (!img.classList.contains('logo-img') && !img.hasAttribute('loading')) {
            img.setAttribute('loading', 'lazy');
        }
    });

    /* ==========================================
       BOTÃO VOLTAR AO TOPO
       ========================================== */
    const backToTop = document.createElement('button');
    backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTop.className = 'back-to-top';
    backToTop.setAttribute('aria-label', 'Voltar ao topo');
    backToTop.style.cssText = 'position:fixed;bottom:110px;right:30px;width:48px;height:48px;background:var(--primary);color:#fff;border:none;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1rem;cursor:pointer;opacity:0;visibility:hidden;transform:translateY(20px);transition:all 0.3s ease;box-shadow:var(--shadow);z-index:998;';
    document.body.appendChild(backToTop);

    backToTop.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });
    });

    window.addEventListener('scroll', function() {
        if (window.scrollY > 600) {
            backToTop.style.opacity = '1';
            backToTop.style.visibility = 'visible';
            backToTop.style.transform = 'translateY(0)';
        } else {
            backToTop.style.opacity = '0';
            backToTop.style.visibility = 'hidden';
            backToTop.style.transform = 'translateY(20px)';
        }
    }, { passive: true });

    /* ==========================================
       CONSOLE BRANDING
       ========================================== */
    console.log('%c PESKDO ', 'background: #00BFA5; color: #fff; font-size: 20px; font-weight: bold; padding: 10px 20px; border-radius: 8px;');
    console.log('%cSite otimizado para conversão', 'color: #00BFA5; font-size: 14px;');

})();