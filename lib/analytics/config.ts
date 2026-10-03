/** localStorage key that keeps a browser out of the website analytics (set when an admin signs in). */
export const NO_TRACK_KEY = "lusako:no-track";
/** Random visitor id kept in the browser (no cookies). */
export const VISITOR_KEY = "lusako:vid";
/** The current visit: { id, lastSeen, landing… }. A new one starts after 30 minutes without activity. */
export const SESSION_KEY = "lusako:session";
export const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
/** Where the tracker sends its beacons. */
export const TRACK_ENDPOINT = "/api/visit";
