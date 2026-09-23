/**
 * Plan4U - Centralized Modal & Sheet Engine (ModalManager)
 * 
 * Provides unified lifecycle management for all 38 modals, sheets, dialogs, and popovers:
 * - Stack-based modal handling (nested dialogs support)
 * - Backdrop click-outside detection
 * - Escape key dismissal
 * - Mobile pull-to-dismiss swipe gesture on sheets
 * - Body scroll lock management (modal-open)
 * - Tactile haptic feedback integration
 * - Zero regression backwards-compatibility
 */

class ModalManager {
  constructor() {
    this.activeModals = []; // Stack of { id, element, sheet, options, openedAt }
    this.registeredModals = new Map();
    this._listenersInitialized = false;
    this.initGlobalListeners();
  }

  /**
   * Register modal configuration
   */
  register(id, config = {}) {
    this.registeredModals.set(id, config);
  }

  /**
   * Resolve element by ID or selector
   */
  resolveElement(target) {
    if (!target) return null;
    if (typeof target === 'string') {
      const cleanId = target.replace(/^#/, '');
      return document.getElementById(cleanId) || document.querySelector(target);
    }
    if (target instanceof HTMLElement) {
      return target;
    }
    return null;
  }

  /**
   * Open a modal, sheet, or dialog
   */
  open(target, options = {}) {
    const element = this.resolveElement(target);
    if (!element) {
      console.warn(`[ModalManager] Modal element not found:`, target);
      return null;
    }

    const id = element.id || (typeof target === 'string' ? target : 'anonymous-modal');
    const registeredConfig = this.registeredModals.get(id) || {};
    const mergedOptions = { ...registeredConfig, ...options };

    // Dismiss active virtual keyboard
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }

    // Resolve sheet container inside modal if present
    const sheetSelector = mergedOptions.sheetSelector || '.modal-sheet, .sheet-container, .modal-sheet-scrollable, .confirmation-sheet, .compact-dialog';
    const sheet = element.querySelector(sheetSelector) || element;

    // Check if already in stack, remove to put on top
    const existingIndex = this.activeModals.findIndex(m => m.element === element);
    if (existingIndex !== -1) {
      this.activeModals.splice(existingIndex, 1);
    }

    const modalRecord = {
      id,
      element,
      sheet,
      options: mergedOptions,
      openedAt: Date.now()
    };
    this.activeModals.push(modalRecord);

    // Apply active classes and attributes
    element.classList.add('open');
    element.classList.add('is-active');
    element.setAttribute('aria-hidden', 'false');

    if (element.style.display === 'none') {
      element.style.display = '';
    }

    // Lock background scrolling
    document.body.classList.add('modal-open');

    // Tactile haptic feedback
    if (mergedOptions.haptic !== false) {
      const pattern = typeof mergedOptions.haptic === 'number' ? mergedOptions.haptic : 15;
      if (typeof window.triggerHaptic === 'function') {
        window.triggerHaptic(pattern);
      }
    }

    // Setup pull-to-dismiss swipe gesture on sheet
    if (mergedOptions.enableSwipe !== false && sheet && sheet !== element) {
      this._bindSwipeGesture(modalRecord);
    }

    // Fire onOpen callback
    if (typeof mergedOptions.onOpen === 'function') {
      try {
        mergedOptions.onOpen(element);
      } catch (err) {
        console.error(`[ModalManager] Error in onOpen callback for ${id}:`, err);
      }
    }

    // Dispatch global event
    window.dispatchEvent(new CustomEvent('modal:open', { detail: { id, element } }));

    return element;
  }

  /**
   * Close a modal by target or the top-most modal if unspecified
   */
  close(target = null, options = {}) {
    let modalRecord = null;
    let index = -1;

    if (!target) {
      if (this.activeModals.length > 0) {
        index = this.activeModals.length - 1;
        modalRecord = this.activeModals[index];
      }
    } else {
      const element = this.resolveElement(target);
      if (element) {
        index = this.activeModals.findIndex(m => m.element === element);
        if (index !== -1) {
          modalRecord = this.activeModals[index];
        } else {
          // Direct DOM fallback if not tracked in stack
          modalRecord = {
            id: element.id || 'untracked',
            element,
            sheet: element.querySelector('.modal-sheet, .sheet-container') || element,
            options: {}
          };
        }
      }
    }

    if (!modalRecord) return false;

    const { element, sheet, options: recordOptions, id } = modalRecord;
    const mergedOptions = { ...recordOptions, ...options };

    // Reset any transform leftover from swipe gestures
    if (sheet && sheet.style) {
      sheet.style.transform = '';
      sheet.style.transition = '';
    }

    // Remove active classes
    element.classList.remove('open');
    element.classList.remove('is-active');
    element.classList.remove('is-picking-sticker');
    element.setAttribute('aria-hidden', 'true');

    // Remove from active stack
    if (index !== -1) {
      this.activeModals.splice(index, 1);
    }

    // Unlock background scrolling only if no active modals remain
    if (this.activeModals.length === 0) {
      document.body.classList.remove('modal-open');
    }

    // Fire onClose callback
    if (typeof mergedOptions.onClose === 'function') {
      try {
        mergedOptions.onClose(element);
      } catch (err) {
        console.error(`[ModalManager] Error in onClose callback for ${id}:`, err);
      }
    }

    // Dispatch global event
    window.dispatchEvent(new CustomEvent('modal:close', { detail: { id, element } }));

    return true;
  }

  /**
   * Close the top-most modal
   */
  closeTop() {
    return this.close();
  }

  /**
   * Close all active modals
   */
  closeAll() {
    while (this.activeModals.length > 0) {
      this.close();
    }
    // Safety cleanup for body class
    document.body.classList.remove('modal-open');
  }

  /**
   * Check if a modal is currently open
   */
  isOpen(target) {
    const el = this.resolveElement(target);
    if (!el) return false;
    return el.classList.contains('open') || el.classList.contains('is-active');
  }

  /**
   * Get top active modal record
   */
  getActiveModal() {
    return this.activeModals.length > 0 ? this.activeModals[this.activeModals.length - 1] : null;
  }

  /**
   * Initialize unified global listeners for Escape key and backdrop clicks
   */
  initGlobalListeners() {
    if (this._listenersInitialized) return;
    this._listenersInitialized = true;

    // 1. ESC Key to close top modal
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.keyCode === 27) {
        if (this.activeModals.length > 0) {
          e.preventDefault();
          this.closeTop();
        }
      }
    }, { passive: false });

    // 2. Click outside / Backdrop click dismissal
    let startedOnBackdrop = false;
    let backdropTarget = null;

    document.addEventListener('pointerdown', (e) => {
      startedOnBackdrop = false;
      backdropTarget = null;

      const topModal = this.getActiveModal();
      if (!topModal) return;

      const backdrop = topModal.element;
      if (e.target === backdrop) {
        startedOnBackdrop = true;
        backdropTarget = backdrop;
      }
    }, { passive: true });

    document.addEventListener('click', (e) => {
      if (!startedOnBackdrop || !backdropTarget) return;

      const topModal = this.getActiveModal();
      if (!topModal || topModal.element !== backdropTarget) return;

      // Ensure click finished on the backdrop itself
      if (e.target === backdropTarget) {
        // Prevent accidental rapid click right upon opening (< 350ms)
        if (Date.now() - (topModal.openedAt || 0) < 350) return;

        if (topModal.options.closeOnClickOutside !== false) {
          this.close(topModal.element);
        }
      }
    }, { passive: true });
  }

  /**
   * Bind touch pull-to-dismiss gesture on mobile sheet
   */
  _bindSwipeGesture(modalRecord) {
    const { sheet, element } = modalRecord;
    if (!sheet || sheet._swipeBound) return;
    sheet._swipeBound = true;

    let startY = 0;
    let currentY = 0;
    let isPulling = false;

    sheet.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      // Only initiate pull if scrolled to top
      const scrollable = sheet.querySelector('.modal-sheet-scrollable, .nutrition-modal-content, .settings-modal-content, .task-sheet-body') || sheet;
      if (scrollable && scrollable.scrollTop > 5) return;

      startY = e.touches[0].clientY;
      currentY = startY;
      isPulling = false;
    }, { passive: true });

    sheet.addEventListener('touchmove', (e) => {
      if (startY === 0) return;
      currentY = e.touches[0].clientY;
      const diffY = currentY - startY;

      if (diffY > 10) {
        isPulling = true;
        sheet.style.transition = 'none';
        sheet.style.transform = `translate3d(0, ${diffY * 0.7}px, 0)`;
      }
    }, { passive: true });

    sheet.addEventListener('touchend', () => {
      if (!isPulling) {
        startY = 0;
        return;
      }

      const diffY = currentY - startY;
      sheet.style.transition = 'transform 0.24s cubic-bezier(0.2, 0.9, 0.3, 1)';

      if (diffY > 90) {
        // Swipe dismissed threshold reached
        sheet.style.transform = 'translate3d(0, 100%, 0)';
        setTimeout(() => {
          this.close(element);
          sheet.style.transform = '';
          sheet.style.transition = '';
        }, 200);
      } else {
        // Rebound back to normal position
        sheet.style.transform = 'translate3d(0, 0, 0)';
        setTimeout(() => {
          sheet.style.transform = '';
          sheet.style.transition = '';
        }, 240);
      }

      startY = 0;
      isPulling = false;
    }, { passive: true });
  }
}

// Global Singleton Export
window.ModalManager = ModalManager;
window.modalManager = new ModalManager();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ModalManager;
}
