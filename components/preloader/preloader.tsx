"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { wordmark } from "@/content/brand-logo";
import { site } from "@/content/site";

/*
 * The intro ("Drop"): a drop falls and lands as the "o" of LUSAKO, ripples spread, the name unrolls out of the
 * mark, then the page opens out from the drop.
 *
 * Everything up to the opening is CSS (the .intro rules in app/globals.css), started before the first paint by
 * the early script (./intro-script.ts), so it runs while the app is still loading and, moving only transform and
 * opacity, stays smooth while the page hydrates underneath. This component then waits until the page is ready
 * (fonts and the hero film's first frame), opens the hole on the next ripple and hands over to the hero, whose
 * entrance animations wait at their first frame until then.
 */

const W = wordmark.width;
const H = wordmark.height;
/** The wordmark is one path of six shapes: the joined "LUSAK" with its three counters, then the "o" and its drop. */
const shapes = wordmark.d.split(/(?=M)/);
const nameShape = shapes.slice(0, 4).join("");
const oShape = shapes.slice(4).join("");
const dropShape = shapes[5];

/** Centre of the "o", and the middle of the drop cut into it, where the drop lands and the page opens from. */
const O = { x: 266.9, y: 46.4, dropY: 52 };

/** Bounding boxes in the logo's own units (x, y, width, height), measured from the paths. */
type Box = readonly [number, number, number, number];
const nameBox: Box = [-4, -10, 250, H + 20]; // the window the name unrolls through, a little larger than the letters
const oBox: Box = [238, 18.4, 57.8, 56];
const dropBox: Box = [252.699, 26.376, 28.401, 38.924];
const ringBox: Box = [O.x - 30.5, O.y - 30.5, 61, 61];

/** Places a piece over the logo in its units (.intro-piece in globals.css). */
const place = ([x, y, w, h]: Box, more?: Record<string, string | number>) =>
  ({ "--x": x, "--y": y, "--w": w, "--h": h, ...more }) as CSSProperties;
/** The drop squashes and shrinks around its middle. */
const dropOrigin = `${((O.x - dropBox[0]) / dropBox[2]) * 100}% ${((O.dropY - dropBox[1]) / dropBox[3]) * 100}%`;

/** The ripples: three as the drop lands, and one that repeats every 1.25s until the page opens. */
const ripples = [0.64, 0.81, 0.98, 1.95];
/** When the hole can open (seconds into the intro): 0.55s into the repeating ripple, the first time it is ready. */
const OPEN_AT = [2.5, 3.75, 5];
const OPEN_FOR = 0.9; // the hole takes this long to clear the screen
const HAND_OVER = 0.22; // the page starts its own entrance this long after the hole starts to open

const sleep = (seconds: number) => new Promise((resolve) => window.setTimeout(resolve, Math.max(0, seconds) * 1000));

/** Fonts, and the first frame of the home hero film, so the page is complete when it is revealed. */
function pageReady() {
  const waits: Promise<unknown>[] = [document.fonts?.ready];
  const poster = document.querySelector<HTMLVideoElement>("main [data-hero] video[poster]")?.poster;
  if (poster) {
    const image = new Image();
    image.src = poster;
    waits.push(image.decode());
  }
  return Promise.all(waits).catch(() => {});
}

export function Preloader() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    const intro = root.current;
    if (!intro || (html.dataset.intro !== "play" && html.dataset.intro !== "wait")) return;
    let live = true;
    const undo: (() => void)[] = [];

    // Seconds into the intro, read off the repeating ripple's clock.
    const loop = intro.querySelector<HTMLElement>("[data-loop]");
    const last = OPEN_AT[OPEN_AT.length - 1];
    const elapsed = () => {
      const time = loop?.getAnimations?.()[0]?.currentTime;
      return typeof time === "number" ? time / 1000 : last;
    };

    // Where the hole opens (the drop in the "o") and how far it has to grow to clear the far corner. Measured ahead
    // of the opening, so the layout read doesn't land on its first frame; again only if the window has resized.
    let measuredFor = "";
    const measure = () => {
      const stage = intro.getBoundingClientRect();
      const logo = intro.querySelector(".intro-logo")!.getBoundingClientRect();
      const unit = logo.width / W;
      const x = logo.left - stage.left + O.x * unit;
      const y = logo.top - stage.top + O.dropY * unit;
      const reach = Math.hypot(Math.max(x, stage.width - x), Math.max(y, stage.height - y)) + 4;
      intro.style.setProperty("--hole-x", `${x}px`);
      intro.style.setProperty("--hole-y", `${y}px`);
      intro.style.setProperty("--reach", `${reach}px`);
      measuredFor = `${window.innerWidth}x${window.innerHeight}`;
    };

    // Once the hole starts to open, the hand-over runs to the end whatever happens to this component.
    const open = () => {
      if (!live || html.dataset.intro !== "play") return;
      if (measuredFor !== `${window.innerWidth}x${window.innerHeight}`) measure();
      html.dataset.intro = "reveal";
      window.setTimeout(() => {
        html.dataset.intro = "open";
        html.style.removeProperty("overflow");
      }, HAND_OVER * 1000);
      window.setTimeout(() => {
        if (html.dataset.intro === "open") delete html.dataset.intro;
      }, OPEN_FOR * 1000 + 60);
    };

    const shown = new Promise<void>((resolve) => {
      if (document.visibilityState === "visible") return resolve();
      // Opened in a background tab: the early script holds the first frame until the tab is shown.
      const onChange = () => {
        if (document.visibilityState !== "visible") return;
        document.removeEventListener("visibilitychange", onChange);
        resolve();
      };
      document.addEventListener("visibilitychange", onChange);
      undo.push(() => document.removeEventListener("visibilitychange", onChange));
    });

    (async () => {
      await shown;
      await Promise.race([pageReady(), sleep(last - elapsed())]);
      if (!live) return;
      measure();
      const now = elapsed();
      const at = OPEN_AT.find((time) => time >= now - 0.05) ?? now;
      const timer = window.setTimeout(open, Math.max(0, at - now) * 1000);
      undo.push(() => window.clearTimeout(timer));
    })();

    return () => {
      live = false;
      undo.forEach((run) => run());
    };
  }, []);

  return (
    <div ref={root} aria-hidden className="intro">
      <div className="intro-panel">
        <div className="intro-mark">
          <div className="intro-logo">
            <div className="intro-lockup" style={{ "--shift": `${((W / 2 - O.x) / W) * 100}%` } as CSSProperties}>
              <span className="intro-piece intro-name" style={place(nameBox)}>
                <span>
                  <svg viewBox={nameBox.join(" ")}>
                    <path d={nameShape} />
                  </svg>
                </span>
              </span>
              {ripples.map((at, i) => (
                <svg
                  key={at}
                  viewBox={ringBox.join(" ")}
                  data-loop={i === ripples.length - 1 ? "" : undefined}
                  className="intro-piece intro-ring"
                  style={place(ringBox, { "--at": `${at}s` })}
                >
                  <circle cx={O.x} cy={O.y} r={30} />
                </svg>
              ))}
              <svg viewBox={oBox.join(" ")} className="intro-piece intro-o" style={place(oBox)}>
                <path d={oShape} />
              </svg>
              <svg viewBox={dropBox.join(" ")} className="intro-piece intro-drop" style={place(dropBox, { transformOrigin: dropOrigin })}>
                <path d={dropShape} />
              </svg>
            </div>
          </div>
          <p className="intro-tagline">{site.tagline}</p>
        </div>
      </div>
      <div className="intro-edge" />
    </div>
  );
}
