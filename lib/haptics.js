/** Short device vibration when the user taps a primary action. */
export function vibrateTap(ms = 14) {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  try {
    navigator.vibrate(ms);
  } catch {
    // Ignore browsers that expose vibrate but reject the call.
  }
}
