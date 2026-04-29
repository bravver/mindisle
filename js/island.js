/* ==========================================
   汐岛 - 生理周期心理安慰模块
   根据女性生理周期提供温暖陪伴
   ========================================== */

// ============ 汐岛状态 ============
const islandState = {
  // 用户设置的周期信息
  lastPeriodDate: null,
  cycleLength: 28,
  periodLength: 5,

  // 当前周期阶段
  currentPhase: 'menstruation', // menstruation, follicular, ovulation, luteal

  // 各阶段数据
  phases: {
    menstruation: {
      name: '月经期',
      icon: '🌧️',
      weather: 'rainy',
      desc: '细雨绵绵，静谧自愈',
      shipStatus: '入港停泊',
      activities: ['🧘 轻柔瑜伽', '📔 记录心情', '☕ 热饮时光'],
      foods: ['🍫 热可可', '🍠 烤红薯', '🌿 花草茶']
    },
    follicular: {
      name: '卵泡期',
      icon: '🌅',
      weather: 'dawn',
      desc: '晨曦初现，活力复苏',
      shipStatus: '扬帆起航',
      activities: ['🏃 晨间运动', '📝 制定计划', '🍋 清新饮品'],
      foods: ['🍋 青柠薄荷', '🥗 轻盈沙拉', '🧃 鲜榨果汁']
    },
    ovulation: {
      name: '排卵日',
      icon: '☀️',
      weather: 'noon',
      desc: '正午盛夏，能量巅峰',
      shipStatus: '全速前进',
      activities: ['🏋️ 力量训练', '🎯 专注任务', '🦐 海鲜大餐'],
      foods: ['🦐 海鲜', '🥑 牛油果', '⚡ 能量补给']
    },
    luteal: {
      name: '黄体期',
      icon: '🌅',
      weather: 'dusk',
      desc: '黄昏时分，沉淀内敛',
      shipStatus: '迷雾巡航',
      activities: ['🚣 舒缓划船', '📖 阅读时光', '🍵 温热饮品'],
      foods: ['🍞 蜜糖吐司', '🥤 生姜汽水', '🍫 浓郁巧克力']
    }
  },

  // 情绪记录
  emotionRecords: [],

  // 航海日志
  shipLogs: [],

  // 是否已设置周期
  isSetup: false
};

// ============ 初始化 ============
function initIslandPage() {
  // 检查是否已设置周期
  const savedPhase = localStorage.getItem('island_phase_data');
  if (savedPhase) {
    const data = JSON.parse(savedPhase);
    islandState.lastPeriodDate = new Date(data.lastPeriodDate);
    islandState.cycleLength = data.cycleLength || 28;
    islandState.periodLength = data.periodLength || 5;
    islandState.isSetup = true;
    calculateCurrentPhase();
  }

  // 绑定登岛表单
  bindPeriodForm();

  // 渲染岛屿场景
  renderIslandScene();

  // 渲染功能模块
  renderIslandModules();

  // 如果已设置，显示岛屿主界面
  if (islandState.isSetup) {
    showIslandMain();
  }

  // 绑定模块点击
  bindModuleButtons();

  // 初始化浮潜区
  initDivingZone();
}

// ============ 周期计算 ============
function calculateCurrentPhase() {
  if (!islandState.lastPeriodDate) return;

  const now = new Date();
  const daysSincePeriod = Math.floor((now - islandState.lastPeriodDate) / (1000 * 60 * 60 * 24));
  const cyclePosition = daysSincePeriod % islandState.cycleLength;

  if (cyclePosition < islandState.periodLength) {
    islandState.currentPhase = 'menstruation';
  } else if (cyclePosition < islandState.periodLength + 7) {
    islandState.currentPhase = 'follicular';
  } else if (cyclePosition < islandState.periodLength + 10) {
    islandState.currentPhase = 'ovulation';
  } else {
    islandState.currentPhase = 'luteal';
  }
}

function savePhaseData() {
  const data = {
    lastPeriodDate: islandState.lastPeriodDate.toISOString(),
    cycleLength: islandState.cycleLength,
    periodLength: islandState.periodLength
  };
  localStorage.setItem('island_phase_data', JSON.stringify(data));
}

// ============ 登岛表单 ============
function bindPeriodForm() {
  const form = document.getElementById('period-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const dateInput = document.getElementById('period-date');
    const cycleInput = document.getElementById('cycle-length');
    const periodInput = document.getElementById('period-length');

    if (!dateInput.value) {
      showToast('请选择最近一次月经开始日期 🌸');
      return;
    }

    islandState.lastPeriodDate = new Date(dateInput.value);
    islandState.cycleLength = parseInt(cycleInput.value) || 28;
    islandState.periodLength = parseInt(periodInput.value) || 5;
    islandState.isSetup = true;

    savePhaseData();
    calculateCurrentPhase();

    showIslandMain();
    showToast('欢迎登岛！🌊 你的汐岛已准备就绪');
  });
}

// ============ 岛屿主界面 ============
function showIslandMain() {
  const welcome = document.getElementById('island-welcome');
  const islandScene = document.getElementById('island-scene');
  const islandModules = document.getElementById('island-modules');

  if (welcome) welcome.style.display = 'none';
  if (islandScene) islandScene.style.display = 'block';
  if (islandModules) islandModules.style.display = 'grid';

  renderIslandScene();
  startWeatherAnimation();
}

// ============ 渲染岛屿场景 ============
function renderIslandScene() {
  const scene = document.getElementById('island-scene');
  if (!scene) return;

  const phase = islandState.phases[islandState.currentPhase];
  const weatherContainer = scene.querySelector('.scene-weather');
  const cycleIndicator = scene.querySelector('.cycle-indicator');

  if (weatherContainer) {
    weatherContainer.className = `scene-weather ${phase.weather}`;
  }

  if (cycleIndicator) {
    cycleIndicator.innerHTML = `
      <span class="cycle-icon">${phase.icon}</span>
      <span class="cycle-name">${phase.name}</span>
      <span class="cycle-desc">${phase.desc}</span>
    `;
  }

  // 创建雨滴效果
  createRaindrops();

  // 创建雾气效果
  createMist();
}

// ============ 天气动画 ============
let weatherInterval;

function startWeatherAnimation() {
  if (weatherInterval) clearInterval(weatherInterval);

  const phase = islandState.phases[islandState.currentPhase];

  if (phase.weather === 'rainy') {
    startRainAnimation();
  } else if (phase.weather === 'dusk') {
    startMistAnimation();
  }
}

function createRaindrops() {
  const rainContainer = document.getElementById('rain-container');
  if (!rainContainer) return;

  rainContainer.innerHTML = '';

  for (let i = 0; i < 50; i++) {
    const drop = document.createElement('div');
    drop.className = 'raindrop';
    drop.style.left = `${Math.random() * 100}%`;
    drop.style.animationDelay = `${Math.random() * 2}s`;
    drop.style.animationDuration = `${0.5 + Math.random() * 0.5}s`;
    rainContainer.appendChild(drop);
  }
}

function startRainAnimation() {
  const rainContainer = document.getElementById('rain-container');
  if (rainContainer) rainContainer.classList.add('active');
}

function startMistAnimation() {
  const mistContainer = document.getElementById('mist-container');
  if (mistContainer) mistContainer.classList.add('active');
}

// ============ 渲染功能模块 ============
function renderIslandModules() {
  const modulesContainer = document.getElementById('island-modules');
  if (!modulesContainer) return;

  const modules = [
    { id: 'ship-module', icon: '⛵', name: '海船', desc: '记录工作与学习' },
    { id: 'gym-module', icon: '🏖️', name: '海边健身房', desc: '适合时期的运动' },
    { id: 'kitchen-module', icon: '🍳', name: '海边厨房', desc: '调养身体的美食' },
    { id: 'beach-module', icon: '🏝️', name: '情绪海滩', desc: '记录此刻心情' }
  ];

  modulesContainer.innerHTML = modules.map(m => `
    <div class="island-module" data-module="${m.id}">
      <span class="module-icon">${m.icon}</span>
      <span class="module-name">${m.name}</span>
      <span class="module-desc">${m.desc}</span>
    </div>
  `).join('');
}

// ============ 模块绑定 ============
function bindModuleButtons() {
  const modules = document.querySelectorAll('.island-module');
  modules.forEach(module => {
    module.addEventListener('click', () => {
      const moduleId = module.dataset.module;
      openIslandSubpage(moduleId);
    });
  });

  // 返回按钮
  const backBtn = document.querySelector('.island-back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', closeIslandSubpage);
  }
}

function openIslandSubpage(moduleId) {
  // 隐藏主界面
  document.getElementById('island-modules').style.display = 'none';
  document.getElementById('island-scene').style.display = 'none';

  // 显示子页面
  const subpages = document.querySelectorAll('.island-subpage');
  subpages.forEach(p => p.classList.remove('active'));

  // 模块ID映射到页面ID
  const pageIdMap = {
    'ship': 'ship-module-page',
    'gym': 'gym-module-page',
    'kitchen': 'kitchen-module-page',
    'beach': 'beach-module-page'
  };

  const targetPage = document.getElementById(pageIdMap[moduleId] || `${moduleId}-module-page`);
  if (targetPage) {
    targetPage.classList.add('active');
    targetPage.style.display = 'block';

    // 初始化对应模块
    switch(moduleId) {
      case 'ship': initShipModule(); break;
      case 'kitchen': initKitchenModule(); break;
      case 'beach': initBeachModule(); break;
      case 'gym': initGymModule(); break;
    }
  }
}

function closeIslandSubpage() {
  // 隐藏所有子页面
  const subpages = document.querySelectorAll('.island-subpage');
  subpages.forEach(p => {
    p.classList.remove('active');
    p.style.display = 'none';
  });

  // 显示主界面
  document.getElementById('island-modules').style.display = 'grid';
  document.getElementById('island-scene').style.display = 'block';
}

// ============ 海船模块 ============
function initShipModule() {
  const phase = islandState.phases[islandState.currentPhase];
  const ship = document.querySelector('.ship');

  if (ship) {
    // 根据周期设置船只状态
    ship.className = 'ship';
    if (islandState.currentPhase === 'menstruation') {
      ship.classList.add('docked');
    } else if (islandState.currentPhase === 'follicular') {
      ship.classList.add('sailing');
    } else if (islandState.currentPhase === 'luteal') {
      ship.classList.add('cruising');
    }
  }

  // 设置状态文本
  const statusEl = document.querySelector('.ship-status-text');
  if (statusEl) {
    statusEl.textContent = phase.shipStatus;
  }

  // 加载日志
  loadShipLogs();
}

function loadShipLogs() {
  const container = document.querySelector('.log-entries');
  if (!container) return;

  const logs = JSON.parse(localStorage.getItem('island_ship_logs') || '[]');
  islandState.shipLogs = logs;

  if (logs.length === 0) {
    container.innerHTML = '<p style="color: var(--color-text-secondary); text-align: center; padding: 20px;">还没有航海日志，快写下第一笔吧~</p>';
    return;
  }

  container.innerHTML = logs.map(log => `
    <div class="log-entry">
      <div class="entry-date">${log.date}</div>
      <div class="entry-text">${log.text}</div>
    </div>
  `).join('');
}

function saveShipLog() {
  const textarea = document.querySelector('.log-input textarea');
  if (!textarea || !textarea.value.trim()) {
    showToast('请写下你的航海日志~ 📝');
    return;
  }

  const log = {
    date: new Date().toLocaleDateString('zh-CN'),
    text: textarea.value.trim(),
    phase: islandState.currentPhase
  };

  islandState.shipLogs.unshift(log);
  localStorage.setItem('island_ship_logs', JSON.stringify(islandState.shipLogs));

  textarea.value = '';
  loadShipLogs();
  showToast('航海日志已记录 ✨');
}

// ============ 海边厨房模块 ============
function initKitchenModule() {
  const phase = islandState.phases[islandState.currentPhase];
  const kitchenScene = document.querySelector('.kitchen-scene');

  if (kitchenScene) {
    kitchenScene.className = `kitchen-scene ${phase.weather}`;
  }

  // 设置厨房标题
  const title = document.querySelector('.kitchen-title');
  if (title) {
    title.textContent = `${phase.icon} ${phase.name}的海边厨房`;
  }

  // 设置食物项目
  const itemsContainer = document.querySelector('.kitchen-items');
  if (itemsContainer) {
    itemsContainer.innerHTML = phase.foods.map(food => `
      <div class="kitchen-item" onclick="showKitchenTip('${food}')">
        <span class="item-icon">${food}</span>
        <span class="item-name">${getFoodName(food)}</span>
      </div>
    `).join('');
  }
}

function getFoodName(food) {
  const names = {
    '🍫': '热可可',
    '🍠': '烤红薯',
    '🌿': '花草茶',
    '🍋': '青柠薄荷',
    '🥗': '轻盈沙拉',
    '🧃': '鲜榨果汁',
    '🦐': '海鲜',
    '🥑': '牛油果',
    '⚡': '能量补给',
    '🍞': '蜜糖吐司',
    '🥤': '生姜汽水',
    '🍫': '浓郁巧克力'
  };
  return names[food] || '神秘美食';
}

function showKitchenTip(food) {
  const tips = {
    '🍫': '热可可含有黄酮醇，有助于改善心情和促进血液循环。在这特殊的日子里，给自己一份温暖的慰藉。',
    '🍠': '红薯富含膳食纤维和维生素B6，有助于稳定情绪。用余温烘烤，保留最纯粹的味道。',
    '🌿': '洋甘菊茶具有镇静作用，可以帮助缓解焦虑和失眠，让身心得到放松。',
    '🍋': '清新的青柠可以提神醒脑，薄荷的清凉感能带来舒适与活力。',
    '🥗': '新鲜的沙拉富含维生素和矿物质，为身体提供轻盈的能量来源。',
    '🧃': '新鲜果汁富含维生素C，可以增强免疫力，让肌肤焕发光彩。',
    '🦐': '海鲜富含Omega-3脂肪酸，对大脑健康有益，让你保持清晰的思维。',
    '🥑': '牛油果含有健康的单不饱和脂肪，有助于维持稳定的能量水平。',
    '⚡': '在能量高峰期，选择健康的能量补给，让身心保持最佳状态。',
    '🍞': '全麦吐司搭配蜂蜜，温和抚平黄体期的躁动，带来满足感。',
    '🥤': '生姜可以暖身驱寒，气泡水带来清爽的口感，是黄体期的好伴侣。',
    '🍫': '浓郁巧克力含有色氨酸，可以促进血清素分泌，让你感到幸福和满足。'
  };

  const tip = tips[food] || '这道美食能为你的身体提供温暖的滋养~';
  showToast(tip);
}

// ============ 情绪海滩模块 ============
function initBeachModule() {
  const phase = islandState.phases[islandState.currentPhase];
  const beachScene = document.querySelector('.beach-scene');

  if (beachScene) {
    beachScene.className = `beach-scene ${phase.weather}`;
  }

  // 设置收藏品样式
  updateEmotionCollection();
}

function selectEmotion(emotion) {
  // 移除其他选中状态
  document.querySelectorAll('.emotion-icon').forEach(icon => {
    icon.classList.remove('selected');
  });

  // 添加选中状态
  const target = document.querySelector(`[data-emotion="${emotion}"]`);
  if (target) {
    target.classList.add('selected');
  }
}

function saveEmotion() {
  const selectedEmotion = document.querySelector('.emotion-icon.selected');
  const textarea = document.querySelector('.emotion-input textarea');

  if (!selectedEmotion) {
    showToast('请先选择此刻的情绪 🌸');
    return;
  }

  const emotion = selectedEmotion.dataset.emotion;
  const text = textarea.value.trim();

  const record = {
    id: Date.now(),
    emotion: emotion,
    text: text,
    phase: islandState.currentPhase,
    date: new Date().toLocaleDateString('zh-CN')
  };

  islandState.emotionRecords.unshift(record);
  localStorage.setItem('island_emotions', JSON.stringify(islandState.emotionRecords));

  textarea.value = '';
  document.querySelectorAll('.emotion-icon').forEach(i => i.classList.remove('selected'));

  updateEmotionCollection();
  showToast('情绪已被温柔收藏 💫');
}

function updateEmotionCollection() {
  const container = document.querySelector('.collection-items');
  if (!container) return;

  const records = JSON.parse(localStorage.getItem('island_emotions') || '[]');
  islandState.emotionRecords = records;

  const phase = islandState.currentPhase;
  let pebbleCount = 0, shellCount = 0, pearlCount = 0, starfishCount = 0;

  records.forEach(r => {
    if (r.phase === 'menstruation') pebbleCount++;
    else if (r.phase === 'follicular') shellCount++;
    else if (r.phase === 'ovulation') pearlCount++;
    else if (r.phase === 'luteal') starfishCount++;
  });

  container.innerHTML = `
    <div class="collection-item pebble" data-type="pebble" data-count="${pebbleCount}" title="月经期收藏">🌧️</div>
    <div class="collection-item shell" data-type="shell" data-count="${shellCount}" title="卵泡期收藏">🐚</div>
    <div class="collection-item pearl" data-type="pearl" data-count="${pearlCount}" title="排卵期收藏">珍珠</div>
    <div class="collection-item starfish" data-type="starfish" data-count="${starfishCount}" title="黄体期收藏">🌟</div>
  `;

  // 绑定点击查看详情
  container.querySelectorAll('.collection-item').forEach(item => {
    item.addEventListener('click', () => {
      const type = item.dataset.type;
      showEmotionDetail(type);
    });
  });
}

function showEmotionDetail(type) {
  const records = islandState.emotionRecords.filter(r => {
    if (type === 'pebble') return r.phase === 'menstruation';
    if (type === 'shell') return r.phase === 'follicular';
    if (type === 'pearl') return r.phase === 'ovulation';
    if (type === 'starfish') return r.phase === 'luteal';
    return false;
  });

  if (records.length === 0) {
    showToast('这个时期还没有收藏哦~ 🌸');
    return;
  }

  const latest = records[0];
  const emotionNames = {
    happy: '开心',
    calm: '平静',
    anxious: '焦虑',
    sad: '难过',
    angry: '生气',
    lonely: '孤独'
  };

  const message = latest.text
    ? `${emotionNames[latest.emotion]}：${latest.text}`
    : `${emotionNames[latest.emotion]}`;

  showToast(message);
}

// ============ 健身房模块 ============
function initGymModule() {
  const phase = islandState.phases[islandState.currentPhase];
  const gymScene = document.querySelector('.gym-scene');

  if (gymScene) {
    gymScene.className = `gym-scene ${phase.weather}`;
  }

  const title = document.querySelector('.gym-title');
  if (title) {
    title.textContent = `${phase.icon} ${phase.name}的运动时光`;
  }
}

// ============ 浮潜区 ============
function initDivingZone() {
  const divingZone = document.querySelector('.diving-zone');
  if (!divingZone) return;

  // 创建气泡
  const bubbleContainer = divingZone.querySelector('.diving-bubbles');
  if (bubbleContainer) {
    bubbleContainer.innerHTML = '';
    for (let i = 0; i < 20; i++) {
      const bubble = document.createElement('div');
      bubble.className = 'bubble';
      bubble.style.left = `${Math.random() * 100}%`;
      bubble.style.width = `${5 + Math.random() * 15}px`;
      bubble.style.height = bubble.style.width;
      bubble.style.animationDelay = `${Math.random() * 8}s`;
      bubble.style.animationDuration = `${5 + Math.random() * 5}s`;
      bubbleContainer.appendChild(bubble);
    }
  }
}

// ============ 情绪提示 ============
const emotionTips = {
  menstruation: [
    '这段时间，给自己多一些包容和休息。🌸',
    '身体的疲惫是正常的，不需要强迫自己。💗',
    '温热的饮品和轻柔的伸展能带来舒适感。🍵'
  ],
  follicular: [
    '能量正在回升，可以开始一些新的计划！🌱',
    '这个阶段适合设定目标和开始行动。✨',
    '运动可以帮助释放逐渐增长的能量。🏃'
  ],
  ovulation: [
    '今天是能量巅峰日，适合挑战重要任务！⚡',
    '社交和表达都会特别顺畅。💬',
    '感受身体最旺盛的状态，尽情绽放！🌟'
  ],
  luteal: [
    '这是一个内省和沉淀的时期。🍂',
    '不需要强迫自己高效率，慢慢来。🌙',
    '整理和回顾会特别有收获。📝'
  ]
};

function getCurrentEmotionTip() {
  const tips = emotionTips[islandState.currentPhase];
  return tips[Math.floor(Math.random() * tips.length)];
}