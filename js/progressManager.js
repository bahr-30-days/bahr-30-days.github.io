const STORAGE_KEY = 'thirtyDaysProgress';
const STREAK_KEY = 'thirtyDaysStreak';

/**
 * Получение прогресса пользователя
 * @returns {Object}
 */
function getProgress() {
    const defaultProgress = {
        activeCourses: {}, // { courseId: { currentDay: 1, lastAccessed: timestamp, completedDays: [] } }
        completedCourses: [] // массив courseId
    };
    
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : defaultProgress;
    } catch {
        return defaultProgress;
    }
}

/**
 * Сохранение прогресса
 * @param {Object} progress 
 */
function saveProgress(progress) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    updateStreak();
}

/**
 * Отметка дня как пройденного
 * @param {string} courseId 
 * @param {number} day 
 */
function completeDay(courseId, day) {
    const progress = getProgress();
    
    if (!progress.activeCourses[courseId]) {
        progress.activeCourses[courseId] = {
            currentDay: day,
            lastAccessed: Date.now(),
            completedDays: []
        };
    }
    
    const course = progress.activeCourses[courseId];
    if (!course.completedDays.includes(day)) {
        course.completedDays.push(day);
    }
    
    // Если это текущий день, увеличиваем счетчик
    if (day === course.currentDay) {
        course.currentDay = day + 1;
    }
    
    // Проверка на завершение курса
    loadCourse(courseId).then(courseData => {
        if (courseData && course.currentDay > courseData.totalDays) {
            // Курс завершен
            if (!progress.completedCourses.includes(courseId)) {
                progress.completedCourses.push(courseId);
            }
            delete progress.activeCourses[courseId];
        }
        saveProgress(progress);
    });
    
    saveProgress(progress);
}

/**
 * Получение активных курсов
 * @returns {Array}
 */
function getActiveCourses() {
    const progress = getProgress();
    return Object.entries(progress.activeCourses).map(([id, data]) => ({
        id,
        ...data
    }));
}

/**
 * Получение последнего незавершенного дня для курса
 * @param {string} courseId 
 * @returns {number}
 */
function getCurrentDay(courseId) {
    const progress = getProgress();
    return progress.activeCourses[courseId]?.currentDay || 1;
}

/**
 * Обновление серии (streak)
 */
function updateStreak() {
    const streak = getStreak();
    const lastActive = streak.lastActive || 0;
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    // Если прошло меньше 2 дней, увеличиваем streak
    if (now - lastActive < oneDayMs * 2) {
        streak.current += 1;
    } else {
        streak.current = 1; // Сброс
    }
    
    streak.lastActive = now;
    
    if (streak.current > streak.best) {
        streak.best = streak.current;
    }
    
    localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
}

/**
 * Получение текущей серии
 * @returns {Object}
 */
function getStreak() {
    const defaultStreak = {
        current: 0,
        best: 0,
        lastActive: null
    };
    
    try {
        return JSON.parse(localStorage.getItem(STREAK_KEY)) || defaultStreak;
    } catch {
        return defaultStreak;
    }
}

/**
 * Сброс прогресса (для тестирования)
 */
function resetProgress() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STREAK_KEY);
}
