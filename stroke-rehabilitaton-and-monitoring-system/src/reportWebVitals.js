/**
 * src/reportWebVitals.js
 * ─────────────────────────────────────────────────────────────
 * Create React App performance measurement utility.
 * Reports web vitals (CLS, FID, FCP, LCP, TTFB) via the
 * callback function passed to `reportWebVitals()`.
 * ─────────────────────────────────────────────────────────────
 */

const reportWebVitals = onPerfEntry => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;
