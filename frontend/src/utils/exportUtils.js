import { toPng } from "html-to-image";
import jsPDF from "jspdf";

const EXPORT_OPTIONS = {
  backgroundColor: "#11201c",
  pixelRatio: 2,
  skipFonts: true,
};

export async function exportToPng(elementRef, filename = "weekly-schedule.png") {
  const node = elementRef.current;
  if (!node) throw new Error("Grid element not found");
  const dataUrl = await toPng(node, EXPORT_OPTIONS);
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

export async function exportToPdf(elementRef, filename = "weekly-schedule.pdf") {
  const node = elementRef.current;
  if (!node) throw new Error("Grid element not found");
  const dataUrl = await toPng(node, EXPORT_OPTIONS);
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
