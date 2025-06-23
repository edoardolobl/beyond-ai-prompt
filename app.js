class PresentationApp {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 19;
        this.slides = document.querySelectorAll('.slide');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.slideCounter = document.getElementById('slideCounter');
        this.progressFill = document.getElementById('progressFill');
        
        this.init();
    }
    
    init() {
        this.updateUI();
        this.bindEvents();
        this.preloadSlides();
    }
    
    bindEvents() {
        // Button navigation
        this.prevBtn.addEventListener('click', () => this.previousSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Touch/swipe navigation for mobile
        this.bindTouchEvents();
        
        // Prevent default browser shortcuts that might interfere
        document.addEventListener('keydown', (e) => {
            if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !e.ctrlKey && !e.altKey && !e.metaKey) {
                e.preventDefault();
            }
        });
    }
    
    bindTouchEvents() {
        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;
        
        const slideContainer = document.getElementById('slideContainer');
        
        slideContainer.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });
        
        slideContainer.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            
            // Only trigger if horizontal swipe is more significant than vertical
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                if (deltaX > 0) {
                    this.previousSlide();
                } else {
                    this.nextSlide();
                }
            }
        }, { passive: true });
    }
    
    handleKeyPress(e) {
        switch(e.key) {
            case 'ArrowRight':
            case ' ': // Spacebar
            case 'PageDown':
                if (!e.shiftKey) {
                    this.nextSlide();
                }
                break;
            case 'ArrowLeft':
            case 'PageUp':
                this.previousSlide();
                break;
            case 'Home':
                this.goToSlide(1);
                break;
            case 'End':
                this.goToSlide(this.totalSlides);
                break;
            case 'Escape':
                // Could be used for fullscreen toggle or other functionality
                break;
        }
    }
    
    nextSlide() {
        if (this.currentSlide < this.totalSlides) {
            this.goToSlide(this.currentSlide + 1);
        }
    }
    
    previousSlide() {
        if (this.currentSlide > 1) {
            this.goToSlide(this.currentSlide - 1);
        }
    }
    
    goToSlide(slideNumber) {
        if (slideNumber < 1 || slideNumber > this.totalSlides) {
            return;
        }
        
        const previousSlide = this.currentSlide;
        this.currentSlide = slideNumber;
        
        // Update slide visibility with animation
        this.updateSlideVisibility(previousSlide);
        this.updateUI();
        
        // Announce slide change for screen readers
        this.announceSlideChange();

        if (slideNumber === 3) {
        initializeBenchmarkSlide();
        }

        // Inicializa o componente interativo apenas se estivermos no slide correto
        if (slideNumber === 13) {
            initializeInteractivePrompt();
        }
    }
    
    updateSlideVisibility(previousSlide) {
        this.slides.forEach((slide, index) => {
            const slideNumber = index + 1;
            slide.classList.remove('active', 'prev');
            
            if (slideNumber === this.currentSlide) {
                slide.classList.add('active');
            } else if (slideNumber === previousSlide) {
                slide.classList.add('prev');
            }
        });
    }
    
    updateUI() {
        // Update progress bar
        const progressPercentage = (this.currentSlide / this.totalSlides) * 100;
        this.progressFill.style.width = `${progressPercentage}%`;
        
        // Update slide counter
        this.slideCounter.textContent = `${this.currentSlide} / ${this.totalSlides}`;
        
        // Update button states
        this.prevBtn.disabled = this.currentSlide === 1;
        this.nextBtn.disabled = this.currentSlide === this.totalSlides;
        
        // Update button text for context
        if (this.currentSlide === this.totalSlides) {
            this.nextBtn.textContent = 'Fim';
        } else {
            this.nextBtn.textContent = 'Próximo →';
        }
        
        if (this.currentSlide === 1) {
            this.prevBtn.textContent = 'Início';
        } else {
            this.prevBtn.textContent = '← Anterior';
        }
    }
    
    announceSlideChange() {
        // Create a live region for screen readers
        let announcer = document.getElementById('slide-announcer');
        if (!announcer) {
            announcer = document.createElement('div');
            announcer.id = 'slide-announcer';
            announcer.setAttribute('aria-live', 'polite');
            announcer.setAttribute('aria-atomic', 'true');
            announcer.className = 'sr-only';
            document.body.appendChild(announcer);
        }
        
        const currentSlideElement = this.slides[this.currentSlide - 1];
        const slideTitle = currentSlideElement.querySelector('h1')?.textContent || `Slide ${this.currentSlide}`;
        
        announcer.textContent = `Slide ${this.currentSlide} de ${this.totalSlides}: ${slideTitle}`;
    }
    
    preloadSlides() {
        // Preload images and ensure fonts are loaded
        this.slides.forEach((slide, index) => {
            const images = slide.querySelectorAll('img');
            images.forEach(img => {
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                }
            });
        });
        
        // Ensure fonts are loaded
        if ('fonts' in document) {
            document.fonts.ready.then(() => {
                console.log('Fonts loaded, presentation ready');
            });
        }
    }
    
    // Utility method to get slide content for search/navigation
    getSlideContent(slideNumber) {
        if (slideNumber < 1 || slideNumber > this.totalSlides) {
            return null;
        }
        
        const slide = this.slides[slideNumber - 1];
        return {
            number: slideNumber,
            title: slide.querySelector('h1')?.textContent || '',
            content: slide.textContent || ''
        };
    }
    
    // Method to handle fullscreen toggle (could be extended)
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }
}

// Utility functions for presentation features
class PresentationUtils {
    static formatCodeBlocks() {
        // Enhance code blocks with syntax highlighting if needed
        const codeBlocks = document.querySelectorAll('.code-block');
        codeBlocks.forEach(block => {
            // Add copy functionality
            const copyBtn = document.createElement('button');
            copyBtn.textContent = 'Copiar';
            copyBtn.className = 'copy-btn';
            copyBtn.style.cssText = `
                position: absolute;
                top: 8px;
                right: 8px;
                background: var(--color-primary);
                color: var(--color-btn-primary-text);
                border: none;
                border-radius: 4px;
                padding: 4px 8px;
                font-size: 12px;
                cursor: pointer;
                opacity: 0;
                transition: opacity 0.2s;
            `;
            
            block.style.position = 'relative';
            block.appendChild(copyBtn);
            
            block.addEventListener('mouseenter', () => {
                copyBtn.style.opacity = '1';
            });
            
            block.addEventListener('mouseleave', () => {
                copyBtn.style.opacity = '0';
            });
            
            copyBtn.addEventListener('click', () => {
                const text = block.textContent.replace('Copiar', '').trim();
                navigator.clipboard.writeText(text).then(() => {
                    copyBtn.textContent = 'Copiado!';
                    setTimeout(() => {
                        copyBtn.textContent = 'Copiar';
                    }, 2000);
                });
            });
        });
    }
    
    static addTableScrollIndicators() {
        // Add scroll indicators for tables on mobile
        const tables = document.querySelectorAll('.comparison-table');
        tables.forEach(tableContainer => {
            const table = tableContainer.querySelector('table');
            if (table && table.scrollWidth > table.clientWidth) {
                tableContainer.classList.add('scrollable-table');
                
                const indicator = document.createElement('div');
                indicator.textContent = '← Deslize para ver mais →';
                indicator.className = 'scroll-indicator';
                indicator.style.cssText = `
                    text-align: center;
                    font-size: 12px;
                    color: var(--color-text-secondary);
                    padding: 8px;
                    background: var(--color-secondary);
                    border-radius: 4px;
                    margin-top: 8px;
                `;
                
                tableContainer.appendChild(indicator);
            }
        });
    }
    
    static enhanceAccessibility() {
        // Add skip navigation
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Pular para o conteúdo principal';
        skipLink.className = 'skip-link';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: var(--color-primary);
            color: var(--color-btn-primary-text);
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 1000;
            transition: top 0.2s;
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
        
        // Add main content landmark
        const slideContainer = document.getElementById('slideContainer');
        slideContainer.id = 'main-content';
        slideContainer.setAttribute('role', 'main');
        slideContainer.setAttribute('aria-label', 'Apresentação de slides');
    }
}

// Theme management
class ThemeManager {
    constructor() {
        this.currentTheme = this.getStoredTheme() || this.getSystemTheme();
        this.init();
    }
    
    init() {
        this.applyTheme(this.currentTheme);
        this.addThemeToggle();
    }
    
    getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    getStoredTheme() {
        // Since we can't use localStorage, we'll rely on system preference
        return null;
    }
    
    applyTheme(theme) {
        document.documentElement.setAttribute('data-color-scheme', theme);
        this.currentTheme = theme;
    }
    
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    }
    
    addThemeToggle() {
        const themeToggle = document.createElement('button');
        themeToggle.textContent = '🌓';
        themeToggle.title = 'Alternar tema';
        themeToggle.className = 'theme-toggle';
        themeToggle.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: 50%;
            width: 40px;
            height: 40px;
            cursor: pointer;
            font-size: 16px;
            z-index: 1000;
            transition: all 0.2s;
            box-shadow: var(--shadow-sm);
        `;
        
        themeToggle.addEventListener('click', () => this.toggleTheme());
        themeToggle.addEventListener('mouseenter', () => {
            themeToggle.style.transform = 'scale(1.1)';
        });
        themeToggle.addEventListener('mouseleave', () => {
            themeToggle.style.transform = 'scale(1)';
        });
        
        document.body.appendChild(themeToggle);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize main presentation
    const presentation = new PresentationApp();
    
    // Initialize theme manager
    const themeManager = new ThemeManager();
    
    // Enhance UI elements
    PresentationUtils.formatCodeBlocks();
    PresentationUtils.addTableScrollIndicators();
    PresentationUtils.enhanceAccessibility();
    
    // Add global error handling
    window.addEventListener('error', (e) => {
        console.error('Application error:', e.error);
    });
    
    // Add visibility change handler to pause/resume if needed
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // Presentation is hidden, could pause animations
            console.log('Presentation hidden');
        } else {
            // Presentation is visible, could resume animations
            console.log('Presentation visible');
        }
    });
    
    // Add resize handler for responsive adjustments
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Re-calculate layouts if needed
            PresentationUtils.addTableScrollIndicators();
        }, 250);
    });
    
    // Expose presentation instance globally for debugging
    window.presentation = presentation;
    
    console.log('Apresentação de Prompt Engineering carregada com sucesso!');
    console.log(`Total de slides: ${presentation.totalSlides}`);
});

// Service worker registration for offline capability (if needed)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Could register a service worker here for offline functionality
        console.log('Service Worker support detected');
    });
}

// Export for module systems if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PresentationApp, PresentationUtils, ThemeManager };
}

function initializeInteractivePrompt() {
    const container = document.querySelector('.slide.active .interactive-prompt-container');
    
    // 1. Se o slide não tiver o componente ou ele JÁ foi inicializado, não faz nada.
    if (!container || container.dataset.initialized === 'true') {
        return;
    }
    // 2. Marca o componente como "inicializado" para não rodar este código novamente.
    container.dataset.initialized = 'true';

    // 3. Seleciona os elementos importantes uma única vez.
    const buttons = container.querySelectorAll('.technique-button');
    const descriptionBox = container.querySelector('.technique-description p');
    const promptDisplay = container.querySelector('.prompt-display');
    const highlightableSpans = promptDisplay.querySelectorAll('span[id^="tech-"]');

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove a classe 'active' de todos os botões
            buttons.forEach(btn => btn.classList.remove('active'));
            // Remove a classe 'highlight' de todos os spans
            highlightableSpans.forEach(span => span.classList.remove('highlight'));

            // Adiciona 'active' apenas ao botão clicado
            button.classList.add('active');

            // Encontra o span correspondente pelo ID
            const targetId = button.dataset.target;
            const targetSpan = document.getElementById(targetId);
            
            if (targetSpan) {
                // Adiciona o destaque visual
                targetSpan.classList.add('highlight');
                
                // Rola a caixa de texto (e não a página inteira) para a posição do span
                promptDisplay.scrollTo({
                    top: targetSpan.offsetTop - (promptDisplay.clientHeight / 3),
                    behavior: 'smooth'
                });
            }

            // Atualiza o texto na caixa de descrição
            descriptionBox.textContent = button.dataset.description;
        });
    });

    // Para uma boa experiência, clica no primeiro botão por padrão ao carregar o slide
    if (buttons.length > 0) {
        buttons[0].click();
    }
}

function initializeBenchmarkSlide() {
    const container = document.querySelector('.slide.active .benchmark-container');
    if (!container || container.dataset.initialized === 'true') {
        return;
    }
    container.dataset.initialized = 'true';

    const clickableCard = container.querySelector('#hypeCard');

    clickableCard.addEventListener('click', () => {
        container.classList.add('is-revealed');
    }, { once: true }); // O evento só pode ser disparado uma vez
}