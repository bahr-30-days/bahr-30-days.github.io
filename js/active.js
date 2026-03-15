document.addEventListener('DOMContentLoaded', () => {
    renderActiveCourses();
});

function renderActiveCourses() {
    const inProgressList = document.getElementById('inProgressList');
    const completedList = document.getElementById('completedList');
    
    const progress = getProgress();
    
    // Активные курсы
    inProgressList.innerHTML = '';
    const activeCourses = Object.entries(progress.activeCourses);
    
    if (activeCourses.length === 0) {
        inProgressList.innerHTML = `
            <div class="glass-card" style="text-align: center; padding: 32px;">
                <div style="font-size: 48px; margin-bottom: 16px;">✨</div>
                <div style="font-weight: 600; margin-bottom: 8px;">Нет активных курсов</div>
                <div style="color: var(--text-secondary); font-size: 14px;">Начните новый челлендж на главной</div>
            </div>
        `;
    } else {
        activeCourses.forEach(([courseId, data], index) => {
            loadCourse(courseId).then(courseData => {
                if (!courseData) return;
                
                const progressPercent = ((data.currentDay - 1) / courseData.totalDays) * 100;
                
                const card = document.createElement('div');
                card.className = `active-card slide-up delay-${Math.min(index + 1, 5)}`;
                card.onclick = () => window.location.href = `course.html?id=${courseId}&day=${data.currentDay}`;
                
                card.innerHTML = `
                    <div class="active-card-icon">${getIconForCourse(courseId)}</div>
                    <div class="active-card-content">
                        <div class="active-card-title">${courseData.title}</div>
                        <div class="active-card-subtitle">День ${data.currentDay} из ${courseData.totalDays}</div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${progressPercent}%"></div>
                            </div>
                            <span class="progress-text">${Math.round(progressPercent)}%</span>
                        </div>
                    </div>
                    <button class="continue-btn" onclick="event.stopPropagation(); window.location.href='course.html?id=${courseId}&day=${data.currentDay}'">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </button>
                `;
                
                inProgressList.appendChild(card);
            });
        });
    }
    
    // Завершенные курсы
    completedList.innerHTML = '';
    if (progress.completedCourses.length === 0) {
        completedList.innerHTML = `
            <div class="glass-card" style="text-align: center; padding: 24px;">
                <div style="color: var(--text-secondary);">Пока нет завершенных курсов</div>
            </div>
        `;
    } else {
        progress.completedCourses.forEach(courseId => {
            loadCourse(courseId).then(courseData => {
                if (!courseData) return;
                
                const card = document.createElement('div');
                card.className = 'completed-card glass-card';
                card.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div class="grid-card-icon" style="width: 40px; height: 40px;">🏆</div>
                        <div>
                            <div style="font-weight: 600;">${courseData.title}</div>
                            <div style="font-size: 12px; color: var(--text-secondary);">Завершен</div>
                        </div>
                    </div>
                `;
                completedList.appendChild(card);
            });
        });
    }
}
