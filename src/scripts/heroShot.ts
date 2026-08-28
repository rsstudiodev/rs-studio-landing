import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Trapezoid at rest, flat when the scrub finishes.
const TILT = 42;

export function initHeroShot() {
  const shot = document.querySelector<HTMLElement>("#hero-shot");
  if (!shot) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    gsap.set(shot, { rotateX: 0 });
    return;
  }

  gsap.fromTo(
    shot,
    { rotateX: TILT, scale: 0.92, y: 0 },
    {
      rotateX: 0,
      scale: 1,
      y: 0,
      ease: "none",
      scrollTrigger: {
        trigger: shot,
        start: "top 85%",
        end: "top 20%",
        scrub: true,
        invalidateOnRefresh: true,
      },
    },
  );
}
