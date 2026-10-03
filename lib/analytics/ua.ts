/**
 * A small user-agent reader for the analytics: device type, browser and OS families only. (ua-parser-js 2 is AGPL,
 * and the dashboard doesn't need versions.) Client hints and the touch flag the tracker sends fill the gaps, e.g.
 * an iPad that reports itself as a Mac.
 */
export type Device = "mobile" | "tablet" | "desktop";

export function readUserAgent(ua: string, hints: { mobile?: string | null; platform?: string | null; touch?: boolean }) {
  const isIPadDesktopMode = /Macintosh/.test(ua) && hints.touch === true;

  let device: Device = "desktop";
  if (/iPad|Tablet|PlayBook|Silk|Kindle/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua)) || isIPadDesktopMode) {
    device = "tablet";
  } else if (/Mobi|iPhone|iPod|Android.*Mobile|Windows Phone|BlackBerry|Opera Mini/i.test(ua) || hints.mobile === "?1") {
    device = "mobile";
  }

  let browser = "Other";
  if (/Edg(A|iOS|e)?\//.test(ua)) browser = "Edge";
  else if (/OPR\/|Opera/.test(ua)) browser = "Opera";
  else if (/SamsungBrowser\//.test(ua)) browser = "Samsung Internet";
  else if (/UCBrowser\//.test(ua)) browser = "UC Browser";
  else if (/YaBrowser\//.test(ua)) browser = "Yandex";
  else if (/Firefox\/|FxiOS\//.test(ua)) browser = "Firefox";
  else if (/CriOS\/|Chrome\//.test(ua)) browser = "Chrome";
  else if (/Safari\//.test(ua) && /Version\//.test(ua)) browser = "Safari";

  let os = "Other";
  const platform = hints.platform?.replaceAll('"', "") ?? "";
  if (/Windows/.test(ua) || platform === "Windows") os = "Windows";
  else if (/iPhone|iPad|iPod/.test(ua) || isIPadDesktopMode) os = "iOS";
  else if (/Android/.test(ua) || platform === "Android") os = "Android";
  else if (/CrOS/.test(ua) || platform === "Chrome OS") os = "ChromeOS";
  else if (/Mac OS X|Macintosh/.test(ua) || platform === "macOS") os = "macOS";
  else if (/Linux/.test(ua) || platform === "Linux") os = "Linux";

  return { device, browser, os };
}
