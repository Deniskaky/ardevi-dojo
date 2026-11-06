// ArDeVi Dojo • Core Mini App Engine

const BLADES = [
  { id: 0, name: 'Тамахаганэ ArDeVi', dmg: 350, title: 'Крестьянин', col: '#e5e7eb', stroke: '#d4af37' },
  { id: 1, name: 'Дамаск Клана', dmg: 620, title: 'Подмастерье', col: '#94a3b8', stroke: '#38bdf8' },
  { id: 2, name: 'Лазурный Дракон', dmg: 980, title: 'Самурай', col: '#38bdf8', stroke: '#0284c7' },
  { id: 3, name: 'Чёрное Солнце ArDeVi', dmg: 1650, title: 'Сёгун', col: '#f97316', stroke: '#dc2626' }
];

const ONI_BOSSES = [
  { name: 'Они Гордыни', emoji: '👹', maxHp: 35000, sin: 'Порок дня: Гордыня' },
  { name: 'Они Лени', emoji: '👺', maxHp: 28000, sin: 'Порок дня: Лень' },
  { name: 'Они Алчности', emoji: '🧌', maxHp: 42000, sin: 'Порок дня: Алчность' },
  { name: 'Они Гнева', emoji: '👿', maxHp: 38000, sin: 'Порок дня: Гнев' }
];

class DojoApp {
  constructor() {
    this.user = window.tgBridge.user;
    this.state = {
      coins: 350,
      spirit: 0,
      streak: 1,
      bladeIdx: 0,
      lastCutDate: '',
      lastRaidDate: '',
      raidHp: 22400,
      soundEnabled: true,
      theme: 'dark'
    };

    this.todayQuote = getTodayQuote();
    this.boss = ONI_BOSSES[new Date().getDay() % ONI_BOSSES.length];
    this.fx = null;
  }

  async init() {
    this.fx = new DojoFX('fxCanvas');

    // Load persisted state
    await this.loadState();

    // Render components
    this.renderTopBar();
    this.renderDailyQuote();
    this.renderRaidBoss();
    this.renderForge();
    this.renderLeaderboard();
    this.renderCodex();

    // Setup interactions
    this.bindEvents();

    console.log('⛩️ Додзё ArDeVi готово к тренировке воина!');
  }

  async loadState() {
    const saved = await window.tgBridge.getStorage('dojo_state');
    if (saved && typeof saved === 'object') {
      this.state = { ...this.state, ...saved };
    }

    // Check if new day for reset
    const todayStr = new Date().toISOString().slice(0, 10);
    if (this.state.lastCutDate && this.state.lastCutDate !== todayStr) {
      // Check if streak continued (yesterday)
      const last = new Date(this.state.lastCutDate);
      const diffDays = Math.floor((new Date() - last) / 86400000);
      if (diffDays === 1) {
        this.state.streak += 1;
      } else if (diffDays > 1) {
        this.state.streak = 1;
      }
    }
  }

  async saveState() {
    await window.tgBridge.setStorage('dojo_state', this.state);
  }

  renderTopBar() {
    const curBlade = BLADES[this.state.bladeIdx];
    document.getElementById('rankTitle').textContent = curBlade.title;
    document.getElementById('walletBalance').textContent = this.state.coins + ' Рё';
    document.getElementById('streakText').textContent = '🔥 ' + this.state.streak + ' дн.';

    const avatarInitial = document.getElementById('avatarInitial');
    const avatarImg = document.getElementById('avatarImg');
    if (this.user.photoUrl) {
      avatarImg.src = this.user.photoUrl;
      avatarImg.style.display = 'block';
      avatarInitial.style.display = 'none';
    } else {
      avatarInitial.textContent = (this.user.firstName || 'С')[0].toUpperCase();
    }
  }

  renderDailyQuote() {
    document.getElementById('swKanji').textContent = '💮 ' + this.todayQuote.kanji;
    document.getElementById('swQuote').textContent = '«' + this.todayQuote.quote + '»';
    document.getElementById('swAuthor').textContent = '— ' + this.todayQuote.author;
    document.getElementById('swSource').textContent = this.todayQuote.source + ' • Додзё ArDeVi';
    document.getElementById('swDutyText').textContent = this.todayQuote.duty;

    const todayStr = new Date().toISOString().slice(0, 10);
    const arena = document.getElementById('bambooArena');
    const dutyBtn = document.getElementById('dutyBtn');

    if (this.state.lastCutDate === todayStr) {
      arena.classList.add('sliced');
      dutyBtn.disabled = true;
      dutyBtn.innerHTML = '✅ ПРАКТИКА ВЫПОЛНЕНА • ЧЕСТЬ КЛАНА';
    }
  }

  renderRaidBoss() {
    document.getElementById('bossName').textContent = this.boss.name;
    document.getElementById('bossEmoji').textContent = this.boss.emoji;
    document.getElementById('bossSin').textContent = this.boss.sin;

    const curBlade = BLADES[this.state.bladeIdx];
    document.getElementById('myStrikeDmg').textContent = '+' + curBlade.dmg + ' DMG';

    const pct = Math.max(0, Math.min(100, Math.round((this.state.raidHp / this.boss.maxHp) * 100)));
    document.getElementById('hpBarFill').style.width = pct + '%';
    document.getElementById('hpBarVal').textContent = this.state.raidHp.toLocaleString() + ' / ' + this.boss.maxHp.toLocaleString() + ' HP';

    const todayStr = new Date().toISOString().slice(0, 10);
    const strikeBtn = document.getElementById('strikeBtn');
    if (this.state.lastRaidDate === todayStr) {
      strikeBtn.disabled = true;
      strikeBtn.innerHTML = '✅ УДАР НАНЕСЁН: +' + curBlade.dmg + ' DMG';
    }
  }

  renderForge() {
    const curBlade = BLADES[this.state.bladeIdx];
    document.getElementById('forgeBladeName').textContent = curBlade.name;
    document.getElementById('forgeBladeDmg').textContent = '+' + curBlade.dmg + ' DMG';
    document.getElementById('forgeBladeTitle').textContent = 'Титул: ' + curBlade.title;

    // Update SVG Blade Color
    const svgBlade = document.getElementById('svgBladePath');
    if (svgBlade) {
      svgBlade.setAttribute('fill', curBlade.col);
      svgBlade.setAttribute('stroke', curBlade.stroke);
    }

    const grid = document.getElementById('bladeGrid');
    grid.innerHTML = BLADES.map((b) => `
      <div class="blade-card ${b.id === this.state.bladeIdx ? 'selected' : ''}" onclick="window.dojoApp.selectBlade(${b.id})">
        <div class="bc-icon">🗡️</div>
        <div class="bc-name">${b.name}</div>
        <div class="bc-dmg">+${b.dmg} DMG</div>
      </div>
    `).join('');
  }

  renderLeaderboard() {
    const curBlade = BLADES[this.state.bladeIdx];
    const warriors = [
      { pos: '🥇', name: 'Кэнсэй Рэй', rank: 'Сёгун', dmg: 2150 },
      { pos: '🥈', name: 'Самурай Кэндзи', rank: 'Самурай', dmg: 1420 },
      { pos: '🥉', name: 'Ронин Тацу', rank: 'Самурай', dmg: 1280 },
      { pos: '4', name: 'Хиро Накамура', rank: 'Подмастерье', dmg: 890 },
      { pos: '5', name: this.user.firstName + ' (Вы)', rank: curBlade.title, dmg: (this.state.lastRaidDate ? curBlade.dmg : 0), me: true },
      { pos: '6', name: 'Дзиро Ямада', rank: 'Крестьянин', dmg: 350 },
      { pos: '7', name: 'Кадзуки Мори', rank: 'Крестьянин', dmg: 350 }
    ];

    const list = document.getElementById('lbList');
    list.innerHTML = warriors.map((w) => `
      <div class="lb-item ${w.me ? 'me' : ''}">
        <div class="lb-left">
          <span class="lb-pos">${w.pos}</span>
          <span class="lb-name">${w.name}</span>
          <span class="lb-rank">${w.rank}</span>
        </div>
        <span class="lb-dmg">+${w.dmg.toLocaleString()}</span>
      </div>
    `).join('');
  }

  renderCodex() {
    const grid = document.getElementById('codexGrid');
    grid.innerHTML = BUSHIDO_CODEX.map((c) => `
      <div class="codex-row">
        <div class="codex-kanji">${c.kanji}</div>
        <div>
          <div class="codex-title">${c.title} (${c.roma})</div>
          <div class="codex-desc">${c.desc}</div>
        </div>
      </div>
    `).join('');
  }

  // --- Actions ---

  sliceBamboo(event) {
    const arena = document.getElementById('bambooArena');
    if (arena.classList.contains('sliced')) return;

    window.dojoAudio.playSlash();
    window.tgBridge.haptic('heavy');

    arena.classList.add('slashing');

    // Trigger visual sparks and slash trail
    const rect = arena.getBoundingClientRect();
    const startX = rect.left + rect.width * 0.2;
    const startY = rect.top + rect.height * 0.3;
    const endX = rect.left + rect.width * 0.8;
    const endY = rect.top + rect.height * 0.7;
    this.fx.triggerSlashTrail(startX, startY, endX, endY);

    setTimeout(() => {
      window.dojoAudio.playClink();
      arena.classList.add('sliced');
      window.tgBridge.haptic('success');
    }, 180);
  }

  acceptDuty() {
    window.dojoAudio.playStamp();
    window.dojoAudio.playGong();
    window.tgBridge.haptic('success');

    const todayStr = new Date().toISOString().slice(0, 10);
    this.state.lastCutDate = todayStr;
    this.state.spirit += 50;
    this.state.coins += 100;

    const btn = document.getElementById('dutyBtn');
    btn.disabled = true;
    btn.innerHTML = '✅ ПРАКТИКА ВЫПОЛНЕНА • ЧЕСТЬ КЛАНА';

    this.renderTopBar();
    this.saveState();
  }

  strikeRaidBoss() {
    const todayStr = new Date().toISOString().slice(0, 10);
    if (this.state.lastRaidDate === todayStr) return;

    window.dojoAudio.playSlash();
    window.dojoAudio.playClink();
    window.tgBridge.haptic('heavy');

    const curBlade = BLADES[this.state.bladeIdx];
    this.state.lastRaidDate = todayStr;
    this.state.raidHp = Math.max(0, this.state.raidHp - curBlade.dmg);
    this.state.coins += 150;

    // Shake animation
    const emoji = document.getElementById('bossEmoji');
    emoji.classList.add('shaking');
    setTimeout(() => emoji.classList.remove('shaking'), 320);

    const btn = document.getElementById('strikeBtn');
    btn.disabled = true;
    btn.innerHTML = '✅ УДАР НАНЕСЁН: +' + curBlade.dmg + ' DMG';

    this.renderTopBar();
    this.renderRaidBoss();
    this.renderLeaderboard();
    this.saveState();
  }

  selectBlade(idx) {
    if (idx === this.state.bladeIdx) return;
    window.dojoAudio.playClink();
    window.tgBridge.haptic('medium');

    this.state.bladeIdx = idx;
    this.renderTopBar();
    this.renderForge();
    this.renderRaidBoss();
    this.renderLeaderboard();
    this.saveState();
  }

  switchTab(idx) {
    window.tgBridge.haptic('selection');
    document.querySelectorAll('.dock-item').forEach((d, i) => d.classList.toggle('active', i === idx));
    document.querySelectorAll('.view-section').forEach((v, i) => v.classList.toggle('active', i === idx));
  }

  toggleTheme() {
    window.tgBridge.haptic('light');
    const isLight = document.body.classList.toggle('theme-light');
    this.state.theme = isLight ? 'light' : 'dark';
    document.getElementById('themeBtn').textContent = isLight ? '☀️' : '🌓';
    this.saveState();
  }

  toggleSound() {
    const on = window.dojoAudio.toggle();
    window.tgBridge.haptic('light');
    document.getElementById('soundBtn').textContent = on ? '🔊' : '🔇';
  }

  shareWisdomStory() {
    window.tgBridge.haptic('medium');
    const curBlade = BLADES[this.state.bladeIdx];
    const dataUrl = this.fx.generateStoryCanvas(this.todayQuote, this.user, curBlade.name);

    // Try native shareToStory
    const shared = window.tgBridge.shareStory(dataUrl, `«${this.todayQuote.quote}» — ${this.todayQuote.author}`, 'https://t.me/ardevi_dojo_bot');

    if (!shared) {
      // Fallback share URL
      const text = `⚔️ Мудрость Бусидо дня из Додзё ArDeVi:\n\n«${this.todayQuote.quote}»\n— ${this.todayQuote.author} (${this.todayQuote.source})\n\nВступай в Додзё:`;
      const url = 'https://t.me/share/url?url=' + encodeURIComponent('https://t.me/ardevi_dojo_bot') + '&text=' + encodeURIComponent(text);
      window.tgBridge.openLink(url);
    }
  }

  bindEvents() {
    document.getElementById('bambooArena').addEventListener('click', (e) => this.sliceBamboo(e));
    document.getElementById('dutyBtn').addEventListener('click', () => this.acceptDuty());
    document.getElementById('strikeBtn').addEventListener('click', () => this.strikeRaidBoss());
    document.getElementById('soundBtn').addEventListener('click', () => this.toggleSound());
    document.getElementById('themeBtn').addEventListener('click', () => this.toggleTheme());
    document.getElementById('shareStoryBtn').addEventListener('click', () => this.shareWisdomStory());
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.dojoApp = new DojoApp();
  window.dojoApp.init();
});
