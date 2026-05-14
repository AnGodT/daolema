const QUOTES = [
    '每一次克制，都让你变得更强。',
    '自律的疼痛是暂时的，后悔的疼痛是永恒的。',
    '真正的自由，来自于克制。',
    '今天不做，明天就会后悔。',
    '强者征服欲望，弱者被欲望征服。',
    '你比你以为的更强大。',
    '每一个拒绝的瞬间，都是一次胜利。',
    '坚持不是一场冲刺，而是一次长途跋涉。',
    '昨天的你是今天的你的老师。',
    '种一棵树最好的时间是十年前，其次是现在。',
];

const MILESTONES = [
    { days: 1, icon: '🌱', label: '第一天' },
    { days: 3, icon: '🌿', label: '入门' },
    { days: 7, icon: '🌳', label: '一周' },
    { days: 14, icon: '🌺', label: '两周' },
    { days: 21, icon: '⭐', label: '三周' },
    { days: 30, icon: '🔥', label: '一个月' },
    { days: 60, icon: '💪', label: '两个月' },
    { days: 90, icon: '🏅', label: '90天' },
    { days: 180, icon: '🎯', label: '半年' },
    { days: 365, icon: '👑', label: '一年' },
];

let state = {
    startTime: null,
    currentStreak: 0,
    longestStreak: 0,
    totalAttempts: 0,
    history: [],
};

let timerInterval = null;

// DOM elements
const daysDisplay = document.getElementById('daysDisplay');
const hoursDisplay = document.getElementById('hoursDisplay');
const minutesDisplay = document.getElementById('minutesDisplay');
const secondsDisplay = document.getElementById('secondsDisplay');
const statusBadge = document.getElementById('statusBadge');
const startBtn = document.getElementById('startBtn');
const failBtn = document.getElementById('failBtn');
const longestStreakEl = document.getElementById('longestStreak');
const totalAttemptsEl = document.getElementById('totalAttempts');
const milestoneContainer = document.getElementById('milestones');
const quoteDisplay = document.getElementById('quoteDisplay');
const modal = document.getElementById('modal');
const modalInfo = document.getElementById('modalInfo');
const confirmFail = document.getElementById('confirmFail');
const cancelFail = document.getElementById('cancelFail');

// Load state from localStorage
function loadState() {
    try {
        const saved = localStorage.getItem('daolema_state');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Convert startTime back to Date if it exists
            if (parsed.startTime) {
                parsed.startTime = new Date(parsed.startTime);
            }
            state = { ...state, ...parsed };
        }
    } catch (e) {
        console.warn('Failed to load state:', e);
    }
}

function saveState() {
    try {
        localStorage.setItem('daolema_state', JSON.stringify(state));
    } catch (e) {
        console.warn('Failed to save state:', e);
    }
}

function getElapsedMs() {
    if (!state.startTime) return 0;
    return Date.now() - state.startTime.getTime();
}

function formatTime() {
    const ms = getElapsedMs();
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { days, hours, minutes, seconds, totalSeconds };
}

function updateDisplay() {
    const t = formatTime();
    daysDisplay.textContent = t.days;
    hoursDisplay.textContent = String(t.hours).padStart(2, '0');
    minutesDisplay.textContent = String(t.minutes).padStart(2, '0');
    secondsDisplay.textContent = String(t.seconds).padStart(2, '0');

    // Update status
    if (t.totalSeconds > 0) {
        statusBadge.textContent = '自律中';
        statusBadge.className = 'status clean';
        state.currentStreak = t.days;
    } else {
        statusBadge.textContent = '等待开始';
        statusBadge.className = 'status waiting';
        state.currentStreak = 0;
    }

    // Update stats
    longestStreakEl.textContent = state.longestStreak;
    totalAttemptsEl.textContent = state.totalAttempts;

    renderMilestones(t.days);
    updateQuote(t.days);
}

function renderMilestones(currentDays) {
    milestoneContainer.innerHTML = '';
    MILESTONES.forEach(m => {
        const div = document.createElement('div');
        div.className = 'milestone' + (currentDays >= m.days ? ' achieved' : '');
        div.innerHTML = `
            <div class="icon">${currentDays >= m.days ? '✅' : m.icon}</div>
            <div class="label">${m.label}</div>
            <div class="day">${m.days}天</div>
        `;
        milestoneContainer.appendChild(div);
    });
}

function updateQuote(days) {
    const idx = Math.min(days, QUOTES.length - 1);
    quoteDisplay.textContent = QUOTES[idx % QUOTES.length];
}

function startChallenge() {
    state.startTime = new Date();
    state.totalAttempts += 1;
    saveState();
    startBtn.textContent = '继续坚持';
    failBtn.style.display = 'block';
    startBtn.style.display = 'none';
}

function failChallenge() {
    const t = formatTime();
    modalInfo.textContent = `这次坚持了 ${t.days} 天 ${t.hours} 小时 ${t.minutes} 分钟`;
    modal.classList.add('active');
}

function confirmFailAction() {
    const t = formatTime();

    // Save to history
    if (t.totalSeconds > 0) {
        state.history.push({
            startTime: state.startTime.getTime(),
            endTime: Date.now(),
            duration: t.totalSeconds,
        });
    }

    // Update longest streak
    if (t.days > state.longestStreak) {
        state.longestStreak = t.days;
    }

    // Reset
    state.startTime = null;
    saveState();

    modal.classList.remove('active');

    // Pulse effect on card
    const card = document.getElementById('timerCard');
    card.classList.remove('pulse');
    void card.offsetWidth; // trigger reflow
    card.classList.add('pulse');

    startBtn.textContent = '重新开始';
    startBtn.style.display = 'block';
    failBtn.style.display = 'none';

    updateDisplay();
}

function cancelFailAction() {
    modal.classList.remove('active');
}

// Initialize
loadState();

if (state.startTime) {
    startBtn.textContent = '继续坚持';
    failBtn.style.display = 'block';
    startBtn.style.display = 'none';
}

// Start timer
timerInterval = setInterval(updateDisplay, 1000);
updateDisplay();

// Event listeners
startBtn.addEventListener('click', startChallenge);
failBtn.addEventListener('click', failChallenge);
confirmFail.addEventListener('click', confirmFailAction);
cancelFail.addEventListener('click', cancelFailAction);
modal.addEventListener('click', (e) => {
    if (e.target === modal) cancelFailAction();
});
