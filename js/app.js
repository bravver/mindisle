/* ==========================================
   心屿 MindIsle - 主应用逻辑 v2.0
   增强交互与视觉效果
   ========================================== */

// ============ 全局状态 ============
const state = {
  currentPage: 'mood',
  selectedMood: null,
  moodData: {},
  posts: [],
  fishCount: 0,
  fishingTimer: null,
  fishingSeconds: 0,
  isFishing: false,
  fishCaught: [],
  currentMonth: new Date(),
  fishBiteTimer: null,
  caughtThisRound: false
};

// ============ 初始化 ============
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  initNavigation();
  initMoodPage();
  initMountainPage();
  initFishingPage();
  initTreeholePage();
  initIslandPage();
  updateDate();
  initParticles();
});

// ============ 粒子背景效果 ============
function initParticles() {
  const bgDecoration = document.querySelector('.bg-decoration');

  // 创建浮动的粒子
  const particles = ['✨', '🌸', '🍃', '💫', '🦋', '🌺'];
  for (let i = 0; i < 8; i++) {
    const particle = document.createElement('div');
    particle.className = 'floating-decoration';
    particle.textContent = particles[Math.floor(Math.random() * particles.length)];
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    particle.style.animationDelay = `${Math.random() * 10}s`;
    particle.style.animationDuration = `${8 + Math.random() * 6}s`;
    bgDecoration.appendChild(particle);
  }
}

// ============ 数据存储 ============
function loadData() {
  const savedMood = localStorage.getItem('mindisle_mood');
  const savedPosts = localStorage.getItem('mindisle_posts');

  if (savedMood) {
    state.moodData = JSON.parse(savedMood);
  }

  if (savedPosts) {
    state.posts = JSON.parse(savedPosts);
  }
}

function saveMoodData() {
  localStorage.setItem('mindisle_mood', JSON.stringify(state.moodData));
}

function savePostsData() {
  localStorage.setItem('mindisle_posts', JSON.stringify(state.posts));
}

// ============ 日期更新 ============
function updateDate() {
  const now = new Date();
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const dateStr = now.toLocaleDateString('zh-CN', options);
  const dateEl = document.getElementById('current-date');
  if (dateEl) dateEl.textContent = dateStr;
}

// ============ 导航 ============
function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetPage = link.dataset.page;

      // 更新导航状态
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      // 切换页面
      document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
        if (page.id === `${targetPage}-page`) {
          page.classList.add('active');
        }
      });

      state.currentPage = targetPage;
    });
  });
}

// ============ 心情气象站 ============
function initMoodPage() {
  const moodIcons = document.querySelectorAll('.mood-icon');
  const saveBtn = document.getElementById('save-mood-btn');
  const prevBtn = document.getElementById('prev-month');
  const nextBtn = document.getElementById('next-month');

  // 选择心情
  moodIcons.forEach(icon => {
    icon.addEventListener('click', () => {
      moodIcons.forEach(i => i.classList.remove('selected'));
      icon.classList.add('selected', 'just-selected');
      state.selectedMood = icon.dataset.mood;

      setTimeout(() => {
        icon.classList.remove('just-selected');
      }, 500);

      // 添加光效
      icon.style.boxShadow = `0 20px 40px rgba(232, 180, 184, 0.4), 0 0 60px rgba(232, 180, 184, 0.3)`;
    });
  });

  // 保存心情
  saveBtn.addEventListener('click', saveMood);

  // 日历导航
  prevBtn.addEventListener('click', () => {
    state.currentMonth.setMonth(state.currentMonth.getMonth() - 1);
    renderCalendar();
  });

  nextBtn.addEventListener('click', () => {
    state.currentMonth.setMonth(state.currentMonth.getMonth() + 1);
    renderCalendar();
  });

  // 初始化日历
  renderCalendar();
  renderStats();
}

function saveMood() {
  if (!state.selectedMood) {
    showToast('请先选择一个心情哦~ 🌻');
    return;
  }

  const text = document.getElementById('mood-text').value.trim();
  const today = new Date().toISOString().split('T')[0];

  state.moodData[today] = {
    mood: state.selectedMood,
    text: text,
    timestamp: Date.now()
  };

  saveMoodData();
  renderCalendar();
  renderStats();

  // 重置选择
  document.querySelectorAll('.mood-icon').forEach(i => {
    i.classList.remove('selected');
    i.style.boxShadow = '';
  });
  document.getElementById('mood-text').value = '';
  state.selectedMood = null;

  // 保存成功动画
  const card = document.querySelector('.mood-selector');
  card.classList.add('save-success');
  setTimeout(() => card.classList.remove('save-success'), 800);

  showToast('今日心情已温柔记录 ✨');
}

function renderCalendar() {
  const grid = document.getElementById('calendar-grid');
  const monthLabel = document.getElementById('calendar-month');

  if (!grid || !monthLabel) return;

  const year = state.currentMonth.getFullYear();
  const month = state.currentMonth.getMonth();

  monthLabel.textContent = `${year}年 ${month + 1}月`;

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  grid.innerHTML = '';

  for (let i = 0; i < startDay; i++) {
    const empty = document.createElement('div');
    empty.className = 'calendar-day';
    grid.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day';
    dayEl.textContent = day;

    if (dateStr === todayStr) {
      dayEl.classList.add('today');
    }

    if (state.moodData[dateStr]) {
      dayEl.classList.add('has-mood');
      const moodDot = document.createElement('span');
      moodDot.className = 'mood-dot';
      moodDot.style.background = getMoodColor(state.moodData[dateStr].mood);
      dayEl.appendChild(moodDot);

      dayEl.addEventListener('click', () => showMoodDetail(dateStr));
    }

    grid.appendChild(dayEl);
  }
}

function getMoodColor(mood) {
  const colors = {
    sunny: 'linear-gradient(135deg, #F4C7A8, #FFD4B8)',
    cloudy: 'linear-gradient(135deg, #A7C7E7, #C5D9F0)',
    rainy: 'linear-gradient(135deg, #7A9BBF, #9BB5CF)',
    storm: 'linear-gradient(135deg, #C5B9D4, #D5C9E4)',
    rainbow: 'linear-gradient(135deg, #B8D4C8, #D4E8DC)',
    snow: 'linear-gradient(135deg, #D4D4D4, #E8E8E8)',
    moon: 'linear-gradient(135deg, #9B9BBF, #B5B5CF)'
  };
  return colors[mood] || '#E8B4B8';
}

function showMoodDetail(dateStr) {
  const data = state.moodData[dateStr];
  if (!data) return;

  const modal = document.createElement('div');
  modal.className = 'mood-detail-modal active';
  modal.innerHTML = `
    <div class="mood-detail-content">
      <div class="mood-detail-emoji">${getMoodEmoji(data.mood)}</div>
      <div class="mood-detail-date">${dateStr}</div>
      ${data.text ? `<div class="mood-detail-text">${data.text}</div>` : '<div class="mood-detail-text" style="color: var(--color-text-secondary); font-style: italic;">这一天没有留下文字，但心情已记录 🌸</div>'}
      <button class="mood-detail-close">温柔关闭</button>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('.mood-detail-close').addEventListener('click', () => {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
    }
  });
}

function getMoodEmoji(mood) {
  const emojis = {
    sunny: '☀️',
    cloudy: '⛅',
    rainy: '🌧️',
    storm: '⛈️',
    rainbow: '🌈',
    snow: '❄️',
    moon: '🌙'
  };
  return emojis[mood] || '🌻';
}

function renderStats() {
  const emptyEl = document.getElementById('stats-empty');
  const contentEl = document.getElementById('stats-content');
  const timelineEl = document.getElementById('mood-timeline');

  if (!emptyEl || !contentEl) return;

  const entries = Object.entries(state.moodData).sort((a, b) =>
    new Date(b[0]) - new Date(a[0])
  );

  if (entries.length === 0) {
    emptyEl.style.display = 'block';
    contentEl.style.display = 'none';
    return;
  }

  emptyEl.style.display = 'none';
  contentEl.style.display = 'block';

  const totalDays = new Set(entries.map(([date]) => date.substring(0, 7))).size;
  document.getElementById('total-days').textContent = totalDays;
  document.getElementById('total-moods').textContent = entries.length;

  if (timelineEl) {
    timelineEl.innerHTML = entries.slice(0, 10).map(([date, data]) => `
      <div class="timeline-item">
        <span class="timeline-emoji">${getMoodEmoji(data.mood)}</span>
        <div class="timeline-content">
          <span class="timeline-date">${date}</span>
          ${data.text ? `<p class="timeline-text">${data.text}</p>` : ''}
        </div>
      </div>
    `).join('');
  }
}

// ============ 情绪山海 ============
function initMountainPage() {
  const pressureSlider = document.getElementById('pressure-slider');
  const anxietySlider = document.getElementById('anxiety-slider');
  const lonelySlider = document.getElementById('lonely-slider');
  const saveBtn = document.getElementById('save-mountain-btn');
  const resetBtn = document.getElementById('reset-mountain-btn');

  if (!pressureSlider || !anxietySlider || !lonelySlider) return;

  [pressureSlider, anxietySlider, lonelySlider].forEach(slider => {
    slider.addEventListener('input', () => {
      updateMountainCanvas();
      updateSliderValue(slider);
    });
  });

  if (saveBtn) saveBtn.addEventListener('click', saveMountainImage);
  if (resetBtn) resetBtn.addEventListener('click', () => {
    pressureSlider.value = 50;
    anxietySlider.value = 50;
    lonelySlider.value = 50;
    updateMountainCanvas();
    updateAllSliderValues();
  });

  updateMountainCanvas();
  updateAllSliderValues();
}

function updateSliderValue(slider) {
  const value = slider.value;
  const label = slider.previousElementSibling.querySelector('span');
  if (label) label.textContent = value;
}

function updateAllSliderValues() {
  ['pressure', 'anxiety', 'lonely'].forEach(name => {
    const slider = document.getElementById(`${name}-slider`);
    const valueEl = document.getElementById(`${name}-value`);
    if (slider && valueEl) valueEl.textContent = slider.value;
  });
}

function updateMountainCanvas() {
  const canvas = document.getElementById('mountain-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const pressure = parseInt(document.getElementById('pressure-slider')?.value || 50);
  const anxiety = parseInt(document.getElementById('anxiety-slider')?.value || 50);
  const lonely = parseInt(document.getElementById('lonely-slider')?.value || 50);

  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);

  // 渐变天空
  const skyGradient = ctx.createLinearGradient(0, 0, 0, height * 0.5);
  skyGradient.addColorStop(0, '#FFE4D4');
  skyGradient.addColorStop(0.5, '#FFD4B8');
  skyGradient.addColorStop(1, '#FFF0E8');
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, width, height * 0.5);

  // 太阳光晕
  const sunX = width * 0.85;
  const sunY = height * 0.15;
  const sunGradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 80);
  sunGradient.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
  sunGradient.addColorStop(0.5, 'rgba(255, 180, 100, 0.4)');
  sunGradient.addColorStop(1, 'rgba(255, 180, 100, 0)');
  ctx.fillStyle = sunGradient;
  ctx.fillRect(0, 0, width, height * 0.5);

  // 云朵
  drawCloud(ctx, 120, 70, 50, 0.9);
  drawCloud(ctx, 350, 50, 40, 0.7);
  drawCloud(ctx, 600, 80, 45, 0.8);
  drawCloud(ctx, 750, 55, 35, 0.6);

  const baseY = height * 0.72;

  // 压力山
  const pressureHeight = (pressure / 100) * 180 + 60;
  drawMountain(ctx, 150, baseY, 280, pressureHeight, '#E8B4B8', '#FFE8EC', '#FFD4DC');

  // 焦虑山
  const anxietyHeight = (anxiety / 100) * 180 + 60;
  drawMountain(ctx, 400, baseY, 250, anxietyHeight, '#C5B9D4', '#E8E0F0', '#D8D0E8');

  // 孤独山
  const lonelyHeight = (lonely / 100) * 180 + 60;
  drawMountain(ctx, 620, baseY, 300, lonelyHeight, '#A7C7E7', '#E0EBF7', '#D0E0F0');

  // 地面
  const groundGradient = ctx.createLinearGradient(0, baseY + 40, 0, height);
  groundGradient.addColorStop(0, '#F5E6D3');
  groundGradient.addColorStop(0.5, '#E8D4C4');
  groundGradient.addColorStop(1, '#D8C4B4');
  ctx.fillStyle = groundGradient;
  ctx.fillRect(0, baseY + 40, width, height - baseY - 40);

  // 草地点缀
  drawGrass(ctx, width, baseY + 40);

  // 更新描述
  const descEl = document.getElementById('mountain-desc');
  const meanEl = document.getElementById('meaning-content');

  if (descEl) {
    const total = pressure + anxiety + lonely;
    if (total < 90) {
      descEl.textContent = '🌿 你的情绪山海平静而温暖...';
    } else if (total < 150) {
      descEl.textContent = '🌤️ 你的情绪山海有些起伏...';
    } else {
      descEl.textContent = '⛰️ 你的情绪山海正在经历风雨...';
    }
  }

  if (meanEl) {
    meanEl.innerHTML = `
      <p style="margin-bottom: var(--space-md);">你的情绪山海解读：</p>
      <ul>
        <li><strong style="color: #E8B4B8;">压力山</strong>：高度 ${pressureHeight.toFixed(0)}px — ${getPressureDesc(pressure)}</li>
        <li><strong style="color: #C5B9D4;">焦虑山</strong>：高度 ${anxietyHeight.toFixed(0)}px — ${getAnxietyDesc(anxiety)}</li>
        <li><strong style="color: #A7C7E7;">孤独山</strong>：高度 ${lonelyHeight.toFixed(0)}px — ${getLonelyDesc(lonely)}</li>
      </ul>
      <p style="margin-top: var(--space-lg); font-style: italic; color: var(--color-text-secondary);">每座山都是你内心的一部分，无论高矮，都值得被看见。 🌻</p>
    `;
  }
}

function drawCloud(ctx, x, y, size, opacity = 1) {
  ctx.save();
  ctx.globalAlpha = opacity;

  // 柔和云朵
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 1.5);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
  gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.6)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.arc(x + size * 0.8, y - size * 0.2, size * 0.8, 0, Math.PI * 2);
  ctx.arc(x + size * 1.4, y, size * 0.7, 0, Math.PI * 2);
  ctx.arc(x + size * 0.5, y + size * 0.3, size * 0.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawMountain(ctx, x, baseY, width, height, topColor, midColor, lightColor) {
  // 山体渐变
  const gradient = ctx.createLinearGradient(x, baseY - height, x, baseY);
  gradient.addColorStop(0, topColor);
  gradient.addColorStop(0.6, midColor);
  gradient.addColorStop(1, lightColor);

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(x - width / 2, baseY);

  // 柔和的山峰曲线
  ctx.quadraticCurveTo(x - width * 0.3, baseY - height * 0.3, x - width * 0.15, baseY - height * 0.7);
  ctx.quadraticCurveTo(x, baseY - height * 0.95, x + width * 0.1, baseY - height);
  ctx.quadraticCurveTo(x + width * 0.2, baseY - height * 0.8, x + width * 0.35, baseY - height * 0.5);
  ctx.quadraticCurveTo(x + width * 0.5, baseY - height * 0.2, x + width / 2, baseY);

  ctx.closePath();
  ctx.fill();

  // 山峰积雪
  if (height > 120) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.moveTo(x - width * 0.12, baseY - height * 0.65);
    ctx.quadraticCurveTo(x, baseY - height * 0.95, x + width * 0.08, baseY - height * 0.75);
    ctx.quadraticCurveTo(x + width * 0.02, baseY - height * 0.6, x - width * 0.12, baseY - height * 0.65);
    ctx.fill();
  }
}

function drawGrass(ctx, width, y) {
  ctx.fillStyle = '#B8D4C8';
  for (let i = 0; i < width; i += 15) {
    const grassHeight = 5 + Math.random() * 10;
    ctx.beginPath();
    ctx.moveTo(i, y);
    ctx.quadraticCurveTo(i + 3, y - grassHeight, i + 6, y);
    ctx.fill();
  }
}

function getPressureDesc(value) {
  if (value < 30) return '压力较小，享受轻松时光';
  if (value < 60) return '有些压力，但尚可应对';
  return '压力较大，需要关注和放松';
}

function getAnxietyDesc(value) {
  if (value < 30) return '心态平稳，安心自在';
  if (value < 60) return '有些担忧，保持觉察';
  return '焦虑明显，尝试深呼吸放松';
}

function getLonelyDesc(value) {
  if (value < 30) return '有陪伴感，不孤单';
  if (value < 60) return '偶尔感到孤独';
  return '感到孤独，记得有人在乎你';
}

function saveMountainImage() {
  const canvas = document.getElementById('mountain-canvas');
  if (!canvas) return;

  const link = document.createElement('a');
  link.download = `情绪山海_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();

  showToast('情绪山海已保存 🌄');
}

// ============ 思绪钓鱼 - 黄金矿工风格 ============

// 钓鱼游戏状态
const fishingState = {
  // 游戏画布
  canvas: null,
  ctx: null,

  //  rope 状态
  ropeAngle: 0,           // rope 角度（弧度）
  ropeSwinging: true,     // 是否在摆动
  ropeSwingSpeed: 0.03,   // 摆动速度
  ropeSwingDirection: 1,   // 摆动方向
  ropeLength: 0,          // 当前 rope 长度
  maxRopeLength: 380,      // 最大 rope 长度
  ropeSpeed: 5,           // rope 伸出/收回速度

  // 鱼钩状态
  hookX: 0,
  hookY: 0,
  isCasting: false,        // 是否在抛竿中
  isReeling: false,        // 是否在收竿中
  caughtFish: null,        // 钓到的鱼

  // 鱼群
  fishes: [],

  // 游戏状态
  gameStarted: false,
  totalTime: 0,
  timerInterval: null
};

// 鱼的类型及寄语
const fishTypes = [
  { emoji: '🐟', name: '小丑鱼', message: '保持微笑，生活会越来越美好', color: '#FF6B6B' },
  { emoji: '🐠', name: '热带鱼', message: '热情地拥抱每一天吧', color: '#FFA94D' },
  { emoji: '🐡', name: '河豚', message: '给自己一个拥抱，你已经很棒了', color: '#FFD43B' },
  { emoji: '🦈', name: '鲨鱼', message: '勇敢前行，你比自己想象的更强', color: '#748FFC' },
  { emoji: '🐋', name: '鲸鱼', message: '深呼吸，感受世界的温柔', color: '#69DB7C' },
  { emoji: '🦑', name: '章鱼', message: '保持好奇心，探索生活的乐趣', color: '#DA77F2' },
  { emoji: '🐙', name: '八爪鱼', message: '学会放手，接受不完美', color: '#F783AC' },
  { emoji: '🦀', name: '螃蟹', message: '横着走也没关系，那是你的节奏', color: '#E8590C' },
  { emoji: '🐦‍🔥', name: '飞鱼', message: '勇敢追逐你的梦想吧', color: '#4DABF7' },
  { emoji: '🪸', name: '珊瑚', message: '扎根当下，绽放美丽', color: '#FF8787' },
  { emoji: '🪼', name: '水母', message: '柔软也是一种力量', color: '#D0DFFF' },
  { emoji: '🦭', name: '海豹', message: '适时休息，才能走得更远', color: '#B2F2BB' }
];

function initFishingPage() {
  const castBtn = document.getElementById('cast-btn');
  const reelBtn = document.getElementById('reel-btn');

  if (!castBtn || !reelBtn) return;

  // 初始化画布
  fishingState.canvas = document.getElementById('fishing-canvas');
  if (!fishingState.canvas) return;

  fishingState.ctx = fishingState.canvas.getContext('2d');

  // 设置画布尺寸
  resizeFishingCanvas();
  window.addEventListener('resize', resizeFishingCanvas);

  // 绑定按钮事件
  castBtn.addEventListener('click', startCasting);
  reelBtn.addEventListener('click', startReeling);

  // 绑定鼠标/触摸控制rope方向
  setupRopeControls();

  // 初始化鱼群
  initFishes();

  // 开始rope摆动动画
  startRopeSwing();

  // 开始游戏计时
  startGameTimer();

  // 开始游戏循环
  requestAnimationFrame(gameLoop);
}

function resizeFishingCanvas() {
  if (!fishingState.canvas) return;
  const container = fishingState.canvas.parentElement;
  if (!container) return;

  // 设置画布尺寸
  fishingState.canvas.width = Math.min(container.clientWidth || 800, 800);
  fishingState.canvas.height = 500;

  // 重新初始化鱼群位置
  if (fishingState.fishes.length > 0) {
    fishingState.fishes.forEach(fish => {
      fish.x = 100 + Math.random() * (fishingState.canvas.width - 200);
      fish.y = 180 + Math.random() * 280;
    });
  }
}

function setupRopeControls() {
  const canvas = fishingState.canvas;
  if (!canvas) return;

  // 鼠标左右移动控制rope方向
  canvas.addEventListener('mousemove', (e) => {
    if (fishingState.isCasting || fishingState.isReeling) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const centerX = canvas.width / 2;

    // 根据鼠标在画布左侧还是右侧来决定摆动方向
    if (mouseX < centerX - 50) {
      fishingState.ropeSwingDirection = -1;
      fishingState.ropeSwingSpeed = 0.05;
    } else if (mouseX > centerX + 50) {
      fishingState.ropeSwingDirection = 1;
      fishingState.ropeSwingSpeed = 0.05;
    } else {
      fishingState.ropeSwingSpeed = 0.03;
    }
  });

  // 触摸控制
  canvas.addEventListener('touchmove', (e) => {
    if (fishingState.isCasting || fishingState.isReeling) return;
    e.preventDefault();

    const rect = canvas.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    const centerX = canvas.width / 2;

    if (touchX < centerX - 50) {
      fishingState.ropeSwingDirection = -1;
      fishingState.ropeSwingSpeed = 0.05;
    } else if (touchX > centerX + 50) {
      fishingState.ropeSwingDirection = 1;
      fishingState.ropeSwingSpeed = 0.05;
    } else {
      fishingState.ropeSwingSpeed = 0.03;
    }
  });

  // 键盘控制
  document.addEventListener('keydown', (e) => {
    if (fishingState.isCasting || fishingState.isReeling) return;
    if (document.activeElement.tagName === 'TEXTAREA') return;

    if (e.key === 'ArrowLeft' || e.key === 'a') {
      fishingState.ropeSwingDirection = -1;
      fishingState.ropeSwingSpeed = 0.06;
    } else if (e.key === 'ArrowRight' || e.key === 'd') {
      fishingState.ropeSwingDirection = 1;
      fishingState.ropeSwingSpeed = 0.06;
    }
  });

  document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'ArrowRight' || e.key === 'd') {
      fishingState.ropeSwingSpeed = 0.03;
    }
  });
}

function initFishes() {
  fishingState.fishes = [];
  const canvas = fishingState.canvas;
  if (!canvas) return;

  // 在水面以下区域生成鱼
  for (let i = 0; i < 12; i++) {
    const fish = fishTypes[Math.floor(Math.random() * fishTypes.length)];
    fishingState.fishes.push({
      ...fish,
      x: 100 + Math.random() * (canvas.width - 200),
      y: 180 + Math.random() * 280,
      size: 25 + Math.random() * 15,
      speedX: (Math.random() - 0.5) * 2,
      speedY: (Math.random() - 0.5) * 0.5,
      direction: Math.random() > 0.5 ? 1 : -1,
      bobOffset: Math.random() * Math.PI * 2
    });
  }
}

function startRopeSwing() {
  // rope 摆动动画
  function swing() {
    if (!fishingState.isCasting && !fishingState.isReeling) {
      fishingState.ropeAngle += fishingState.ropeSwingSpeed * fishingState.ropeSwingDirection;

      // 限制摆动角度
      const maxAngle = Math.PI / 3; // 60度
      if (fishingState.ropeAngle > maxAngle) {
        fishingState.ropeAngle = maxAngle;
        fishingState.ropeSwingDirection = -1;
      } else if (fishingState.ropeAngle < -maxAngle) {
        fishingState.ropeAngle = -maxAngle;
        fishingState.ropeSwingDirection = 1;
      }
    }

    requestAnimationFrame(swing);
  }
  swing();
}

function startCasting() {
  if (fishingState.isCasting || fishingState.isReeling) return;

  fishingState.isCasting = true;
  fishingState.isReeling = false;
  fishingState.ropeLength = 30;
  fishingState.caughtFish = null;

  const castBtn = document.getElementById('cast-btn');
  const reelBtn = document.getElementById('reel-btn');
  if (castBtn) castBtn.disabled = true;
  if (reelBtn) reelBtn.disabled = false;
}

function startReeling() {
  if (!fishingState.isCasting && fishingState.ropeLength <= 30) return;

  fishingState.isCasting = false;
  fishingState.isReeling = true;

  const castBtn = document.getElementById('cast-btn');
  const reelBtn = document.getElementById('reel-btn');
  if (castBtn) castBtn.disabled = true;
  if (reelBtn) reelBtn.disabled = false;
}

function startGameTimer() {
  if (fishingState.timerInterval) return;

  fishingState.timerInterval = setInterval(() => {
    fishingState.totalTime++;
    updateFishingTimer();
  }, 1000);
}

function updateFishingTimer() {
  const timerEl = document.getElementById('fishing-timer');
  if (!timerEl) return;

  const minutes = Math.floor(fishingState.totalTime / 60);
  const seconds = fishingState.totalTime % 60;
  timerEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function gameLoop() {
  const canvas = fishingState.canvas;
  const ctx = fishingState.ctx;

  // 如果canvas无效或尺寸为0，跳过这次绘制
  if (!canvas || !ctx || canvas.width <= 0 || canvas.height <= 0) {
    requestAnimationFrame(gameLoop);
    return;
  }

  // 检查页面是否可见
  const fishingPage = document.getElementById('fishing-page');
  if (!fishingPage || !fishingPage.classList.contains('active')) {
    requestAnimationFrame(gameLoop);
    return;
  }

  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 绘制背景
  drawFishingBackground(ctx, canvas);

  // 更新 rope 长度
  if (fishingState.isCasting) {
    fishingState.ropeLength += fishingState.ropeSpeed;
    if (fishingState.ropeLength >= fishingState.maxRopeLength) {
      fishingState.isCasting = false;
      fishingState.isReeling = true;
    }
  } else if (fishingState.isReeling) {
    fishingState.ropeLength -= fishingState.ropeSpeed * 2;
    if (fishingState.ropeLength <= 30) {
      fishingState.ropeLength = 30;
      fishingState.isReeling = false;

      // 重置按钮状态
      const castBtn = document.getElementById('cast-btn');
      const reelBtn = document.getElementById('reel-btn');
      if (castBtn) castBtn.disabled = false;
      if (reelBtn) reelBtn.disabled = true;

      // 如果钓到鱼，显示消息
      if (fishingState.caughtFish) {
        showToast(`钓到了 ${fishingState.caughtFish.emoji} ${fishingState.caughtFish.name}！`);
        addCaughtFishToList(fishingState.caughtFish);
        fishingState.caughtFish = null;
      }
    }
  }

  // 计算鱼钩位置
  const centerX = canvas.width / 2;
  const centerY = 50;
  fishingState.hookX = centerX + Math.sin(fishingState.ropeAngle) * fishingState.ropeLength;
  fishingState.hookY = centerY + Math.cos(fishingState.ropeAngle) * fishingState.ropeLength;

  // 绘制 rope
  drawRope(ctx, centerX, centerY);

  // 绘制鱼钩
  drawHook(ctx);

  // 更新和绘制鱼
  updateAndDrawFishes(ctx, canvas);

  // 检测碰撞
  checkFishCollision();

  requestAnimationFrame(gameLoop);
}

function drawFishingBackground(ctx, canvas) {
  // 天空渐变
  const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.35);
  skyGradient.addColorStop(0, '#87CEEB');
  skyGradient.addColorStop(0.5, '#B5D8EB');
  skyGradient.addColorStop(1, '#FFE4C4');
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height * 0.35);

  // 太阳
  ctx.save();
  const sunX = canvas.width * 0.8;
  const sunY = canvas.height * 0.12;
  const sunGradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 50);
  sunGradient.addColorStop(0, 'rgba(255, 247, 212, 1)');
  sunGradient.addColorStop(0.3, 'rgba(255, 215, 0, 0.8)');
  sunGradient.addColorStop(1, 'rgba(255, 165, 0, 0)');
  ctx.fillStyle = sunGradient;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 50, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 海面
  const seaGradient = ctx.createLinearGradient(0, canvas.height * 0.35, 0, canvas.height);
  seaGradient.addColorStop(0, '#4A90A4');
  seaGradient.addColorStop(0.5, '#3D7A8C');
  seaGradient.addColorStop(1, '#2E6B7A');
  ctx.fillStyle = seaGradient;
  ctx.fillRect(0, canvas.height * 0.35, canvas.width, canvas.height * 0.65);

  // 海面波光
  ctx.save();
  ctx.globalAlpha = 0.3;
  for (let i = 0; i < 20; i++) {
    const waveX = (Date.now() / 50 + i * 80) % (canvas.width + 100) - 50;
    const waveY = canvas.height * 0.35 + Math.sin(Date.now() / 500 + i) * 5;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(waveX, waveY, 30, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 渔船
  const boatX = canvas.width / 2;
  const boatY = canvas.height * 0.32;
  ctx.save();
  ctx.translate(boatX, boatY);
  ctx.rotate(Math.sin(Date.now() / 800) * 0.05);

  // 船身
  ctx.fillStyle = '#8B4513';
  ctx.beginPath();
  ctx.moveTo(-40, 0);
  ctx.quadraticCurveTo(-45, 15, 0, 18);
  ctx.quadraticCurveTo(45, 15, 40, 0);
  ctx.quadraticCurveTo(30, -5, 0, -5);
  ctx.quadraticCurveTo(-30, -5, -40, 0);
  ctx.fill();

  // 船桨/支架
  ctx.strokeStyle = '#6B3410';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, -5);
  ctx.lineTo(0, -45);
  ctx.stroke();

  // 滑轮
  ctx.fillStyle = '#A0522D';
  ctx.beginPath();
  ctx.arc(0, -45, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawRope(ctx, startX, startY) {
  ctx.save();
  ctx.strokeStyle = '#F5E6D3';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';

  // 绘制弯曲的 rope
  ctx.beginPath();
  ctx.moveTo(startX, startY);

  const endX = fishingState.hookX;
  const endY = fishingState.hookY;

  // 添加轻微的弧度
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2 + 10;

  ctx.quadraticCurveTo(midX, midY, endX, endY);
  ctx.stroke();

  // rope 发光效果
  ctx.shadowColor = 'rgba(245, 230, 211, 0.5)';
  ctx.shadowBlur = 5;
  ctx.stroke();

  ctx.restore();
}

function drawHook(ctx) {
  const x = fishingState.hookX;
  const y = fishingState.hookY;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(fishingState.ropeAngle);

  // 鱼钩
  ctx.strokeStyle = '#C0C0C0';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 15);
  ctx.quadraticCurveTo(0, 25, 10, 25);
  ctx.quadraticCurveTo(15, 25, 15, 20);
  ctx.quadraticCurveTo(15, 15, 10, 15);
  ctx.stroke();

  // 鱼钩发光
  ctx.shadowColor = 'rgba(192, 192, 192, 0.5)';
  ctx.shadowBlur = 8;

  // 饵料
  ctx.fillStyle = '#FF6B6B';
  ctx.beginPath();
  ctx.arc(0, 5, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function updateAndDrawFishes(ctx, canvas) {
  const time = Date.now() / 1000;

  fishingState.fishes.forEach((fish, index) => {
    // 更新位置 - 让鱼游得更自然
    fish.x += fish.speedX;
    fish.y += Math.sin(time + fish.bobOffset) * 0.5 + fish.speedY * 0.3;

    // 边界检测
    if (fish.x < 100 || fish.x > canvas.width - 100) {
      fish.speedX *= -1;
      fish.direction *= -1;
    }
    if (fish.y < 170 || fish.y > canvas.height - 100) {
      fish.speedY *= -1;
    }

    // 绘制 Emoji 鱼 - 每种鱼有不同的大小
    ctx.save();
    ctx.translate(fish.x, fish.y);

    // 根据鱼类型设置不同大小
    const baseSize = 40;
    const sizeScale = fish.size / 30;  // size原来范围25-45
    ctx.scale(fish.direction * sizeScale, sizeScale);

    // 发光效果
    ctx.shadowColor = 'rgba(255, 200, 100, 0.6)';
    ctx.shadowBlur = 20;

    // 绘制 emoji
    ctx.font = `${baseSize}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(fish.emoji, 0, 0);

    ctx.restore();

    // 如果被钓到，跟随鱼钩
    if (fishingState.caughtFish === fish) {
      fish.x = fishingState.hookX;
      fish.y = fishingState.hookY;
    }
  });
}

function checkFishCollision() {
  if (!fishingState.isCasting && !fishingState.isReeling) return;

  const hookX = fishingState.hookX;
  const hookY = fishingState.hookY;
  // 鱼钩的碰撞半径
  const hookRadius = 20;

  for (const fish of fishingState.fishes) {
    const dx = hookX - fish.x;
    const dy = hookY - fish.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 鱼的碰撞半径基于其大小
    const fishRadius = fish.size * 0.6;

    if (distance < hookRadius + fishRadius) {
      fishingState.caughtFish = fish;
      // 被抓住的鱼停止移动
      fish.speedX = 0;
      fish.speedY = 0;
      break;
    }
  }
}

function addCaughtFishToList(fish) {
  const container = document.getElementById('caught-fishes');
  if (!container) return;

  // 移除"没有鱼"的提示
  const noFish = container.querySelector('.no-fish');
  if (noFish) noFish.remove();

  // 更新计数
  state.fishCount++;
  const fishCountEl = document.getElementById('fish-count');
  if (fishCountEl) fishCountEl.textContent = state.fishCount;

  // 添加鱼到列表
  const fishItem = document.createElement('div');
  fishItem.className = 'caught-fish-item';
  fishItem.innerHTML = `
    <span class="fish-icon">${fish.emoji}</span>
    <span class="fish-message">${fish.message}</span>
  `;
  fishItem.title = `${fish.name}: ${fish.message}`;

  // 点击显示完整寄语
  fishItem.addEventListener('click', () => {
    showToast(`${fish.emoji} ${fish.name}: ${fish.message}`);
  });

  container.appendChild(fishItem);
}

// ============ 互助树洞 ============
function initTreeholePage() {
  const newPostBtn = document.getElementById('new-post-btn');
  const closeModalBtn = document.getElementById('close-modal');
  const submitPostBtn = document.getElementById('submit-post-btn');
  const postTextarea = document.getElementById('post-content');
  const postCountEl = document.getElementById('post-count');

  if (!newPostBtn) return;

  newPostBtn.addEventListener('click', () => {
    document.getElementById('post-modal')?.classList.add('active');
  });

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      document.getElementById('post-modal')?.classList.remove('active');
    });
  }

  if (postTextarea && postCountEl) {
    postTextarea.addEventListener('input', () => {
      postCountEl.textContent = postTextarea.value.length;
    });
  }

  if (submitPostBtn) {
    submitPostBtn.addEventListener('click', submitPost);
  }

  const modal = document.getElementById('post-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        modal.classList.remove('active');
      }
    });
  }

  renderPosts();
}

function submitPost() {
  const content = document.getElementById('post-content')?.value.trim();

  if (!content) {
    showToast('请写下你的故事~ 📝');
    return;
  }

  const post = {
    id: Date.now(),
    content: content,
    time: new Date().toLocaleString('zh-CN'),
    likes: 0,
    liked: false
  };

  state.posts.unshift(post);
  savePostsData();

  document.getElementById('post-content').value = '';
  document.getElementById('post-count').textContent = '0';
  document.getElementById('post-modal')?.classList.remove('active');

  renderPosts();
  showToast('你的故事已种下 🌱');
}

function renderPosts() {
  const listEl = document.getElementById('posts-list');
  const emptyEl = document.getElementById('post-empty');

  if (!listEl || !emptyEl) return;

  if (state.posts.length === 0) {
    emptyEl.style.display = 'block';
    listEl.innerHTML = '';
    return;
  }

  emptyEl.style.display = 'none';

  const avatars = ['🌸', '🌺', '🌻', '🌼', '🌷', '🍃', '🍀', '🪻', '🌱', '🪷'];

  listEl.innerHTML = state.posts.map(post => {
    const avatar = avatars[post.id % avatars.length];
    return `
      <div class="post-card" data-id="${post.id}">
        <div class="post-header">
          <div class="post-avatar">${avatar}</div>
          <div class="post-meta">
            <span class="post-time">${post.time}</span>
          </div>
        </div>
        <div class="post-content">${post.content}</div>
        <div class="post-actions">
          <button class="like-btn ${post.liked ? 'liked' : ''}" data-id="${post.id}">
            <span class="like-icon">💡</span>
            <span class="like-count">${post.likes}</span>
          </button>
        </div>
      </div>
    `;
  }).join('');

  listEl.querySelectorAll('.like-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      toggleLike(id);
    });
  });
}

function toggleLike(postId) {
  const post = state.posts.find(p => p.id === postId);
  if (!post) return;

  if (post.liked) {
    post.likes--;
    post.liked = false;
  } else {
    post.likes++;
    post.liked = true;
  }

  savePostsData();
  renderPosts();
}

// ============ 提示消息 ============
function showToast(message) {
  const toast = document.getElementById('toast');
  const messageEl = document.getElementById('toast-message');

  if (!toast || !messageEl) return;

  messageEl.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

// ============ CSS动画补充 ============
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;
document.head.appendChild(styleSheet);