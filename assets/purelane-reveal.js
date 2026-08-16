/**
 * <purelane-reveal>
 *
 * Scroll-reveal for Purelane sections. Wraps section content; every descendant
 * carrying .pl-rv fades and lifts in when it first enters the viewport.
 *
 * Why a custom element rather than the prototype's parse-time script:
 *
 * 1. Theme editor safety. Shopify re-renders a section's DOM on every setting
 *    change and fires shopify:section:load. connectedCallback runs again for
 *    free; a document-level querySelectorAll bound at parse time does not, so
 *    the prototype's approach would leave edited sections permanently at
 *    opacity 0. disconnectedCallback tears the observer down, so removing or
 *    reordering a section leaks nothing.
 *
 * 2. No-JS safety. The hidden state in CSS is gated behind [data-pl-ready],
 *    which only this element sets. If the script never runs, content renders
 *    fully visible instead of invisible.
 *
 * 3. Reduced motion is read live. The prototype samples matchMedia once at
 *    load, so changing the OS setting mid-session has no effect.
 *
 * Reference behaviour: purelane-homepage.html lines 157-160 (CSS) and
 * 1571-1580 (observer: rootMargin 0px 0px -12% 0px, threshold 0.12, unobserve
 * once revealed).
 */
if (!customElements.get('purelane-reveal')) {
  customElements.define(
    'purelane-reveal',
    class PurelaneReveal extends HTMLElement {
      connectedCallback() {
        this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        this.onMotionChange = this.onMotionChange.bind(this);
        this.motionQuery.addEventListener('change', this.onMotionChange);

        this.start();
      }

      disconnectedCallback() {
        this.stop();
        this.motionQuery.removeEventListener('change', this.onMotionChange);
      }

      start() {
        // Without IntersectionObserver, leave everything visible rather than
        // shipping a hidden page we cannot reliably un-hide.
        if (!('IntersectionObserver' in window) || this.motionQuery.matches) {
          this.revealAll();
          return;
        }

        this.setAttribute('data-pl-ready', '');

        this.observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              entry.target.classList.add('is-in');
              this.observer.unobserve(entry.target);
            });
          },
          { rootMargin: '0px 0px -12% 0px', threshold: 0.12 }
        );

        this.targets().forEach((el) => this.observer.observe(el));
      }

      stop() {
        if (this.observer) {
          this.observer.disconnect();
          this.observer = null;
        }
      }

      /** Elements already in view when the section loads resolve immediately. */
      revealAll() {
        this.removeAttribute('data-pl-ready');
        this.targets().forEach((el) => el.classList.add('is-in'));
      }

      targets() {
        return Array.from(this.querySelectorAll('.pl-rv'));
      }

      onMotionChange() {
        this.stop();
        this.start();
      }
    }
  );
}
