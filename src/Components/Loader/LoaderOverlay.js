"use client";

import "./loader-styles.css";

const DEFAULT_MESSAGE = "Loading... Please wait";

/** Presentational overlay — no Redux, safe for loading.tsx and ClientOnly. */
export function LoaderOverlay({ message = DEFAULT_MESSAGE }) {
  return (
    <div className="loader" style={{ display: "block" }} data-testid="app-loader">
      <div className="loader-container">
        <div className="spinner mb-2" />
        <span style={{ color: "white", padding: "0 24px", textAlign: "center" }}>
          {message || DEFAULT_MESSAGE}
        </span>
      </div>
    </div>
  );
}
