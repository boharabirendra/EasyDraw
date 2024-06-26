import { Shape } from "../Shapes/Shape";

export function exportSelectedShape(
  ctx: CanvasRenderingContext2D,
  selectedShape: Shape
) {
  const exportedImage = document.getElementById(
    "exportedImage"
  ) as HTMLImageElement;
  const tempCanvas = document.createElement("canvas") as HTMLCanvasElement;
  const tempContext = tempCanvas.getContext("2d")!;
  tempCanvas.width = ctx.canvas.width;
  tempCanvas.height = ctx.canvas.height;
  selectedShape.isSelected = false;
  selectedShape.draw(tempContext);
  const imageData = tempCanvas.toDataURL("image/png");
  exportedImage.src = imageData;
  const downloadLink = document.createElement("a");
  downloadLink.href = imageData;
  downloadLink.download = "selected_shapes.png";
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}
