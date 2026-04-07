"use client";

import { useEffect } from "react";

/**
 * Observes `.scroll-reveal` elements and adds `.visible` when they scroll into view.
 * Accepts an optional dependency array so the observer re-scans when the DOM changes
 * (e.g. when navigating from form steps to results).
 */
export function useScrollReveal(deps: unknown[] = []) {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      document.querySelectorAll(".scroll-reveal").forEach((el) => {
        el.classList.add("visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -20px 0px" }
    );

    // Observe all scroll-reveal elements currently in the DOM
    document.querySelectorAll(".scroll-reveal:not(.visible)").forEach((el) => {
      observer.observe(el);
    });

    // Also watch for dynamically added elements via MutationObserver
    const mutationObs = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof HTMLElement) {
            if (node.classList.contains("scroll-reveal") && !node.classList.contains("visible")) {
              observer.observe(node);
            }
            node.querySelectorAll?.(".scroll-reveal:not(.visible)").forEach((el) => {
              observer.observe(el);
            });
          }
        }
      }
    });

    mutationObs.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObs.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
