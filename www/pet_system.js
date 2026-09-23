/**
 * Plan4U - Maine Coon Cozy Companion (Tamagotchi) System
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.MaineCoonPetSystem = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

class MaineCoonPetSystem {
  constructor(app) {
    this.app = app;
    this.audioCtx = null;
    this.quotesIndex = 0;
    this.isPurring = false;
    this.isEating = false;

    this.defaultData = {
      name: 'Мейни',
      color: 'ginger', // 'ginger' | 'silver' | 'mocha' | 'midnight'
      level: 1,
      xp: 20,
      xpToNext: 100,
      hunger: 80, // 0..100
      happiness: 85, // 0..100
      treats: 3, // Starter fish treats
      goldenTreats: 1, // Starter golden treat
      equippedAccessory: 'none', // 'none' | 'glasses' | 'scarf' | 'bowtie' | 'crown' | 'flower'
      unlockedAccessories: ['none', 'glasses', 'scarf', 'bowtie', 'crown', 'flower'],
      lastSaved: Date.now()
    };

    this.data = { ...this.defaultData };
  }

  async init() {
    await this.loadData();
    this.applyTimeDecay();
    this.initElements();
    this.initEventListeners();
    this.preloadAudio();
    this.renderMiniCompanion();
    this.renderFullModal();
    this.startIdleQuotesCycle();
    this.startDecayInterval();
  }

  // Preload purr audio in memory to eliminate play latency/stutter
  preloadAudio() {
    try {
      if (!this.purrAudioElement) {
        this.purrAudioElement = new Audio('assets/purr.wav');
        this.purrAudioElement.preload = 'auto';
        this.purrAudioElement.volume = 0.5;
      }
    } catch (e) { }
  }

  // Periodic natural decay (every 60s)
  startDecayInterval() {
    setInterval(() => {
      this.applyTimeDecay();
      this.updateGaugeUI();
      this.renderMiniCompanion();
    }, 60000);
  }

  // Natural needs decay across real-world time (exactly drops from 100% to 10% in 12 hours: 7.5%/hour)
  applyTimeDecay() {
    const now = Date.now();
    const last = this.data.lastSaved || now;
    const elapsedHours = (now - last) / (1000 * 60 * 60);

    if (elapsedHours > 0.016) { // ~1 min elapsed
      const hungerLoss = elapsedHours * 7.5; // 90% in 12 hours (100% -> 10%)
      const happyLoss = elapsedHours * 7.5; // 90% in 12 hours (100% -> 10%)

      this.data.hunger = Math.max(10, Math.min(100, Math.round((this.data.hunger - hungerLoss) * 10) / 10));
      this.data.happiness = Math.max(10, Math.min(100, Math.round((this.data.happiness - happyLoss) * 10) / 10));
      this.data.lastSaved = now;
      this.saveData(true);
    }
  }

  // Audio Player for natural cozy purr (plays pristine assets/purr.wav) and long rhythmic vibration in rhythm
  playPurr() {
    // 1. Long rhythmic vibration in sync with cat's purr beat (total ~2.8s)
    this.triggerPurrVibration();

    if (this.app?.settings?.soundEnabled === false) return;
    try {
      if (!this.purrAudioElement) {
        this.preloadAudio();
      }
      if (this.purrAudioElement) {
        this.purrAudioElement.currentTime = 0;
        const playPromise = this.purrAudioElement.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => { });
        }
      }
    } catch (e) { }
  }

  // Feline purring vibration rhythm (long wave with rhythmic vibration pulses in sync with purr cycles)
  triggerPurrVibration() {
    try {
      const purrVibePattern = [
        180, 50, 200, 60, 220, 60, 200, 50, 180, 70,
        190, 50, 210, 60, 240, 60, 210, 50, 190, 70,
        180, 50, 200, 60, 220, 60, 180
      ];
      triggerHaptic(purrVibePattern);
    } catch (e) { }
  }

  // Load and save state with debounced asynchronous I/O
  async loadData() {
    try {
      const saved = localStorage.getItem('plan4u_pet_data') || localStorage.getItem('todo_notebook_pet_companion');
      if (saved) {
        this.data = { ...this.defaultData, ...JSON.parse(saved) };
      } else if (window.Plan4UStorage) {
        const fileData = await Plan4UStorage.loadFile('pet.json', null);
        if (fileData) {
          this.data = { ...this.defaultData, ...fileData };
        }
      }
    } catch (e) {
      console.warn('Error loading pet data:', e);
    }
  }

  saveData(debounced = false) {
    if (debounced) {
      clearTimeout(this._savePetDebounceTimer);
      this._savePetDebounceTimer = setTimeout(() => {
        this.flushSaveData();
      }, 500);
      return;
    }
    this.flushSaveData();
  }

  flushSaveData() {
    clearTimeout(this._savePetDebounceTimer);
    try {
      this.data.lastSaved = Date.now();
      const jsonStr = JSON.stringify(this.data);
      localStorage.setItem('plan4u_pet_data', jsonStr);
      localStorage.setItem('todo_notebook_pet_companion', jsonStr);
      if (window.Plan4UStorage) {
        Plan4UStorage.saveFile('pet.json', this.data);
      }
    } catch (e) {
      console.warn('Error saving pet data:', e);
    }
  }

  // Pet state export snapshot
  getPetSnapshot() {
    return JSON.parse(JSON.stringify(this.data || this.defaultData));
  }

  // Restore pet state from snapshot
  restorePetData(petData) {
    if (!petData || typeof petData !== 'object') return;
    this.data = { ...this.defaultData, ...petData };
    this.flushSaveData();
    this._renderedStageKey = null;
    this._renderedMiniColor = null;
    this.renderMiniCompanion();
    this.updateGaugeUI();
  }

  initElements() {
    this.petAnchor = document.getElementById('notebookPetAnchor');
    this.petMiniAvatar = document.getElementById('petMiniAvatar');
    this.petMiniTreatsCount = document.getElementById('petMiniTreatsCount');
    this.petMiniSpeech = document.getElementById('petMiniSpeech');
    this.petMiniSpeechText = document.getElementById('petMiniSpeechText');

    this.petModalBackdrop = document.getElementById('petModalBackdrop');
    this.petModalCloseBtn = document.getElementById('petModalCloseBtn');
    this.petModalDoneBtn = document.getElementById('petModalDoneBtn');

    this.petModalNameTitle = document.getElementById('petModalNameTitle');
    this.btnPetRename = document.getElementById('btnPetRename');
    this.petLevelBadge = document.getElementById('petLevelBadge');
    this.petXpBarFill = document.getElementById('petXpBarFill');
    this.petXpText = document.getElementById('petXpText');

    this.petInteractiveStage = document.getElementById('petInteractiveStage');
    this.petSettingsGearBtn = document.getElementById('petSettingsGearBtn');
    this.petSettingsPopup = document.getElementById('petSettingsPopup');
    this.petPopupCloseBtn = document.getElementById('petPopupCloseBtn');

    this.petThoughtBubble = document.getElementById('petThoughtBubble');
    this.petThoughtText = document.getElementById('petThoughtText');
    this.petCharacterStage = document.getElementById('petCharacterStage');
    this.petParticlesLayer = document.getElementById('petParticlesLayer');

    this.petHungerStatus = document.getElementById('petHungerStatus');
    this.petHungerBarFill = document.getElementById('petHungerBarFill');
    this.petHungerVal = document.getElementById('petHungerVal');

    this.petHappinessStatus = document.getElementById('petHappinessStatus');
    this.petHappinessBarFill = document.getElementById('petHappinessBarFill');
    this.petHappinessVal = document.getElementById('petHappinessVal');

    this.btnPetFeed = document.getElementById('btnPetFeed');
    this.btnPetGoldenFeed = document.getElementById('btnPetGoldenFeed');
    this.petFishCountLabel = document.getElementById('petFishCountLabel');
    this.petGoldenCountLabel = document.getElementById('petGoldenCountLabel');
  }

  initEventListeners() {
    // 1. Mini companion click on notebook sheet -> Open Modal
    if (this.petAnchor) {
      this.petAnchor.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        triggerHaptic(20);
        this.playPurr();
        this.openPetModal();
      });
    }

    // 2. Modal Close
    if (this.petModalCloseBtn) {
      this.petModalCloseBtn.addEventListener('click', () => this.closePetModal());
    }
    if (this.petModalDoneBtn) {
      this.petModalDoneBtn.addEventListener('click', () => this.closePetModal());
    }
    if (this.petModalBackdrop) {
      let startedOnPetBackdrop = false;
      this.petModalBackdrop.addEventListener('pointerdown', (e) => {
        startedOnPetBackdrop = (e.target === this.petModalBackdrop);
      });
      this.petModalBackdrop.addEventListener('click', (e) => {
        if (Date.now() - (this._petModalOpenedAt || 0) < 400) return;
        if (startedOnPetBackdrop && e.target === this.petModalBackdrop) {
          this.closePetModal();
        }
        startedOnPetBackdrop = false;
      });
    }

    // 3. Rename
    if (this.btnPetRename) {
      this.btnPetRename.addEventListener('click', () => this.renamePet());
    }

    // 4. Feed buttons
    if (this.btnPetFeed) {
      this.btnPetFeed.addEventListener('click', () => this.feedFish());
    }
    if (this.btnPetGoldenFeed) {
      this.btnPetGoldenFeed.addEventListener('click', () => this.feedGolden());
    }

    // 5. Gear button for coat color sub-menu / popup
    if (this.petSettingsGearBtn && this.petSettingsPopup) {
      this.petSettingsGearBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        triggerHaptic(15);
        this.petSettingsPopup.classList.toggle('show');
      });
    }

    if (this.petPopupCloseBtn && this.petSettingsPopup) {
      this.petPopupCloseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        triggerHaptic(10);
        this.petSettingsPopup.classList.remove('show');
      });
    }

    // Close popup on outside click
    document.addEventListener('pointerdown', (e) => {
      if (this.petSettingsPopup && this.petSettingsPopup.classList.contains('show')) {
        if (!this.petSettingsPopup.contains(e.target) && e.target !== this.petSettingsGearBtn && !this.petSettingsGearBtn?.contains(e.target)) {
          this.petSettingsPopup.classList.remove('show');
        }
      }
    });

    // Gauge click tester (toggles between 10% [sleeping/danger], 45% [warning], 100% [full])
    if (this.petHungerVal) {
      this.petHungerVal.style.cursor = 'pointer';
      this.petHungerVal.addEventListener('click', (e) => {
        e.stopPropagation();
        this.data.hunger = this.data.hunger <= 10 ? 45 : (this.data.hunger <= 45 ? 100 : 10);
        this.saveData();
        this.updateGaugeUI();
      });
    }
    if (this.petHappinessVal) {
      this.petHappinessVal.style.cursor = 'pointer';
      this.petHappinessVal.addEventListener('click', (e) => {
        e.stopPropagation();
        this.data.happiness = this.data.happiness <= 10 ? 45 : (this.data.happiness <= 45 ? 100 : 10);
        this.saveData();
        this.updateGaugeUI();
      });
    }

    // 6. Interactive Petting: ONLY when clicking/swiping directly on the cat (#petCharacterStage)
    if (this.petCharacterStage) {
      let isPetting = false;
      let lastPetTime = 0;

      const triggerPetAction = (clientX, clientY) => {
        const now = Date.now();
        if (now - lastPetTime < 220) return;
        lastPetTime = now;
        this.petCat(clientX, clientY);
      };

      this.petCharacterStage.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        isPetting = true;
        triggerPetAction(e.clientX, e.clientY);
      });

      this.petCharacterStage.addEventListener('pointermove', (e) => {
        if (isPetting) {
          triggerPetAction(e.clientX, e.clientY);
        }
      });

      window.addEventListener('pointerup', () => { isPetting = false; });
      window.addEventListener('pointercancel', () => { isPetting = false; });
    }

    // 7. Color Chips
    const colorChips = document.querySelectorAll('.pet-color-chip');
    colorChips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.stopPropagation();
        const color = chip.dataset.color;
        if (!color) return;
        triggerHaptic(15);
        colorChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        this.data.color = color;
        this.saveData();
        this.renderMiniCompanion();
        this.renderFullModal();
        this.playPurr();
        this.setThought(this.getLocalizedText('color_changed') || 'Мурр! 🐾✨');

        if (this.petSettingsPopup) {
          setTimeout(() => {
            this.petSettingsPopup.classList.remove('show');
          }, 350);
        }
      });
    });
  }

  openPetModal() {
    if (this.app) this.app.dismissActiveKeyboard();
    else if (document.activeElement && typeof document.activeElement.blur === 'function') document.activeElement.blur();
    if (!this.petModalBackdrop) return;

    this._petModalOpenedAt = Date.now();
    if (window.modalManager) {
      window.modalManager.open(this.petModalBackdrop, { haptic: 15 });
    } else {
      this.petModalBackdrop.classList.add('open');
      this.petModalBackdrop.setAttribute('aria-hidden', 'false');
    }

    this.renderFullModal();
    if (this.petSettingsPopup) {
      this.petSettingsPopup.classList.remove('show');
    }
  }

  closePetModal() {
    this.flushSaveData();
    if (this.petModalBackdrop) {
      if (window.modalManager) {
        window.modalManager.close(this.petModalBackdrop);
      } else {
        this.petModalBackdrop.classList.remove('open');
        this.petModalBackdrop.setAttribute('aria-hidden', 'true');
      }
    }
    if (this.petSettingsPopup) {
      this.petSettingsPopup.classList.remove('show');
    }
  }

  // Hook triggered when any task is completed in the notebook
  onTaskCompleted(task) {
    const isPriority = task && (task.priority === 'важный' || task.priority === 'очень важно');
    const isMaineQuest = task && (task.isMaineQuest || task.isSecretQuest);
    const xpGain = isMaineQuest ? 50 : (isPriority ? 30 : 10);
    const fishGain = isMaineQuest ? 1 : (isPriority ? 0 : 1);
    const goldenGain = (isMaineQuest || isPriority) ? 1 : 0;

    this.data.xp += xpGain;
    this.data.treats += fishGain;
    this.data.goldenTreats += goldenGain;
    this.data.hunger = Math.min(100, this.data.hunger + (isMaineQuest ? 8 : 4));
    this.data.happiness = Math.min(100, this.data.happiness + (isMaineQuest ? 15 : 5));

    // Spawn Flying Treat Animation
    this.spawnFlyingTreat((isPriority || isMaineQuest) ? '🥫' : '🟤');

    // Show Speech Bubble on Mini Companion (100% feline)
    const quotes = isMaineQuest
      ? ['МУРРР! 🥫🐾', 'Лапкой проверено! ✨', 'Мур-мур! Золото! 🥫', 'Мяу! Прелесть! 🐾💖']
      : (isPriority
        ? ['МУРРР! 🥫✨', 'Мяу-мяу! ⭐', 'Муррр! 🐾']
        : ['Мяу! 🟤', 'Мурр! 🐾', 'Мяу-мяу! ✨']);
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    this.showMiniSpeech(quote);

    this.checkLevelUp();
    this.saveData(true);
    this.renderMiniCompanion();
    this.renderFullModal();
  }

  // Flying Treat Visual Effect from screen to bottom anchor
  spawnFlyingTreat(icon = '🟤') {
    try {
      const anchorRect = this.petAnchor ? this.petAnchor.getBoundingClientRect() : null;
      const targetX = anchorRect ? anchorRect.left + 20 : window.innerWidth - 80;
      const targetY = anchorRect ? anchorRect.top + 20 : window.innerHeight - 80;

      const particle = document.createElement('div');
      particle.className = 'flying-treat-particle';
      particle.textContent = icon;
      particle.style.left = `${window.innerWidth / 2 - 15}px`;
      particle.style.top = `${window.innerHeight / 2 - 40}px`;
      particle.style.transform = 'scale(1.4)';
      document.body.appendChild(particle);

      requestAnimationFrame(() => {
        particle.style.transform = `translate(${targetX - (window.innerWidth / 2 - 15)}px, ${targetY - (window.innerHeight / 2 - 40)}px) scale(0.6)`;
        particle.style.opacity = '0.9';
      });

      setTimeout(() => {
        particle.remove();
        if (this.petAnchor) {
          this.petAnchor.style.transform = 'scale(1.22)';
          setTimeout(() => { this.petAnchor.style.transform = ''; }, 200);
        }
      }, 750);
    } catch (e) { }
  }

  showMiniSpeech(text) {
    if (!this.petMiniSpeech || !this.petMiniSpeechText) return;
    this.petMiniSpeechText.textContent = text;
    this.petMiniSpeech.classList.add('visible');
    clearTimeout(this._miniSpeechTimer);
    this._miniSpeechTimer = setTimeout(() => {
      this.petMiniSpeech.classList.remove('visible');
    }, 3200);
  }

  setThought(text) {
    if (this.petThoughtText) {
      this.petThoughtText.textContent = text;
    }
  }

  // Petting interaction
  petCat(clientX = null, clientY = null) {
    this.data.happiness = Math.min(100, this.data.happiness + 3);
    this.data.xp += 2;
    this.checkLevelUp();
    this.saveData(true);

    this.playPurr();
    triggerHaptic(20);

    // Visual Purr state on character
    if (this.petCharacterStage) {
      this.petCharacterStage.classList.add('purring');
      clearTimeout(this._purrTimer);
      this._purrTimer = setTimeout(() => {
        this.petCharacterStage.classList.remove('purring');
      }, 1200);
    }

    // Heart particles
    this.spawnHeartParticle(clientX, clientY);

    // 100% feline purr thoughts
    const purrThoughts = [
      'Муррррр... Мяу! 💖',
      'Мур-мур-мур... 🐾',
      'Мрррр... ✨',
      'Мяууу... Мурр! 💕',
      'Муррр-мяу! 🌸'
    ];
    this.setThought(purrThoughts[Math.floor(Math.random() * purrThoughts.length)]);
    this.updateGaugeUI();
  }

  spawnHeartParticle(clientX = null, clientY = null) {
    if (!this.petParticlesLayer) return;
    // Cap maximum active particles on stage to prevent DOM pileup
    if (this.petParticlesLayer.childElementCount > 6) {
      this.petParticlesLayer.firstElementChild?.remove();
    }

    const stageRect = this.petInteractiveStage.getBoundingClientRect();
    const x = clientX ? (clientX - stageRect.left) : (stageRect.width / 2);
    const y = clientY ? (clientY - stageRect.top) : (stageRect.height / 2);

    const heart = document.createElement('div');
    heart.className = 'pet-heart-particle';
    const emojis = ['💖', '✨', '🐾', '💕', '⭐'];
    heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    heart.style.left = `${Math.max(10, Math.min(stageRect.width - 30, x - 10))}px`;
    heart.style.top = `${Math.max(10, Math.min(stageRect.height - 30, y - 10))}px`;
    heart.style.setProperty('--rand-x', (Math.random() * 2 - 1).toFixed(2));

    this.petParticlesLayer.appendChild(heart);
    setTimeout(() => { heart.remove(); }, 1100);
  }

  // Animation: Flying treat from clicked button directly into cat's mouth
  animateFeedToMouth(sourceBtn, icon = '🟤') {
    try {
      if (!this.petCharacterStage) return;
      const btn = sourceBtn || this.btnPetFeed;
      const btnRect = btn ? btn.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight - 100, width: 40, height: 40 };
      const catRect = this.petCharacterStage.getBoundingClientRect();

      const startX = btnRect.left + btnRect.width / 2 - 15;
      const startY = btnRect.top + btnRect.height / 2 - 15;
      // Cat muzzle position in SVG center
      const targetX = catRect.left + catRect.width / 2 - 15;
      const targetY = catRect.top + catRect.height * 0.54 - 15;

      const item = document.createElement('div');
      item.className = 'flying-feed-item';
      item.textContent = icon;
      item.style.left = `${startX}px`;
      item.style.top = `${startY}px`;
      item.style.transform = 'scale(1.35) rotate(0deg)';
      document.body.appendChild(item);

      requestAnimationFrame(() => {
        item.style.transform = `translate(${targetX - startX}px, ${targetY - startY}px) scale(0.68) rotate(25deg)`;
      });

      setTimeout(() => {
        item.style.opacity = '0';
        setTimeout(() => item.remove(), 120);

        // Cat starts eating when the food reaches the mouth
        if (this.petCharacterStage) {
          this.petCharacterStage.classList.add('eating');
          this.playEatingSound();
          setTimeout(() => { this.petCharacterStage.classList.remove('eating'); }, 950);
        }

        // Crumb / sparkle effect around muzzle
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            this.spawnHeartParticle(targetX + 15, targetY + 15);
          }, i * 90);
        }
      }, 460);
    } catch (e) { }
  }

  // Play cute munching / "Ням-ням" sound with Web Audio API synthesis
  playEatingSound() {
    if (this.app?.settings?.soundEnabled === false) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = this.audioCtx || new AudioCtx();
      this.audioCtx = ctx;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Rhythmic sequence of cute "Nom-Nom-Nom" / "Ням-Ням" bites with crunch clicks
      const bites = [
        { time: 0.00, freqStart: 380, freqEnd: 240, dur: 0.12, crunchFreq: 950 },
        { time: 0.17, freqStart: 420, freqEnd: 260, dur: 0.13, crunchFreq: 1100 },
        { time: 0.35, freqStart: 460, freqEnd: 290, dur: 0.15, crunchFreq: 1250 }
      ];

      bites.forEach(bite => {
        const startTime = ctx.currentTime + bite.time;

        // 1. Tonal "Nom/Ням" mouth formant resonance
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(bite.freqStart, startTime);
        osc.frequency.exponentialRampToValueAtTime(bite.freqEnd, startTime + bite.dur);

        gain.gain.setValueAtTime(0.24, startTime);
        gain.gain.exponentialRampToValueAtTime(0.005, startTime + bite.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + bite.dur);

        // 2. Crisp food crunch/smack click
        const clickOsc = ctx.createOscillator();
        const clickGain = ctx.createGain();
        clickOsc.type = 'sine';
        clickOsc.frequency.setValueAtTime(bite.crunchFreq, startTime);
        clickOsc.frequency.exponentialRampToValueAtTime(140, startTime + 0.045);

        clickGain.gain.setValueAtTime(0.18, startTime);
        clickGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.045);

        clickOsc.connect(clickGain);
        clickGain.connect(ctx.destination);
        clickOsc.start(startTime);
        clickOsc.stop(startTime + 0.045);
      });

      // Synchronized munching vibration pulses
      triggerHaptic([25, 45, 25, 45, 30]);
    } catch (e) {
      console.warn('Eating audio error:', e);
    }
  }

  // Feeding action: Normal treat (Маленький коричневый камушек / сухой корм 🟤)
  // Feeding action: Normal treat (Маленький коричневый камушек / сухой корм 🟤)
  feedFish() {
    if (this.data.treats <= 0) {
      triggerHaptic([10, 40]);
      const msg = this.app.t('pet_no_brown_treats') || 'Нет камушков! Выполняйте дела в блокноте, чтобы заработать угощение 🟤';
      this.app.showToast(msg, '🟤');
      this.setThought('Мяу? 🥺🐾');
      return;
    }

    this.data.treats--;
    // Balanced for 5 pebbles a day (+15% each = +75% total)
    this.data.hunger = Math.min(100, Math.max(10, this.data.hunger + 15));
    this.data.happiness = Math.min(100, Math.max(10, this.data.happiness + 5));
    this.data.xp += 15;

    triggerHaptic([20, 30]);

    // Animate pebble flying from feed button to mouth
    this.animateFeedToMouth(this.btnPetFeed, '🟤');

    this.setThought('Хрум-хрум-хрум! Муррр! 🟤✨');
    this.checkLevelUp();
    this.saveData(true);
    this.renderMiniCompanion();
    this.renderFullModal();
  }

  // Feeding action: Golden gourmet canned treat 🥫 (+25% hunger + 50% happiness)
  feedGolden() {
    if (this.data.goldenTreats <= 0) {
      triggerHaptic([10, 40]);
      const msg = this.app.t('pet_no_golden_treats') || 'Нет золотых консервов! Закрывайте важные дела дня, чтобы заработать 🥫';
      this.app.showToast(msg, '🥫');
      this.setThought('Мррр? 🥺🥫');
      return;
    }

    this.data.goldenTreats--;
    this.data.hunger = Math.min(100, Math.max(10, this.data.hunger + 25));
    this.data.happiness = Math.min(100, Math.max(10, this.data.happiness + 50));
    this.data.xp += 50;

    triggerHaptic([30, 60, 30]);

    // Animate canned treat flying from golden feed button to mouth
    this.animateFeedToMouth(this.btnPetGoldenFeed, '🥫');

    this.setThought('Чав-чав-хрум! МУРРРР! 🥫✨');
    this.checkLevelUp();
    this.saveData(true);
    this.renderMiniCompanion();
    this.renderFullModal();
  }

  checkLevelUp() {
    if (this.data.xp >= this.data.xpToNext) {
      this.data.xp = this.data.xp - this.data.xpToNext;
      this.data.level++;
      this.data.xpToNext = Math.round(this.data.xpToNext * 1.45);

      triggerHaptic([40, 80, 40]);
      this.app.showToast(this.app.t('pet_level_up', { name: this.data.name, level: this.data.level }), '🏆');
      this.setThought(`МЯУ! Муррр-муррр! ⭐🐾`);
    }
  }

  renamePet() {
    const current = this.data.name || this.app.t('pet_default_name') || 'Мейни';
    const newName = prompt(this.app.t('pet_rename_prompt') || 'Введите имя для вашего котёнка-мейнкуна:', current);
    if (newName && newName.trim()) {
      this.data.name = newName.trim().slice(0, 20);
      this.saveData();
      this.renderFullModal();
      this.setThought(`Мяу! 💖`);
      triggerHaptic(20);
    }
  }

  // Periodic motivational quotes (100% feline sounds)
  startIdleQuotesCycle() {
    setInterval(() => {
      if (!this.petThoughtText) return;
      const isSleeping = (this.data.hunger <= 10 || this.data.happiness <= 10);
      if (isSleeping) {
        this.setThought('Хррр-пссс... 💤 (спит)');
        return;
      }
      const pool = [
        'Мур-мур-мур... 🐾',
        'Мяу! ✨',
        'Мрррр... 💕',
        'Мяу-мяу! 🌸',
        'Муррр... 🐾',
        'Мяяяу... 🌟',
        'Фррр-мяу! 🐱'
      ];
      this.quotesIndex = (this.quotesIndex + 1) % pool.length;
      this.setThought(pool[this.quotesIndex]);
    }, 18000);
  }

  updateXpUI() {
    if (this.petLevelBadge) this.petLevelBadge.textContent = `Ур. ${this.data.level}`;
    const xpPercent = Math.min(100, Math.round((this.data.xp / this.data.xpToNext) * 100));
    if (this.petXpBarFill) this.petXpBarFill.style.width = `${xpPercent}%`;
    if (this.petXpText) this.petXpText.textContent = `${this.data.xp} / ${this.data.xpToNext} XP`;
  }

  updateGaugeUI() {
    this.updateXpUI();

    // Never fall below 10%
    this.data.hunger = Math.max(10, Math.min(100, this.data.hunger));
    this.data.happiness = Math.max(10, Math.min(100, this.data.happiness));

    // 1. Hunger Gauge: Blue by default, warning at <60%, red danger at <30%
    if (this.petHungerBarFill) {
      this.petHungerBarFill.style.width = `${this.data.hunger}%`;
      this.petHungerBarFill.classList.toggle('warning', this.data.hunger < 60 && this.data.hunger >= 30);
      this.petHungerBarFill.classList.toggle('danger', this.data.hunger < 30);
    }
    if (this.petHungerVal) this.petHungerVal.textContent = `${this.data.hunger}%`;

    // 2. Happiness Gauge: Green by default, warning at <60%, red danger at <30%
    if (this.petHappinessBarFill) {
      this.petHappinessBarFill.style.width = `${this.data.happiness}%`;
      this.petHappinessBarFill.classList.toggle('warning', this.data.happiness < 60 && this.data.happiness >= 30);
      this.petHappinessBarFill.classList.toggle('danger', this.data.happiness < 30);
    }
    if (this.petHappinessVal) this.petHappinessVal.textContent = `${this.data.happiness}%`;

    // 3. Sleeping state when hunger or happiness drops to minimum (<= 10%)
    const isSleeping = this.data.hunger <= 10 || this.data.happiness <= 10;

    if (this.petHungerStatus) {
      if (isSleeping) this.petHungerStatus.textContent = this.app.t('pet_status_sleeping');
      else if (this.data.hunger >= 75) this.petHungerStatus.textContent = this.app.t('pet_status_full');
      else if (this.data.hunger >= 40) this.petHungerStatus.textContent = this.app.t('pet_status_hungry_mild');
      else this.petHungerStatus.textContent = this.app.t('pet_status_hungry_severe');
    }

    if (this.petHappinessStatus) {
      if (isSleeping) this.petHappinessStatus.textContent = this.app.t('pet_status_sleep_sound');
      else if (this.data.happiness >= 75) this.petHappinessStatus.textContent = this.app.t('pet_status_purring');
      else if (this.data.happiness >= 40) this.petHappinessStatus.textContent = this.app.t('pet_status_happy');
      else this.petHappinessStatus.textContent = this.app.t('pet_status_lonely');
    }

    // Toggle sleeping animation & SVG pose (with memoized rendering)
    const stageKey = `${this.data.color}_${isSleeping}`;
    if (this.petCharacterStage) {
      this.petCharacterStage.classList.toggle('is-sleeping', isSleeping);
      if (this._renderedStageKey !== stageKey) {
        this._renderedStageKey = stageKey;
        this.petCharacterStage.innerHTML = this.generateMaineCoonSVG(this.data.color, false, isSleeping);
      }
    }
  }

  renderMiniCompanion() {
    if (this.petMiniAvatar && this._renderedMiniColor !== this.data.color) {
      this._renderedMiniColor = this.data.color;
      this.petMiniAvatar.innerHTML = this.generateMaineCoonSVG(this.data.color, true);
    }
    const badge = document.getElementById('petMiniTreatsBadge');
    if (badge) {
      badge.style.display = (this.data.treats > 0) ? 'flex' : 'none';
    }
    if (this.petMiniTreatsCount) {
      this.petMiniTreatsCount.textContent = this.data.treats;
    }
  }

  renderFullModal() {
    if (this.petModalNameTitle) this.petModalNameTitle.textContent = this.data.name;
    if (this.petLevelBadge) this.petLevelBadge.textContent = this.app.t('pet_level_badge', { level: this.data.level });

    const xpPercent = Math.min(100, Math.round((this.data.xp / this.data.xpToNext) * 100));
    if (this.petXpBarFill) this.petXpBarFill.style.width = `${xpPercent}%`;
    if (this.petXpText) this.petXpText.textContent = `${this.data.xp} / ${this.data.xpToNext} XP`;

    const isSleeping = this.data.hunger <= 10 || this.data.happiness <= 10;
    const stageKey = `${this.data.color}_${isSleeping}`;
    if (this.petCharacterStage && this._renderedStageKey !== stageKey) {
      this._renderedStageKey = stageKey;
      this.petCharacterStage.innerHTML = this.generateMaineCoonSVG(this.data.color, false, isSleeping);
    }

    if (this.petFishCountLabel) {
      this.petFishCountLabel.textContent = this.app.t('pet_treat_count', { count: this.data.treats });
    }
    if (this.petGoldenCountLabel) {
      this.petGoldenCountLabel.textContent = this.app.t('pet_treat_count', { count: this.data.goldenTreats });
    }

    this.updateGaugeUI();

    // Sync active color chip
    const colorChips = document.querySelectorAll('.pet-color-chip');
    colorChips.forEach(chip => {
      chip.classList.toggle('active', chip.dataset.color === this.data.color);
    });
  }

  getLocalizedText(key) {
    const lang = this.app?.settings?.lang || 'ru';
    const dict = {
      ru: {
        no_fish: 'Нет камушков! Выполняйте дела в блокноте, чтобы заработать угощение 🟤',
        no_golden: 'Нет золотых консервов! Закрывайте важные дела дня, чтобы заработать 🥫',
        color_changed: 'Мурр! 🐾✨'
      },
      uk: {
        no_fish: 'Немає камінчиків! Виконуйте справи у блокноті, щоб заробити ласощі 🟤',
        no_golden: 'Немає золотих консервів! Закривайте важливі справи дня, щоб заробити 🥫',
        color_changed: 'Мурр! 🐾✨'
      },
      en: {
        no_fish: 'No little brown pebbles left! Complete tasks in your notebook to earn dry food 🟤',
        no_golden: 'No golden treats! Complete priority tasks of the day to earn 🥫',
        color_changed: 'Purr! 🐾✨'
      }
    };
    return (dict[lang] && dict[lang][key]) || dict.ru[key] || '';
  }

  /**
   * MAINE COON VECTOR SVG RENDERER
   * Highly detailed, cute, stylized Maine Coon with lynx ear tufts, bushy plume tail,
   * fluffy bib/mane, forehead tabby "M", and expressive feline eyes.
   */
  generateMaineCoonSVG(colorScheme = 'ginger', isMini = false, isSleeping = false) {
    const palettes = {
      ginger: {
        furMain: '#f97316',
        furGrad: '#c2410c',
        furLight: '#fed7aa',
        furDark: '#9a3412',
        bib: '#fffbeb',
        earInner: '#fbcfe8',
        earTuft: '#7c2d12',
        eyes: '#10b981',
        eyeHighlight: '#ffffff',
        nose: '#fb7185',
        markings: '#9a3412'
      },
      white: {
        furMain: '#ffffff',
        furGrad: '#e2e8f0',
        furLight: '#ffffff',
        furDark: '#94a3b8',
        bib: '#f8fafc',
        earInner: '#fed7e2',
        earTuft: '#cbd5e1',
        eyes: '#0284c7',
        eyeHighlight: '#ffffff',
        nose: '#fb7185',
        markings: '#cbd5e1'
      },
      tiger: {
        furMain: '#b45309',
        furGrad: '#78350f',
        furLight: '#fef3c7',
        furDark: '#451a03',
        bib: '#fefce8',
        earInner: '#fed7aa',
        earTuft: '#291102',
        eyes: '#16a34a',
        eyeHighlight: '#ffffff',
        nose: '#e11d48',
        markings: '#291102'
      },
      silver: {
        furMain: '#94a3b8',
        furGrad: '#475569',
        furLight: '#e2e8f0',
        furDark: '#334155',
        bib: '#ffffff',
        earInner: '#fce7f3',
        earTuft: '#1e293b',
        eyes: '#0284c7',
        eyeHighlight: '#ffffff',
        nose: '#f43f5e',
        markings: '#334155'
      },
      midnight: {
        furMain: '#1e293b',
        furGrad: '#0f172a',
        furLight: '#475569',
        furDark: '#020617',
        bib: '#334155',
        earInner: '#64748b',
        earTuft: '#020617',
        eyes: '#eab308',
        eyeHighlight: '#ffffff',
        nose: '#475569',
        markings: '#020617'
      },
      cream: {
        furMain: '#fed7aa',
        furGrad: '#fb923c',
        furLight: '#fff7ed',
        furDark: '#ea580c',
        bib: '#ffffff',
        earInner: '#fed7e2',
        earTuft: '#c2410c',
        eyes: '#14b8a6',
        eyeHighlight: '#ffffff',
        nose: '#f43f5e',
        markings: '#ea580c'
      },
      mocha: {
        furMain: '#78350f',
        furGrad: '#451a03',
        furLight: '#fef3c7',
        furDark: '#291102',
        bib: '#fef9c3',
        earInner: '#fed7aa',
        earTuft: '#1c0a00',
        eyes: '#f59e0b',
        eyeHighlight: '#ffffff',
        nose: '#be123c',
        markings: '#291102'
      },
      siamese: {
        furMain: '#fef3c7',
        furGrad: '#d97706',
        furLight: '#ffffff',
        furDark: '#451a03',
        bib: '#ffffff',
        earInner: '#fed7aa',
        earTuft: '#291102',
        eyes: '#0284c7',
        eyeHighlight: '#ffffff',
        nose: '#881337',
        markings: '#451a03'
      },
      calico: {
        furMain: '#ea580c',
        furGrad: '#1e293b',
        furLight: '#ffffff',
        furDark: '#0f172a',
        bib: '#ffffff',
        earInner: '#fbcfe8',
        earTuft: '#0f172a',
        eyes: '#10b981',
        eyeHighlight: '#ffffff',
        nose: '#fb7185',
        markings: '#0f172a'
      }
    };

    const p = palettes[colorScheme] || palettes.ginger;
    const uid = Math.random().toString(36).slice(2, 7);

    return `
      <svg viewBox="0 0 200 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="overflow: visible;">
        <defs>
          <linearGradient id="mcFurGrad_${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="${p.furMain}"/>
            <stop offset="100%" stop-color="${p.furGrad}"/>
          </linearGradient>
          <linearGradient id="mcBibGrad_${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="100%" stop-color="${p.bib}"/>
          </linearGradient>
          <linearGradient id="mcEyeGrad_${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="${p.eyes}"/>
            <stop offset="100%" stop-color="#064e3b"/>
          </linearGradient>
          <filter id="mcShadow_${uid}" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" flood-opacity="0.16"/>
          </filter>
        </defs>

        <!-- Shadow on Floor -->
        <ellipse cx="100" cy="184" rx="58" ry="10" fill="rgba(0,0,0,0.12)"/>

        <!-- 1. Fluffy Plume Maine Coon Tail (Normal upright position & sway in all states) -->
        <g class="mc-tail" style="filter: url(#mcShadow_${uid});">
          <path d="M56 160 C30 152, 6 128, 12 92 C16 68, 38 60, 48 76 C56 88, 44 116, 52 136 C56 146, 64 154, 70 162 Z" 
                fill="url(#mcFurGrad_${uid})" stroke="${p.furDark}" stroke-width="1.8" stroke-linejoin="round"/>
          <!-- Fluffy Tail Tufts -->
          <path d="M12 92 C2 108, 10 134, 30 148" stroke="${p.markings}" stroke-width="2.2" stroke-linecap="round" fill="none" opacity="0.65"/>
          <path d="M22 80 C26 94, 28 116, 42 130" stroke="${p.markings}" stroke-width="2.2" stroke-linecap="round" fill="none" opacity="0.65"/>
          <path d="M48 76 C42 88, 36 104, 46 118" stroke="${p.furLight}" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.75"/>
        </g>

        <!-- 2. Body Group -->
        <g class="mc-body-group">
          <!-- Back Paws & Hips -->
          <ellipse cx="64" cy="164" rx="22" ry="14" fill="url(#mcFurGrad_${uid})" stroke="${p.furDark}" stroke-width="1.6"/>
          <ellipse cx="136" cy="164" rx="22" ry="14" fill="url(#mcFurGrad_${uid})" stroke="${p.furDark}" stroke-width="1.6"/>

          <!-- Main Torso -->
          <path d="M68 120 C64 145, 68 174, 100 176 C132 174, 136 145, 132 120 C128 105, 72 105, 68 120 Z" 
                fill="url(#mcFurGrad_${uid})" stroke="${p.furDark}" stroke-width="1.8"/>

          <!-- Luxurious Fluffy Maine Coon Mane / Bib -->
          <path d="M72 114 C62 128, 66 146, 80 156 C88 162, 94 168, 100 172 C106 168, 112 162, 120 156 C134 146, 138 128, 128 114 C120 126, 108 132, 100 132 C92 132, 80 126, 72 114 Z" 
                fill="url(#mcBibGrad_${uid})" stroke="${p.furDark}" stroke-width="1.2"/>

          <!-- Fluffy fur layers on bib -->
          <path d="M84 126 C76 138, 86 148, 100 158 C114 148, 124 138, 116 126" stroke="${p.furLight}" stroke-width="1.8" fill="none" stroke-linecap="round"/>

          <!-- Front Paws -->
          <ellipse cx="86" cy="178" rx="10" ry="7" fill="${p.bib}" stroke="${p.furDark}" stroke-width="1.4"/>
          <ellipse cx="114" cy="178" rx="10" ry="7" fill="${p.bib}" stroke="${p.furDark}" stroke-width="1.4"/>
          <!-- Paw Claws/Toe Separators -->
          <path d="M83 176 L83 182 M89 176 L89 182" stroke="${p.furDark}" stroke-width="1.2" stroke-linecap="round"/>
          <path d="M111 176 L111 182 M117 176 L117 182" stroke="${p.furDark}" stroke-width="1.2" stroke-linecap="round"/>
        </g>

        <!-- 3. Head & Ears Group -->
        <g class="mc-head-group">
          <!-- Left Lynx Ear with Tuft -->
          <g class="mc-ear-tuft-left">
            <polygon points="56,84 66,32 94,68" fill="url(#mcFurGrad_${uid})" stroke="${p.furDark}" stroke-width="1.8"/>
            <polygon points="62,80 70,42 90,68" fill="${p.earInner}"/>
            <!-- Lynx Pointed Ear Tuft -->
            <path d="M66 32 C64 20, 60 14, 56 8 C62 16, 68 22, 69 34" fill="${p.earTuft}" stroke="${p.earTuft}" stroke-width="1.4" stroke-linecap="round"/>
          </g>

          <!-- Right Lynx Ear with Tuft -->
          <g class="mc-ear-tuft-right">
            <polygon points="144,84 134,32 106,68" fill="url(#mcFurGrad_${uid})" stroke="${p.furDark}" stroke-width="1.8"/>
            <polygon points="138,80 130,42 110,68" fill="${p.earInner}"/>
            <!-- Lynx Pointed Ear Tuft -->
            <path d="M134 32 C136 20, 140 14, 144 8 C138 16, 132 22, 131 34" fill="${p.earTuft}" stroke="${p.earTuft}" stroke-width="1.4" stroke-linecap="round"/>
          </g>

          <!-- Head Silhouette with Fluffy Cheeks -->
          <path d="M64 78 C52 92, 50 114, 68 126 C82 134, 118 134, 132 126 C150 114, 148 92, 136 78 C126 66, 74 66, 64 78 Z" 
                fill="url(#mcFurGrad_${uid})" stroke="${p.furDark}" stroke-width="1.8"/>

          <!-- Fluffy Cheek Fur Wisps -->
          <path d="M50 106 L42 112 L52 116 L44 122 L58 124" stroke="${p.furDark}" stroke-width="1.4" fill="none" stroke-linecap="round"/>
          <path d="M150 106 L158 112 L148 116 L156 122 L142 124" stroke="${p.furDark}" stroke-width="1.4" fill="none" stroke-linecap="round"/>

          <!-- Forehead Tabby "M" Marking (Maine Coon Signature) -->
          <g opacity="0.75">
            <path d="M88 68 L94 80 L100 72 L106 80 L112 68" stroke="${p.markings}" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M92 62 L100 66 L108 62" stroke="${p.markings}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
          </g>

          <!-- Expressive Eyes or Sleeping Closed Arcs -->
          ${isSleeping ? `
          <g class="mc-eye-sleeping">
            <path d="M72 100 Q82 110 92 100" stroke="${p.furDark}" stroke-width="2.8" fill="none" stroke-linecap="round"/>
            <path d="M108 100 Q118 110 128 100" stroke="${p.furDark}" stroke-width="2.8" fill="none" stroke-linecap="round"/>
            <path d="M76 96 Q82 103 88 96" stroke="${p.furLight}" stroke-width="1.4" fill="none" stroke-linecap="round" opacity="0.8"/>
            <path d="M112 96 Q118 103 124 96" stroke="${p.furLight}" stroke-width="1.4" fill="none" stroke-linecap="round" opacity="0.8"/>
          </g>
          <g class="sleep-zzz-svg-group" opacity="0.95">
            <text x="32" y="52" font-size="18" font-weight="900" fill="#6366f1" font-family="sans-serif">z</text>
            <text x="44" y="36" font-size="24" font-weight="900" fill="#818cf8" font-family="sans-serif">Z</text>
            <text x="60" y="18" font-size="30" font-weight="900" fill="#a5b4fc" font-family="sans-serif">Z</text>
          </g>
          ` : `
          <g class="mc-eye-lid">
            <!-- Left Eye -->
            <ellipse cx="82" cy="98" rx="10.5" ry="12.5" fill="url(#mcEyeGrad_${uid})" stroke="${p.furDark}" stroke-width="1.6"/>
            <!-- Left Pupil -->
            <ellipse cx="83" cy="98" rx="4.5" ry="8.5" fill="#0f172a"/>
            <!-- Highlights -->
            <circle cx="79" cy="93" r="3.2" fill="${p.eyeHighlight}"/>
            <circle cx="85" cy="103" r="1.5" fill="${p.eyeHighlight}"/>

            <!-- Right Eye -->
            <ellipse cx="118" cy="98" rx="10.5" ry="12.5" fill="url(#mcEyeGrad_${uid})" stroke="${p.furDark}" stroke-width="1.6"/>
            <!-- Right Pupil -->
            <ellipse cx="117" cy="98" rx="4.5" ry="8.5" fill="#0f172a"/>
            <!-- Highlights -->
            <circle cx="115" cy="93" r="3.2" fill="${p.eyeHighlight}"/>
            <circle cx="121" cy="103" r="1.5" fill="${p.eyeHighlight}"/>
          </g>`}

          <!-- Cute Muzzle (Cream base) -->
          <ellipse cx="100" cy="116" rx="16" ry="10" fill="${p.bib}" opacity="0.95"/>

          <!-- Pink Nose -->
          <polygon points="96,110 104,110 100,115" fill="${p.nose}" stroke="${p.furDark}" stroke-width="0.8"/>

          <!-- Sweet Mouth Line -->
          <path d="M94 118 Q100 122 100 115 Q100 122 106 118" stroke="${p.furDark}" stroke-width="1.5" fill="none" stroke-linecap="round"/>

          <!-- Long Realistic Whiskers -->
          <g stroke="#ffffff" stroke-width="1.4" opacity="0.85" stroke-linecap="round">
            <!-- Left Whiskers -->
            <line x1="92" y1="114" x2="48" y2="108"/>
            <line x1="91" y1="117" x2="44" y2="118"/>
            <line x1="92" y1="120" x2="52" y2="128"/>
            <!-- Right Whiskers -->
            <line x1="108" y1="114" x2="152" y2="108"/>
            <line x1="109" y1="117" x2="156" y2="118"/>
            <line x1="108" y1="120" x2="148" y2="128"/>
          </g>

          <!-- Eyebrow Whisker Tufts -->
          <path d="M78 86 Q72 80 68 76" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.8"/>
          <path d="M122 86 Q128 80 132 76" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.8"/>
        </g>
      </svg>
    `;
  }
}
  return MaineCoonPetSystem;
}));
