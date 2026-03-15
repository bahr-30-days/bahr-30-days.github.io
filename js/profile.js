document.addEventListener('DOMContentLoaded', () => {
    renderProfile();
});

function renderProfile() {
    const progress = getProgress();
    const streak = getStreak();
    
    // Подсчет статистики
    let totalDays = 0;
    progress.completedCourses.forEach(courseId => {
        loadCourse(courseId).then(courseData => {
            if (courseData) {
                totalDays += courseData.totalDays;
                document.getElementById('totalDays').textContent = totalDays;
            }
        });
    });
    
    document.getElementById('completedCourses').textContent = progress.completedCourses.length;
    document.getElementById('currentStreak').textContent = streak.current;
    document.getElementById('accuracy').textContent = '85%'; // Заглушка
    
    // Недавняя активность
    renderActivity(progress);
    
    // Достижения
    renderAchievements(progress);
}

function renderActivity(progress) {
    const activityList = document.getElementById('activityList');
    
    const activities = [];
    
    // Собираем активные курсы для отображения
    Object.entries(progress.activeCourses).forEach(([courseId, data]) => {
        activities.push({
            type: 'active',
            courseId,
            timestamp: data.lastAccessed,
            day: data.currentDay - 1
        });
    });
    
    // Сортируем по времени
    activities.sort((a, b) => b.timestamp - a.timestamp);
    
    if (activities.length === 0) {
        activityList.innerHTML = `
            <div class="glass-card" style="text-align: center; padding: 24px;">
                <div style="color: var(--text-secondary);">Пока нет активности</div>
            </div>
        `;
        return;
    }
    
    activityList.innerHTML = '';
    activities.slice(0, 5).forEach(activity => {
        loadCourse(activity.courseId).then(courseData => {
            if (!courseData) return;
            
            const date = new Date(activity.timestamp);
            const timeStr = date.toLocaleDateString('ru-RU', { 
                day: 'numeric', 
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const item = document.createElement('div');
            item.className = 'glass-card';
            item.style.marginBottom = '8px';
            item.style.padding = '12px 16px';
            item.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div class="grid-card-icon" style="width: 32px; height: 32px; font-size: 16px;">
                        ${getIconForCourse(activity.courseId)}
                    </div>
                    <div style="flex: 1;">
                        <div style="font-weight: 500; font-size: 14px;">${courseData.title}</div>
                        <div style="font-size: 12px; color: var(--text-secondary);">
                            День ${activity.day} • ${timeStr}
                        </div>
                    </div>
                </div>
            `;
            
            activityList.appendChild(item);
        });
    });
}

function renderAchievements(progress) {
    const achievementsGrid = document.getElementById('achievements');
    
    const achievements = [
        { id: 'first', title: 'Первый шаг', icon: '🌱', condition: progress.completedCourses.length > 0 },
        { id: 'streak7', title: 'Неделя', icon: '🔥', condition: getStreak().current >= 7 },
        { id: 'streak30', title: 'Месяц', icon: '⭐', condition: getStreak().current >= 30 },
        { id: 'master', title: 'Мастер', icon: '🏆', condition: progress.completedCourses.length >= 3 },
        { id: 'beginner', title: 'Новичок', icon: '🎯', condition: true }, // Всегда доступно
        { id: 'explorer', title: 'Исследователь', icon: '🗺️', condition: Object.keys(progress.activeCourses).length >= 2 },
        { id: 'dedication', title: 'Преданность', icon: '💫', condition: progress.completedCourses.length >= 1 },
        { id: 'speed', title: 'Спринтер', icon: '⚡', condition: false } // Заблокировано
    ];
    
    achievementsGrid.innerHTML = achievements.map(ach => `
        <div class="achievement ${!ach.condition ? 'locked' : ''}">
            <div class="achievement-icon">${ach.icon}</div>
            <div class="achievement-title">${ach.title}</div>
        </div>
    `).join('');
}
