/**
 * <purelane-hero-stage>
 *
 * Hero product carousel + scroll/pointer parallax.
 *
 * Reference behaviour (purelane-homepage.html lines 1613-1682):
 *   - slides advance every 3.8s, pause on mouseenter, resume on mouseleave
 *   - an IntersectionObserver stops the timer while the hero is off-screen
 *   - dots jump to a slide and restart the timer
 *   - the product block parallaxes on scroll: it rises, shrinks and fades over
 *     the first 700px (translate -f*54px, scale 1 - f*0.06, opacity 1 - f*0.55)
 *   - above 1024px it also tracks the pointer (x * -16px, y * -10px)
 *   - a 7s WAAPI loop breathes the drop-shadow
 *
 * Everything here is scoped to this element. The prototype bound document-level
 * listeners and a setInterval at parse time, which in a theme means: edit the
 * section once and the old timer keeps running against detached DOM while the
 * new markup never initialises. connectedCallback/disconnectedCallback is what
 * makes "adding, removing, reordering and reconfiguring never break anything,
 * including the animations" actually true.
 *
 * Deliberately NOT optimised yet (Phase 9 owns that):
 *   - the pointer handler is rAF-batched but still runs per pointermove
 *   - the shadow breathe animates a filter, which is a real rasterisation cost
 * Both reproduce the reference behaviour, which is what this phase is for.
 */
if (!customElements.get('purelane-hero-stage')) {
  customElements.define(
    'purelane-hero-stage',
    class PurelaneHeroStage extends HTMLElement {
      connectedCallback() {
        this.slides = Array.from(this.querySelectorAll('.pl-hero__slide'));
        this.dots = Array.from(this.querySelectorAll('.pl-hero__dot'));
        this.product = this.closest('.pl-hero')?.querySelector('.pl-hero__prod');

        this.index = 0;
        this.timer = null;
        this.raf = null;
        this.pointerX = 0;
        this.pointerY = 0;

        // Optimistic. The observer's job is to PAUSE the carousel once the hero
        // scrolls away, not to grant permission to start. Gating the first play
        // on an observer callback means any environment where that callback is
        // late, or where the target measures as zero-area, never autoplays at
        // all - which is exactly what happened.
        this.visible = true;

        this.interval = (parseFloat(this.dataset.interval) || 3.8) * 1000;
        this.autoplayEnabled = this.dataset.autoplay !== 'false';
        this.parallaxEnabled = this.dataset.parallax !== 'false';

        this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        this.desktopQuery = window.matchMedia('(min-width: 1024px)');

        this.onMotionChange = this.onMotionChange.bind(this);
        this.onScroll = this.onScroll.bind(this);
        this.onPointerMove = this.onPointerMove.bind(this);
        this.onDotClick = this.onDotClick.bind(this);
        this.onDotKeydown = this.onDotKeydown.bind(this);
        this.pause = this.pause.bind(this);
        this.play = this.play.bind(this);

        this.onBlockSelect = this.onBlockSelect.bind(this);
        this.onBlockDeselect = this.onBlockDeselect.bind(this);

        this.motionQuery.addEventListener('change', this.onMotionChange);
        this.dots.forEach((dot, i) => {
          dot.addEventListener('click', () => this.onDotClick(i));
          dot.addEventListener('keydown', this.onDotKeydown);
        });

        // Theme editor: clicking a slide block in the sidebar should show that
        // slide and hold it still while the merchant edits it.
        document.addEventListener('shopify:block:select', this.onBlockSelect);
        document.addEventListener('shopify:block:deselect', this.onBlockDeselect);

        // Pause on hover AND on focus. The prototype only did hover, which
        // leaves a keyboard user unable to stop the carousel moving under them.
        this.addEventListener('mouseenter', this.pause);
        this.addEventListener('mouseleave', this.play);
        this.addEventListener('focusin', this.pause);
        this.addEventListener('focusout', this.play);

        this.goTo(0, { announce: false });
        this.startVisibilityWatch();
        this.startParallax();
      }

      disconnectedCallback() {
        this.pause();
        this.stopParallax();
        this.visibility?.disconnect();
        this.motionQuery.removeEventListener('change', this.onMotionChange);
        document.removeEventListener('shopify:block:select', this.onBlockSelect);
        document.removeEventListener('shopify:block:deselect', this.onBlockDeselect);
        this.shadowAnimation?.cancel();
      }

      onBlockSelect(event) {
        const slide = event.target.closest?.('.pl-hero__slide');
        const i = this.slides.indexOf(slide);
        if (i === -1) return;
        this.pause();
        this.goTo(i);
      }

      onBlockDeselect(event) {
        if (!this.contains(event.target)) return;
        this.play();
      }

      get reduced() {
        return this.motionQuery.matches;
      }

      /* ---------------- slides ---------------- */

      goTo(next, options) {
        const announce = options?.announce !== false;
        this.index = (next + this.slides.length) % this.slides.length;

        this.slides.forEach((slide, i) => {
          const active = i === this.index;
          slide.classList.toggle('is-on', active);
          // Inactive slides carry their own price tag and product names. Left in
          // the accessibility tree they read as three competing offers.
          slide.toggleAttribute('inert', !active);
          slide.setAttribute('aria-hidden', String(!active));
        });

        this.dots.forEach((dot, i) => {
          const active = i === this.index;
          dot.setAttribute('aria-current', String(active));
          dot.setAttribute('tabindex', active ? '0' : '-1');
        });

        if (announce && this.status) {
          this.status.textContent = this.slides[this.index]?.dataset.label || '';
        }
      }

      onDotClick(i) {
        this.pause();
        this.goTo(i);
        this.play();
      }

      /** Arrow keys move between dots, as a tablist-style control group. */
      onDotKeydown(event) {
        const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
        const step = keys[event.key];
        if (!step) return;

        event.preventDefault();
        this.pause();
        this.goTo(this.index + step);
        this.dots[this.index]?.focus();
        this.play();
      }

      /* ---------------- autoplay ---------------- */

      play() {
        if (this.timer || !this.autoplayEnabled || this.reduced) return;
        if (this.slides.length < 2 || !this.visible) return;
        this.timer = setInterval(() => this.goTo(this.index + 1, { announce: false }), this.interval);
      }

      pause() {
        if (!this.timer) return;
        clearInterval(this.timer);
        this.timer = null;
      }

      startVisibilityWatch() {
        this.status = this.querySelector('[data-pl-hero-status]');

        // Start immediately; the observer only ever pauses/resumes from here.
        this.play();

        if (!('IntersectionObserver' in window)) return;

        this.visibility = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              this.visible = entry.isIntersecting;
              if (entry.isIntersecting) this.play();
              else this.pause();
            });
          },
          // Any sliver on screen counts. The previous 0.2 ratio could not be
          // met by a zero-area target and is unnecessary for a pause check.
          { threshold: 0 }
        );

        this.visibility.observe(this);
      }

      /* ---------------- parallax ---------------- */

      startParallax() {
        if (!this.product || !this.parallaxEnabled || this.reduced) return;

        window.addEventListener('scroll', this.onScroll, { passive: true });
        window.addEventListener('resize', this.onScroll, { passive: true });

        if (this.desktopQuery.matches) {
          window.addEventListener('pointermove', this.onPointerMove, { passive: true });
        }

        this.shadowAnimation = this.product.animate(
          [
            { filter: 'drop-shadow(0 14px 22px rgba(0,74,66,.15))' },
            { filter: 'drop-shadow(0 20px 30px rgba(0,74,66,.2))' },
            { filter: 'drop-shadow(0 14px 22px rgba(0,74,66,.15))' },
          ],
          { duration: 7000, iterations: Infinity, easing: 'ease-in-out' }
        );

        this.frame();
      }

      stopParallax() {
        window.removeEventListener('scroll', this.onScroll);
        window.removeEventListener('resize', this.onScroll);
        window.removeEventListener('pointermove', this.onPointerMove);
        if (this.raf) cancelAnimationFrame(this.raf);
        this.raf = null;
        if (this.product) {
          this.product.style.transform = '';
          this.product.style.opacity = '';
        }
      }

      onScroll() {
        if (!this.raf) this.raf = requestAnimationFrame(() => this.frame());
      }

      onPointerMove(event) {
        if (event.pointerType !== 'mouse') return;
        this.pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
        this.pointerY = (event.clientY / window.innerHeight - 0.5) * 2;
        this.onScroll();
      }

      frame() {
        this.raf = null;
        if (!this.product) return;

        const y = window.scrollY || window.pageYOffset;
        const f = Math.min(y / 700, 1);
        const x = (this.pointerX * -16).toFixed(2);
        const lift = (-f * 54 + this.pointerY * -10).toFixed(2);
        const scale = (1 - f * 0.06).toFixed(3);

        this.product.style.transform = `translate3d(${x}px, ${lift}px, 0) scale(${scale})`;
        this.product.style.opacity = (1 - f * 0.55).toFixed(3);
      }

      onMotionChange() {
        this.pause();
        this.stopParallax();
        if (!this.reduced) {
          this.startParallax();
          this.play();
        }
      }
    }
  );
}
