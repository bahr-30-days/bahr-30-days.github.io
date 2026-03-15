function initSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    let debounceTimer;
    
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            performSearch(e.target.value);
        }, 300);
    });
}

async function performSearch(query) {
    if (!query.trim()) {
        // Восстанавливаем обычный вид
        location.reload();
        return;
    }
    
    // Загружаем каталог и ищем совпадения
    const catalog = await loadCatalog();
    const results = [];
    
    catalog.sections.forEach(section => {
        if (section.items) {
            section.items.forEach(item => {
                if (item.title.toLowerCase().includes(query.toLowerCase())) {
                    results.push(item);
                }
            });
        }
    });
    
    // Отображаем результаты
    displaySearchResults(results, query);
}

function displaySearchResults(results, query) {
    const container = document.getElementById('mainContent');
    
    if (results.length === 0) {
        container.innerHTML = `
            <div class="glass-card" style="text-align: center; padding: 48px 24px;">
                <div style="font-size: 64px; margin-bottom: 24px;">🔍</div>
                <h3 style="margin-bottom: 8px;">Ничего не найдено</h3>
                <p style="color: var(--text-secondary);">По запросу "${query}"</p>
                <button class="btn-primary" style="margin-top: 24px;" onclick="location.reload()">
                    На главную
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <h2 class="section-title">Результаты поиска: "${query}"</h2>
        <div class="grid-2x2">
            ${results.map((item, index) => `
                <div class="grid-card scale-in delay-${Math.min(index + 1, 5)}" onclick="window.location.href='course.html?id=${item.id}'">
                    <div class="grid-card-icon" style="background: ${item.gradient || 'var(--accent-gradient)'}">
                        ${item.icon || '📚'}
                    </div>
                    <div class="grid-card-title">${item.title}</div>
                </div>
            `).join('')}
        </div>
    `;
}
