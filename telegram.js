// Telegram Mini App Native SDK Bridge for ArDeVi Dojo
// Supports Telegram 7.0 - 8.0+ TMA APIs with seamless local browser fallbacks

class TelegramBridge {
  constructor() {
    this.tg = window.Telegram ? window.Telegram.WebApp : null;
    this.user = this.resolveUser();
    this.init();
  }

  init() {
    if (!this.tg) {
      console.log('Running outside Telegram WebView - fallback to localStorage mode');
      return;
    }

    try {
      this.tg.ready();
      this.tg.expand();

      // Disable vertical swipe to prevent closing while slashing bamboo (TMA 7.7+)
      if (this.tg.isVersionAtLeast && this.tg.isVersionAtLeast('7.7') && this.tg.disableVerticalSwipes) {
        this.tg.disableVerticalSwipes();
      }

      // Prevent accidental dismissal
      if (this.tg.enableClosingConfirmation) {
        this.tg.enableClosingConfirmation();
      }

      // Match native app chrome
      if (this.tg.setHeaderColor) {
        this.tg.setHeaderColor('#0a0b10');
      }
      if (this.tg.setBackgroundColor) {
        this.tg.setBackgroundColor('#0a0b10');
      }
    } catch (e) {
      console.warn('Telegram init error:', e);
    }
  }

  resolveUser() {
    if (this.tg && this.tg.initDataUnsafe && this.tg.initDataUnsafe.user) {
      const u = this.tg.initDataUnsafe.user;
      return {
        id: u.id,
        firstName: u.first_name || 'Самурай',
        lastName: u.last_name || '',
        username: u.username ? '@' + u.username : '',
        photoUrl: u.photo_url || '',
        languageCode: u.language_code || 'ru'
      };
    }
    // Fallback for desktop / standalone testing
    return {
      id: 8017428452,
      firstName: 'Самурай',
      lastName: 'Клана ArDeVi',
      username: '@ardevisupport',
      photoUrl: '',
      languageCode: 'ru'
    };
  }

  haptic(type = 'medium') {
    try {
      if (this.tg && this.tg.HapticFeedback) {
        if (['light', 'medium', 'heavy', 'rigid', 'soft'].includes(type)) {
          this.tg.HapticFeedback.impactOccurred(type);
        } else if (['error', 'success', 'warning'].includes(type)) {
          this.tg.HapticFeedback.notificationOccurred(type);
        } else if (type === 'selection') {
          this.tg.HapticFeedback.selectionChanged();
        }
      }
    } catch (e) {}
  }

  // CloudStorage with localStorage fallback
  async getStorage(key, defaultValue = null) {
    return new Promise((resolve) => {
      if (this.tg && this.tg.CloudStorage && this.tg.isVersionAtLeast && this.tg.isVersionAtLeast('6.9')) {
        this.tg.CloudStorage.getItem(key, (err, val) => {
          if (!err && val !== null && val !== undefined) {
            try {
              resolve(JSON.parse(val));
            } catch (e) {
              resolve(val);
            }
          } else {
            // Check localStorage
            const local = localStorage.getItem('ardevi_' + key);
            resolve(local ? JSON.parse(local) : defaultValue);
          }
        });
      } else {
        const local = localStorage.getItem('ardevi_' + key);
        resolve(local ? JSON.parse(local) : defaultValue);
      }
    });
  }

  async setStorage(key, value) {
    const serialized = JSON.stringify(value);
    localStorage.setItem('ardevi_' + key, serialized);

    return new Promise((resolve) => {
      if (this.tg && this.tg.CloudStorage && this.tg.isVersionAtLeast && this.tg.isVersionAtLeast('6.9')) {
        this.tg.CloudStorage.setItem(key, serialized, (err, saved) => {
          resolve(!err && saved);
        });
      } else {
        resolve(true);
      }
    });
  }

  openLink(url) {
    if (this.tg && this.tg.openTelegramLink && url.startsWith('https://t.me/')) {
      this.tg.openTelegramLink(url);
    } else if (this.tg && this.tg.openLink) {
      this.tg.openLink(url);
    } else {
      window.open(url, '_blank');
    }
  }

  // Native Telegram Stories Sharing (TMA 7.8+)
  shareStory(mediaUrl, text, widgetUrl) {
    if (this.tg && this.tg.isVersionAtLeast && this.tg.isVersionAtLeast('7.8') && this.tg.shareToStory) {
      this.tg.shareToStory(mediaUrl, {
        text: text,
        widget_link: {
          url: widgetUrl || 'https://t.me/ardevi_dojo_bot',
          name: '⚔️ Войти в Додзё ArDeVi'
        }
      });
      return true;
    }
    return false;
  }
}

window.tgBridge = new TelegramBridge();
