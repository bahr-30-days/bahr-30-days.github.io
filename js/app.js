document.addEventListener('DOMContentLoaded', async () => {
    // Загружаем каталог
    const catalog = await loadCatalog();
    
    // Рендерим секции
    const container = document.getElementById('mainContent');
    if (container) {
        renderSections(catalog.sections, container);
    }
    
    // Инициализируем поиск
    initSearch();
});

/**
 * Рендеринг секций главной страницы
 * @param {Array} sections 
 * @param {HTMLElement} container 
 */
function renderSections(sections, container) {
    container.innerHTML = '';
    
    sections.forEach((section, index) => {
        const sectionEl = document.createElement('div');
        sectionEl.className = `section fade-in delay-${Math.min(index + 1, 5)}`;
        
        // Заголовок секции
        if (section.title) {
            const titleEl = document.createElement('h2');
            titleEl.className = 'section-title';
            titleEl.textContent = section.title;
            sectionEl.appendChild(titleEl);
        }
        
        // Контент в зависимости от типа
        switch (section.type) {
            case 'active_preview':
                renderActivePreview(section, sectionEl);
                break;
            case 'grid_2x2':
                renderGrid2x2(section, sectionEl);
                break;
            case 'wide_banner':
                renderWideBanner(section, sectionEl);
                break;
            default:
                renderDefault(section, sectionEl);
        }
        
        container.appendChild(sectionEl);
    });
}

/**
 * Рендеринг активного превью
 */
function renderActivePreview(section, container) {
    const activeCourses = getActiveCourses();
    
    if (activeCourses.length === 0) {
        // Нет активных курсов - показываем предложение
        const emptyEl = document.createElement('div');
        emptyEl.className = 'active-preview';
        emptyEl.innerHTML = `
            <div class="grid-card-icon">✨</div>
            <div style="flex: 1">
                <div style="font-weight: 600">Нет активных курсов</div>
                <div style="font-size: 14px; color: var(--text-secondary)">Начните новый челлендж!</div>
            </div>
        `;
        container.appendChild(emptyEl);
        return;
    }
    
    // Берем первый активный курс
    const course = activeCourses[0];
    loadCourse(course.id).then(courseData => {
        if (!courseData) return;
        
        const progress = ((course.currentDay - 1) / courseData.totalDays) * 100;
        
        const cardEl = document.createElement('div');
        cardEl.className = 'active-preview';
        cardEl.onclick = () => window.location.href = `course.html?id=${course.id}&day=${course.currentDay}`;
        
        cardEl.innerHTML = `
            <div class="grid-card-icon">${getIconForCourse(course.id)}</div>
            <div style="flex: 1">
                <div style="font-weight: 600">${courseData.title}</div>
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <span class="progress-text">${Math.round(progress)}%</span>
                </div>
            </div>
            <button class="continue-btn" onclick="event.stopPropagation(); window.location.href='course.html?id=${course.id}&day=${course.currentDay}'">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                </svg>
            </button>
        `;
        
        container.appendChild(cardEl);
    });
}

/**
 * Рендеринг сетки 2x2
 */
function renderGrid2x2(section, container) {
    const gridEl = document.createElement('div');
    gridEl.className = 'grid-2x2';
    
    section.items.forEach((item, index) => {
        const cardEl = document.createElement('div');
        cardEl.className = `grid-card scale-in delay-${Math.min(index + 1, 5)}`;
        cardEl.onclick = () => window.location.href = `course.html?id=${item.id}`;
        
        cardEl.innerHTML = `
            <div class="grid-card-icon" style="background: ${item.gradient || 'var(--accent-gradient)'}">
                ${item.icon || '📚'}
            </div>
            <div class="grid-card-title">${item.title}</div>
        `;
        
        gridEl.appendChild(cardEl);
    });
    
    container.appendChild(gridEl);
}

/**
 * Рендеринг широкого баннера
 */
function renderWideBanner(section, container) {
    const item = section.items[0];
    
    const bannerEl = document.createElement('div');
    bannerEl.className = 'wide-banner';
    bannerEl.onclick = () => window.location.href = `course.html?id=${item.id}`;
    
    bannerEl.innerHTML = `
        <div class="wide-banner-content">
            <div class="wide-banner-title">${item.title}</div>
            <div class="wide-banner-subtitle">${item.subtitle || 'Начните сегодня'}</div>
        </div>
    `;
    
    container.appendChild(bannerEl);
}

/**
 * Получение иконки для курса
 */
function getIconForCourse(courseId) {
    const icons = {
        'english': '🇬🇧',
        'abs': '💪',
        'meditation': '🧘',
        'python': '🐍',
        'drawing': '🎨'
    };
    return icons[courseId] || '📚';
}
