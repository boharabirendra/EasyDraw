import { Shape } from "../Shapes/Shape";

export function deleteSelectedShapes(
  shapes: Shape[],
  selectedShapeIndex: number
) {
  if (selectedShapeIndex < 0 || selectedShapeIndex > shapes.length) return;
  shapes.splice(selectedShapeIndex, 1);
  console.log(shapes);
}
