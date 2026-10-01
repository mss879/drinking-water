/**
 * Runs before the page paints (app/layout.tsx puts it first in <body>) and decides whether this visit gets the
 * intro: the first full load of the home page in a browser tab, unless the visitor prefers reduced motion or
 * arrived on a #section link. Add ?intro to the address to see it again.
 *
 * It sets data-intro on <html>, which shows the intro and starts its CSS animation from the very first frame, holds
 * the page's own entrance animations at their first frame, and locks scrolling. The Preloader component opens the
 * intro once the app has loaded; if the app never does (a script failed), the intro fades out on its own instead.
 *
 * data-intro: "wait" (opened in a background tab: held until shown) → "play" → "reveal" (the hole is opening) →
 * "open" (the page is released) → removed. "out" is the fade-out fallback.
 *
 * Kept free of outside references and newer syntax: it is inlined into the page as text.
 */
function intro(key: string, fallbackMs: number) {
  try {
    const html = document.documentElement;
    const again = new URLSearchParams(location.search).has("intro");
    if (location.pathname !== "/" || (location.hash && !again)) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try {
      if (sessionStorage.getItem(key) && !again) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Storage blocked: play it.
    }
    html.style.overflow = "hidden";
    const play = function () {
      html.dataset.intro = "play";
      setTimeout(function () {
        if (html.dataset.intro !== "play") return;
        html.dataset.intro = "out";
        html.style.removeProperty("overflow");
        setTimeout(function () {
          if (html.dataset.intro === "out") delete html.dataset.intro;
        }, 600);
      }, fallbackMs);
    };
    if (document.visibilityState === "hidden") {
      html.dataset.intro = "wait";
      const shown = function () {
        if (document.visibilityState !== "visible") return;
        document.removeEventListener("visibilitychange", shown);
        play();
      };
      document.addEventListener("visibilitychange", shown);
    } else play();
  } catch {
    // Never let the intro stand between a visitor and the page.
  }
}

/** The intro gives up and fades out if the app hasn't opened it this long after it started (it opens by 5s). */
export const introScript = `(${intro.toString()})("lusako-intro", 5400)`;
