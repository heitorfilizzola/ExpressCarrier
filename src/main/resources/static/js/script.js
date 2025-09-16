class ModernCarousel {
    constructor(container) {
        this.container = container;
        this.track = container.querySelector('.carousel-track');
        this.slides = container.querySelectorAll('.carousel-slide');
        this.prevBtn = container.querySelector('.carousel-btn-prev');
        this.nextBtn = container.querySelector('.carousel-btn-next');
        this.indicators = container.querySelectorAll('.indicator');
        
        this.currentSlide = 0;
        this.totalSlides = this.slides.length;
        this.isAnimating = false;
        this.autoplayInterval = null;
        this.autoplayDelay = 5000; // 5 segundos
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.startAutoplay();
        this.updateCarousel(0, false);
        
        // Pausar autoplay quando o mouse estiver sobre o carrossel
        this.container.addEventListener('mouseenter', () => this.pauseAutoplay());
        this.container.addEventListener('mouseleave', () => this.startAutoplay());
        
        // Suporte para touch/swipe em dispositivos móveis
        this.setupTouchEvents();
        
        // Suporte para teclado
        this.setupKeyboardEvents();
    }
    
    setupEventListeners() {
        // Botões de navegação
        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        
        // Indicadores
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });
    }
    
    setupTouchEvents() {
        let startX = 0;
        let startY = 0;
        let isDragging = false;
        
        this.container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isDragging = true;
            this.pauseAutoplay();
        }, { passive: true });
        
        this.container.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const deltaX = startX - currentX;
            const deltaY = startY - currentY;
            
            // Verificar se é um swipe horizontal
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
                e.preventDefault();
            }
        }, { passive: false });
        
        this.container.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            
            const endX = e.changedTouches[0].clientX;
            const deltaX = startX - endX;
            
            if (Math.abs(deltaX) > 50) { // Minimum swipe distance
                if (deltaX > 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
            }
            
            isDragging = false;
            this.startAutoplay();
        }, { passive: true });
    }
    
    setupKeyboardEvents() {
        // Tornar o container focusável
        this.container.setAttribute('tabindex', '0');
        
        this.container.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.prevSlide();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextSlide();
                    break;
                case ' ': // Spacebar
                    e.preventDefault();
                    this.toggleAutoplay();
                    break;
            }
        });
    }
    
    prevSlide() {
        if (this.isAnimating) return;
        
        const newSlide = this.currentSlide === 0 ? this.totalSlides - 1 : this.currentSlide - 1;
        this.goToSlide(newSlide);
    }
    
    nextSlide() {
        if (this.isAnimating) return;
        
        const newSlide = this.currentSlide === this.totalSlides - 1 ? 0 : this.currentSlide + 1;
        this.goToSlide(newSlide);
    }
    
    goToSlide(slideIndex, animate = true) {
        if (this.isAnimating || slideIndex === this.currentSlide) return;
        
        this.currentSlide = slideIndex;
        this.updateCarousel(slideIndex, animate);
    }
    
    updateCarousel(slideIndex, animate = true) {
        if (animate) {
            this.isAnimating = true;
        }
        
        // Mover o track
        const translateX = -slideIndex * (100 / this.totalSlides);
        this.track.style.transform = `translateX(${translateX}%)`;
        
        // Atualizar indicadores
        this.indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === slideIndex);
        });
        
        // Atualizar aria-labels para acessibilidade
        this.slides.forEach((slide, index) => {
            slide.setAttribute('aria-hidden', index !== slideIndex);
        });
        
        if (animate) {
            // Resetar flag após a animação
            setTimeout(() => {
                this.isAnimating = false;
            }, 600); // Mesmo tempo da transição CSS
        }
        
        // Disparar evento customizado
        this.container.dispatchEvent(new CustomEvent('slideChange', {
            detail: { 
                currentSlide: slideIndex,
                totalSlides: this.totalSlides 
            }
        }));
    }
    
    startAutoplay() {
        this.pauseAutoplay();
        this.autoplayInterval = setInterval(() => {
            this.nextSlide();
        }, this.autoplayDelay);
    }
    
    pauseAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
    }
    
    toggleAutoplay() {
        if (this.autoplayInterval) {
            this.pauseAutoplay();
        } else {
            this.startAutoplay();
        }
    }
    
    // Método público para ir para um slide específico
    setSlide(index) {
        if (index >= 0 && index < this.totalSlides) {
            this.goToSlide(index);
        }
    }
    
    // Método público para obter o slide atual
    getCurrentSlide() {
        return this.currentSlide;
    }
    
    // Destruir o carrossel (útil para single page applications)
    destroy() {
        this.pauseAutoplay();
        this.container.removeAttribute('tabindex');
        // Aqui você removeria todos os event listeners se necessário
    }
}

// Inicializar carrossel quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    const carouselContainer = document.querySelector('.carousel-container');
    
    if (carouselContainer) {
        const carousel = new ModernCarousel(carouselContainer);
        
        // Exemplo de como escutar mudanças de slide
        carouselContainer.addEventListener('slideChange', (e) => {
            console.log(`Slide atual: ${e.detail.currentSlide + 1}/${e.detail.totalSlides}`);
        });
        
        // Tornar o carrossel acessível globalmente se necessário
        window.carousel = carousel;
    }
});

// Otimizações de performance
// Pausar animações quando a aba não está visível
document.addEventListener('visibilitychange', () => {
    if (window.carousel) {
        if (document.hidden) {
            window.carousel.pauseAutoplay();
        } else {
            window.carousel.startAutoplay();
        }
    }
});

// Pausar animações quando a janela perde o foco
window.addEventListener('blur', () => {
    if (window.carousel) {
        window.carousel.pauseAutoplay();
    }
});

window.addEventListener('focus', () => {
    if (window.carousel) {
        window.carousel.startAutoplay();
    }
});