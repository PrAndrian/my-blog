import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ANIMATION } from "@/lib/constants";

interface UseMobilePanelAnimationOptions {
  mobilePanel: string;
  selectedCategory: string;
}

export function useMobilePanelAnimation({
  mobilePanel,
  selectedCategory,
}: UseMobilePanelAnimationOptions) {
  const postListPanelRef = useRef<HTMLDivElement>(null);
  const homePanelRef = useRef<HTMLDivElement>(null);
  const postContentPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const duration = prefersReducedMotion ? 0 : ANIMATION.DURATION_SHORT;

    const panels = [
      {
        ref: postListPanelRef,
        isActive: mobilePanel === "postList" && selectedCategory !== "Home",
      },
      {
        ref: homePanelRef,
        isActive: mobilePanel === "postList" && selectedCategory === "Home",
      },
      { ref: postContentPanelRef, isActive: mobilePanel === "postContent" },
    ];

    const animations: gsap.core.Tween[] = [];

    panels.forEach(({ ref, isActive }) => {
      if (ref.current) {
        if (isActive) {
          const anim = gsap.to(ref.current, {
            opacity: 1,
            duration,
            ease: "power2.out",
            pointerEvents: "auto",
          });
          animations.push(anim);
        } else {
          const anim = gsap.to(ref.current, {
            opacity: 0,
            duration,
            ease: "power2.out",
            pointerEvents: "none",
          });
          animations.push(anim);
        }
      }
    });

    return () => {
      animations.forEach((anim) => anim.kill());
    };
  }, [mobilePanel, selectedCategory]);

  useEffect(() => {
    if (
      homePanelRef.current &&
      mobilePanel === "postList" &&
      selectedCategory === "Home"
    ) {
      gsap.set(homePanelRef.current, {
        opacity: 1,
        pointerEvents: "auto",
      });
    }
  }, [mobilePanel, selectedCategory]);

  return {
    postListPanelRef,
    homePanelRef,
    postContentPanelRef,
  };
}
