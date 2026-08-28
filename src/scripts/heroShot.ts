import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Trapezoid at rest, flat when the scrub finishes.
const TILT = 42;

// Scroll distance, in viewport heights, spent on each frame swap while pinned.
const SWAP_DISTANCE = 0.9;

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

  // Frames stack in DOM order, so fading one in hides the one below it.
  const frames = [...shot.querySelectorAll<HTMLElement>("[data-hero-frame]")];
  if (frames.length < 2) return;

  const stage = shot.closest<HTMLElement>("#hero-stage");
  if (!stage) return;

  const swaps = frames.length - 1;

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: stage,
      start: "center center",
      end: () => `+=${window.innerHeight * SWAP_DISTANCE * swaps}`,
      pin: stage,
      pinSpacing: true,
      anticipatePin: 1,
      scrub: true,
      invalidateOnRefresh: true,
    },
  });

  // Each frame holds for one unit, then crossfades over the next.
  frames.slice(1).forEach((frame, index) => {
    timeline.to(frame, { opacity: 1, ease: "none", duration: 1 }, index * 2);
  });
}
