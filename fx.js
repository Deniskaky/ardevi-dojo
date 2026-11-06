// Visual Effects & Canvas Particle Engine for ArDeVi Dojo
// 60 FPS Sakura Petals, Sparks, and Katana Slash Trail

class DojoFX {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.petals = [];
    this.sparks = [];
    this.slashPoints = [];
    this.animId = null;
    this.isPaused = false;
    this.width = 0;
    this.height = 0;

    if (this.canvas) {
      this.resize();
      window.addEventListener('resize', () => this.resize());
      this.initPetals(28);
      this.loop();
    }
  }

  resize() {
    if (!this.canvas) return;
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  initPetals(count) {
    this.petals = [];
    for (let i = 0; i < count; i++) {
      this.petals.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        r: Math.random() * 4 + 3,
        d: Math.random() * count,
        angle: Math.random() * Math.PI * 2,
        speedX: Math.random() * 1.2 - 0.2,
        speedY: Math.random() * 0.8 + 0.6,
        rotSpeed: Math.random() * 0.02 - 0.01,
        alpha: Math.random() * 0.5 + 0.3
      });
    }
  }

  // Spawn fiery / golden sparks at x, y
  spawnSparks(x, y, count = 24) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      this.sparks.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3 + 1.5,
        color: Math.random() > 0.4 ? '#fde047' : '#f97316',
        life: 1.0,
        decay: Math.random() * 0.04 + 0.02
      });
    }
  }

  triggerSlashTrail(startX, startY, endX, endY) {
    const steps = 14;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const px = startX + (endX - startX) * t;
      const py = startY + (endY - startY) * t;
      this.slashPoints.push({ x: px, y: py, alpha: 1.0 });
    }
    this.spawnSparks((startX + endX) / 2, (startY + endY) / 2, 32);
  }

  loop() {
    if (!this.ctx || this.isPaused) return;

    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw and update Sakura Petals
    const isDark = document.body.classList.contains('theme-dark') || !document.body.classList.contains('theme-light');
    const petalColor = isDark ? 'rgba(255, 215, 230,' : 'rgba(230, 160, 180,';

    this.petals.forEach((p) => {
      p.angle += p.rotSpeed;
      p.x += Math.sin(p.angle) * 0.8 + p.speedX;
      p.y += p.speedY;

      if (p.y > this.height + 10) {
        p.y = -10;
        p.x = Math.random() * this.width;
      }
      if (p.x > this.width + 10) p.x = -10;
      if (p.x < -10) p.x = this.width + 10;

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.angle);
      this.ctx.fillStyle = petalColor + p.alpha + ')';
      this.ctx.beginPath();
      this.ctx.ellipse(0, 0, p.r * 1.5, p.r * 0.75, Math.PI / 4, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });

    // 2. Draw and update Sparks
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i];
      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.2; // gravity
      s.life -= s.decay;

      if (s.life <= 0) {
        this.sparks.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = s.life;
      this.ctx.fillStyle = s.color;
      this.ctx.shadowColor = '#fbbf24';
      this.ctx.shadowBlur = 6;
      this.ctx.beginPath();
      this.ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    // 3. Draw Katana Slash Blade Trail
    if (this.slashPoints.length > 1) {
      this.ctx.save();
      this.ctx.lineWidth = 4;
      this.ctx.lineCap = 'round';
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.shadowColor = '#facc15';
      this.ctx.shadowBlur = 14;

      this.ctx.beginPath();
      this.ctx.moveTo(this.slashPoints[0].x, this.slashPoints[0].y);
      for (let i = 1; i < this.slashPoints.length; i++) {
        this.ctx.lineTo(this.slashPoints[i].x, this.slashPoints[i].y);
      }
      this.ctx.stroke();
      this.ctx.restore();

      // Fade out trail
      this.slashPoints.forEach(p => p.alpha -= 0.15);
      if (this.slashPoints[0] && this.slashPoints[0].alpha <= 0) {
        this.slashPoints = [];
      }
    }

    this.animId = requestAnimationFrame(() => this.loop());
  }

  // Generate High-Res 1080x1920 Story Card for Telegram Stories
  generateStoryCanvas(quote, user, katanaName) {
    const c = document.createElement('canvas');
    c.width = 1080;
    c.height = 1920;
    const ctx = c.getContext('2d');

    // 1. Background (Sumi-e deep black lacquer & red gradient)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 1920);
    bgGrad.addColorStop(0, '#090a0f');
    bgGrad.addColorStop(0.5, '#121420');
    bgGrad.addColorStop(1, '#1a0d0d');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1920);

    // 2. Gold border frame
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 12;
    ctx.strokeRect(60, 60, 960, 1800);
    ctx.lineWidth = 2;
    ctx.strokeRect(76, 76, 928, 1768);

    // 3. Header
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 44px sans-serif';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '8px';
    ctx.fillText('⛩️ ДОДЗЁ ARDEVI • ПУТЬ ВОИНА', 540, 220);

    // 4. Large Kanji Stamp
    ctx.font = 'bold 140px serif';
    ctx.fillStyle = 'rgba(212, 175, 55, 0.25)';
    ctx.fillText(quote.kanji || '武士道', 540, 540);

    // 5. Quote Box
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 54px serif';
    const words = quote.quote.split(' ');
    let line = '', y = 780;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      if (ctx.measureText(testLine).width > 800 && n > 0) {
        ctx.fillText(line.trim(), 540, y);
        line = words[n] + ' ';
        y += 75;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), 540, y);

    // 6. Author
    ctx.fillStyle = '#e5b869';
    ctx.font = 'italic bold 42px sans-serif';
    ctx.fillText('— ' + quote.author + ' (' + quote.source + ')', 540, y + 110);

    // 7. Samurai Badge
    ctx.fillStyle = '#1e2230';
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(140, 1420, 800, 220, 28);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('САМУРАЙ: ' + user.firstName.toUpperCase(), 540, 1500);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '30px sans-serif';
    ctx.fillText('Клинок: ' + (katanaName || 'Тамахаганэ ArDeVi') + ' • Печать Клана', 540, 1565);

    // 8. Footer Callout
    ctx.fillStyle = '#9ca3af';
    ctx.font = '28px sans-serif';
    ctx.fillText('Рассеки порок дня в Telegram @ardevi_dojo_bot', 540, 1780);

    return c.toDataURL('image/png');
  }
}
