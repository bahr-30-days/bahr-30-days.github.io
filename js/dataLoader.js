// Кэш для данных
const dataCache = new Map();

/**
 * Загрузка JSON данных с кэшированием
 * @param {string} url - путь к файлу
 * @returns {Promise<Object>}
 */
async function loadJSON(url) {
    // Проверяем кэш
    if (dataCache.has(url)) {
        return dataCache.get(url);
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Сохраняем в кэш
        dataCache.set(url, data);
        
        return data;
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        // Возвращаем тестовые данные для разработки
        return getMockData(url);
    }
}

/**
 * Загрузка каталога курсов
 * @returns {Promise<Object>}
 */
async function loadCatalog() {
    return loadJSON('data/catalog.json');
}

/**
 * Загрузка конкретного курса
 * @param {string} courseId 
 * @returns {Promise<Object>}
 */
async function loadCourse(courseId) {
    return loadJSON(`data/courses/${courseId}.json`);
}

/**
 * Мок-данные для разработки (если файлы не созданы)
 */
function getMockData(url) {
    if (url.includes('catalog')) {
        return {
            sections: [
                {
                    title: "Продолжить обучение",
                    type: "active_preview",
                    items: []
                },
                {
                    title: "Популярные за 30 дней",
                    type: "grid_2x2",
                    items: [
                        { id: "english", title: "Английский", icon: "🇬🇧", gradient: "linear-gradient(145deg, #4158D0, #C850C0)" },
                        { id: "abs", title: "Пресс за 30", icon: "💪", gradient: "linear-gradient(145deg, #FF512F, #DD2476)" },
                        { id: "meditation", title: "Медитация", icon: "🧘", gradient: "linear-gradient(145deg, #11998e, #38ef7d)" },
                        { id: "python", title: "Python", icon: "🐍", gradient: "linear-gradient(145deg, #FDC830, #F37335)" }
                    ]
                },
                {
                    title: null,
                    type: "wide_banner",
                    items: [
                        { id: "drawing", title: "Рисование за 30 дней", subtitle: "Раскрой свой творческий потенциал" }
                    ]
                }
            ]
        };
    }
    
    if (url.includes('english')) {
        return {
            courseId: "english",
            title: "Английский за 30 дней",
            totalDays: 30,
            days: [
                {
                    day: 1,
                    title: "Алфавит и звуки",
                    theory: {
                        type: "text",
                        content: "В английском алфавите 26 букв. 20 согласных и 6 гласных.",
                        examples: ["A - Apple (яблоко)", "B - Ball (мяч)", "C - Cat (кошка)"]
                    },
                    tasks: [
                        {
                            type: "quiz",
                            question: "Как переводится 'Cat'?",
                            options: ["Собака", "Кошка", "Крыса"],
                            correct: 1
                        }
                    ]
                }
            ]
        };
    }
    
    return { error: "Data not found" };
}
