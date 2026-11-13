/**
 * Triggers a client-side file download from an in-memory string.
 * Uses the Blob + object URL pattern, which works in every browser;
 * the File System Access API is Chromium-only and cannot be a baseline.
 */
export function downloadFile(content, filename, mime = "text/plain") {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
