import { toPng } from "html-to-image";
import jsPDF from "jspdf";

const EXPORT_OPTIONS = {
  backgroundColor: "#11201c",
  pixelRatio: 2,
  skipFonts: true,
};

/**
 * The weekly grid / daily agenda use a scrollable inner container
 * (max-height + overflow-y-auto) so the page doesn't get huge. That's
 * great for normal viewing but means html-to-image only sees whatever
 * is currently scrolled into view. To export the FULL 24-hour grid, we
 * temporarily remove the height cap and scrolling, capture the image,
 * then restore the original styles so the on-screen view is unaffected.
 */
async function captureFullElement(node) {
  const scrollEl = node.querySelector("[data-export-scroll]");
  const original = scrollEl
    ? { maxHeight: scrollEl.style.maxHeight, overflowY: scrollEl.style.overflowY }
    : null;

  if (scrollEl) {
    scrollEl.style.maxHeight = "none";
    scrollEl.style.overflowY = "visible";
  }

  try {
    const dataUrl = await toPng(node, EXPORT_OPTIONS);
    return dataUrl;
  } finally {
    if (scrollEl && original) {
      scrollEl.style.maxHeight = original.maxHeight;
      scrollEl.style.overflowY = original.overflowY;
    }
  }
}

export async function exportToPng(elementRef, filename = "weekly-schedule.png") {
  const node = elementRef.current;
  if (!node) throw new Error("Grid element not found");
  const dataUrl = await captureFullElement(node);
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

export async function exportToPdf(elementRef, filename = "weekly-schedule.pdf") {
  const node = elementRef.current;
  if (!node) throw new Error("Grid element not found");
  const dataUrl = await captureFullElement(node);
  const img = new Image();
  img.src = dataUrl;
  await new Promise((resolve) => (img.onload = resolve));
  const pdf = new jsPDF({
    orientation: img.width > img.height ? "landscape" : "portrait",
    unit: "px",
    format: [img.width, img.height],
  });
  pdf.addImage(dataUrl, "PNG", 0, 0, img.width, img.height);
  pdf.save(filename);
}
