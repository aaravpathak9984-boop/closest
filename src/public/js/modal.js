/**
 * Accessible Modal Controller.
 * Provides functions to open and close dialog modals on page.
 */
class ModalController {
  constructor() {
    this.init();
  }

  init() {
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-modal-target]');
      if (trigger) {
        const modalId = trigger.getAttribute('data-modal-target');
        this.openModal(modalId);
      }

      const closeBtn = e.target.closest('[data-modal-close]');
      if (closeBtn) {
        const backdrop = closeBtn.closest('.modal-backdrop');
        if (backdrop) this.closeModal(backdrop.id);
      }

      // Close when clicking outside modal card
      if (e.target.classList.contains('modal-backdrop')) {
        this.closeModal(e.target.id);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal-backdrop.active');
        if (activeModal) this.closeModal(activeModal.id);
      }
    });
  }

  openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.appModal = new ModalController();
});
