/**
 * Drives a paused <video> from scroll progress. A new seek only starts once the previous frame has been
 * decoded ("seeked"), so frames keep landing however fast the page scrolls instead of seeks piling up.
 * Encode scrub videos with a short keyframe interval (see README › Hero video) so every seek is cheap.
 */
export function createVideoScrub(video: HTMLVideoElement, src: string) {
  let target = 0;
  let seeking = false;
  let fallback = 0;

  const seek = () => {
    if (seeking || video.readyState < HTMLMediaElement.HAVE_METADATA) return;
    const time = Math.min(target * video.duration, video.duration - 0.05);
    if (!Number.isFinite(time) || Math.abs(video.currentTime - time) < 0.02) return;
    seeking = true;
    video.currentTime = time;
    fallback = window.setTimeout(settle, 500); // never stall if a "seeked" event goes missing
  };
  const settle = () => {
    window.clearTimeout(fallback);
    seeking = false;
    seek();
  };
  const reveal = () => {
    video.dataset.ready = "true";
  };

  video.muted = true;
  video.addEventListener("loadedmetadata", seek);
  video.addEventListener("seeked", settle);
  video.addEventListener("loadeddata", reveal);
  video.src = src;
  video.load();
  // iOS only paints seeked frames once a video has played; muted inline playback is always allowed.
  video
    .play()
    .then(() => {
      video.pause();
      seek();
    })
    .catch(() => {});

  return {
    /** Show the frame at `value`, from 0 (start) to 1 (end). */
    progress(value: number) {
      target = value;
      seek();
    },
    destroy() {
      window.clearTimeout(fallback);
      video.removeEventListener("loadedmetadata", seek);
      video.removeEventListener("seeked", settle);
      video.removeEventListener("loadeddata", reveal);
      video.pause();
      video.removeAttribute("src");
      video.load();
      delete video.dataset.ready;
    },
  };
}
