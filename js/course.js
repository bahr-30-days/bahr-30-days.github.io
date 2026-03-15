document.addEventListener('DOMContentLoaded', async () => {
    // Получаем ID курса из URL
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('id');
    const requestedDay = parseInt(urlParams.get('day')) || getCurrentDay(courseId);
    
    if (!courseId) {
        window.location.href = 'index.html';
        return;
    }
    
    // Загружаем данные курса
    const courseData = await loadCourse(courseId);
    if (!courseData) {
        window.location.href = 'index.html';
        return;
    }
    
    // Сохраняем глобально для других функций
    window.currentCourse = courseData;
    window.currentDay = Math.min(requestedDay, courseData.totalDays);
    
    // Обновляем UI
    updateCourseHeader(courseData);
    await renderDay(window.currentDay);
    
    // Инициализируем обработчики
    initCourseHandlers();
});

function updateCourseHeader(courseData) {
    document.getElementById('currentDay').textContent = window.currentDay;
    document.getElementById('totalDays').textContent = courseData.totalDays;
    
    const progressPercent = ((window.currentDay - 1) / courseData.totalDays) * 100;
    document.getElementById('progressFill').style.width = `${progressPercent}%`;
}

async function renderDay(day) {
    const courseData = window.currentCourse;
    const dayData = courseData.days.find(d => d.day === day);
    
    if (!dayData) return;
    
    const container = document.getElementById('courseContent');
    container.innerHTML = '';
    container.className = 'course-content';
    
    // Заголовок дня
    const titleEl = document.createElement('h1');
    titleEl.className = 'page-title';
    titleEl.textContent = `День ${day}: ${dayData.title}`;
    container.appendChild(titleEl);
    
    // Теория
    if (dayData.theory) {
        const theoryEl = document.createElement('div');
        theoryEl.className = 'theory-block fade-in';
        
        theoryEl.innerHTML = `
            <div class="theory-title">Теория</div>
            <div class="theory-text">${dayData.theory.content}</div>
            ${dayData.theory.examples ? `
                <div class="examples">
                    ${dayData.theory.examples.map(ex => `<div class="example-item">${ex}</div>`).join('')}
                </div>
            ` : ''}
        `;
        
        container.appendChild(theoryEl);
    }
    
    // Задания
    if (dayData.tasks) {
        dayData.tasks.forEach((task, index) => {
            const taskEl = renderTask(task, index);
            container.appendChild(taskEl);
        });
    }
    
    // Проверяем, можно ли активировать кнопку
    checkCompletion();
}

function renderTask(task, index) {
    const taskEl = document.createElement('div');
    taskEl.className = `quiz-block slide-up delay-${Math.min(index + 1, 5)}`;
    taskEl.dataset.taskType = task.type;
    taskEl.dataset.taskIndex = index;
    
    switch (task.type) {
        case 'quiz':
            taskEl.innerHTML = `
                <div class="quiz-question">${task.question}</div>
                <div class="quiz-options">
                    ${task.options.map((opt, i) => `
                        <label class="quiz-option" data-option="${i}">
                            ${opt}
                        </label>
                    `).join('')}
                </div>
                <div class="quiz-feedback" style="display: none;"></div>
            `;
            
            // Добавляем обработчики
            setTimeout(() => {
                const options = taskEl.querySelectorAll('.quiz-option');
                options.forEach(opt => {
                    opt.addEventListener('click', () => handleQuizAnswer(task, opt, options, taskEl));
                });
            }, 100);
            break;
            
        default:
            taskEl.innerHTML = `<div>Тип задания не поддерживается</div>`;
    }
    
    return taskEl;
}

function handleQuizAnswer(task, selectedOpt, allOptions, container) {
    const selectedIndex = parseInt(selectedOpt.dataset.option);
    const feedbackEl = container.querySelector('.quiz-feedback');
    
    // Отмечаем выбранный вариант
    allOptions.forEach(opt => opt.classList.remove('selected', 'correct', 'incorrect'));
    selectedOpt.classList.add('selected');
    
    // Проверяем ответ
    if (selectedIndex === task.correct) {
        selectedOpt.classList.add('correct');
        feedbackEl.textContent = '✅ Правильно!';
        feedbackEl.className = 'quiz-feedback correct';
        feedbackEl.style.display = 'block';
        
        // Сохраняем результат
        markTaskCompleted(container.dataset.taskIndex);
    } else {
        selectedOpt.classList.add('incorrect');
        // Показываем правильный ответ
        allOptions[task.correct].classList.add('correct');
        feedbackEl.textContent = `❌ Неправильно. Правильный ответ: ${task.options[task.correct]}`;
        feedbackEl.className = 'quiz-feedback incorrect';
        feedbackEl.style.display = 'block';
    }
    
    checkCompletion();
}

// Отслеживание выполненных заданий
const completedTasks = new Set();

function markTaskCompleted(taskIndex) {
    completedTasks.add(taskIndex);
}

function checkCompletion() {
    const courseData = window.currentCourse;
    const dayData = courseData.days.find(d => d.day === window.currentDay);
    
    if (!dayData || !dayData.tasks) return;
    
    // Все ли задания выполнены?
    const allCompleted = dayData.tasks.every((_, index) => completedTasks.has(index.toString()));
    
    const completeBtn = document.getElementById('completeDayBtn');
    if (completeBtn) {
        completeBtn.disabled = !allCompleted;
    }
}

function initCourseHandlers() {
    const completeBtn = document.getElementById('completeDayBtn');
    if (completeBtn) {
        completeBtn.addEventListener('click', () => {
            const courseId = window.currentCourse.courseId;
            const day = window.currentDay;
            
            // Сохраняем прогресс
            completeDay(courseId, day);
            
            // Переходим на следующий день или на активные
            if (day < window.currentCourse.totalDays) {
                window.location.href = `course.html?id=${courseId}&day=${day + 1}`;
            } else {
                window.location.href = 'active.html';
            }
        });
    }
}
