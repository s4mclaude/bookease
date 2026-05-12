"use client";

import { useEffect, useCallback } from "react";

export default function ParticlesComponent() {
  const initParticles = useCallback((isDark: boolean) => {
    const oldCanvas = document.querySelector("#particles-js canvas");
    if (oldCanvas) oldCanvas.remove();

    // @ts-ignore
    if (window.pJSDom?.length > 0) {
      // @ts-ignore
      window.pJSDom.forEach((p) => p.pJS.fn.vendors.destroypJS());
      // @ts-ignore
      window.pJSDom = [];
    }

    const colors = isDark
      ? { particles: "#4fc3f7", lines: "#29b6f6", accent: "#0288d1" }
      : { particles: "#90caf9", lines: "#90caf9", accent: "#90caf9" };

    // @ts-ignore
    window.particlesJS("particles-js", {
      particles: {
        number: { value: 55, density: { enable: true, value_area: 900 } },
        color: { value: colors.particles },
        shape: { type: "circle", stroke: { width: 0, color: colors.accent } },
        opacity: {
          value: 0.25,
          random: true,
          anim: { enable: true, speed: 0.6, opacity_min: 0.08 },
        },
        size: {
          value: 2.5,
          random: true,
          anim: { enable: false, speed: 1, size_min: 0.5 },
        },
        line_linked: {
          enable: true,
          distance: 150,
          color: colors.lines,
          opacity: 0.12,
          width: 1,
        },
        move: { enable: true, speed: 0.8, random: true, out_mode: "bounce" },
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: { enable: true, mode: "grab" },
          onclick: { enable: false, mode: "push" },
          resize: true,
        },
        modes: {
          grab: { distance: 180, line_linked: { opacity: 0.25 } },
          push: { particles_nb: 2 },
        },
      },
      retina_detect: true,
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      const html = document.documentElement;
      const detectDark = () =>
        html.classList.contains("dark") ||
        html.getAttribute("data-theme") === "dark";

      initParticles(detectDark());

      const observer = new MutationObserver(() => initParticles(detectDark()));
      observer.observe(html, {
        attributes: true,
        attributeFilter: ["class", "data-theme"],
      });
    };

    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, [initParticles]);

  return (
    <div
      id="particles-js"
      className={`
        w-full h-screen absolute top-0 left-0
        transition-colors duration-500
        bg-gradient-to-tr from-[#f4f9ff] via-[#e8f3ff] to-[#dceeff]
        dark:from-[#060a12] dark:via-[#081220] dark:to-[#0b1a2e]
      `}
    />
  );
}
