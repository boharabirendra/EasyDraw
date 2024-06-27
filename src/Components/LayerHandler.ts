import { Shape } from "../Shapes/Shape";

export function sendToBack(shapes: Shape[], selectedShapeIndex: number) {
  if (selectedShapeIndex <= 0) return;
  const [selectedShape] = shapes.splice(selectedShapeIndex, 1);
  shapes.unshift(selectedShape);
}

export function sendBackward(shapes: Shape[], selectedShapeIndex: number) {
  if (selectedShapeIndex <= 0) return;
  const selectedShape = shapes[selectedShapeIndex];
  shapes[selectedShapeIndex] = shapes[selectedShapeIndex - 1];
  shapes[selectedShapeIndex - 1] = selectedShape;
}

export function bringForward(shapes: Shape[], selectedShapeIndex: number) {
  if (selectedShapeIndex >= (shapes.length - 1)) return;
  const selectedShape = shapes[selectedShapeIndex];
  shapes[selectedShapeIndex] = shapes[selectedShapeIndex + 1];
  shapes[selectedShapeIndex + 1] = selectedShape;
}



export function bringToFront(shapes: Shape[], selectedShapeIndex: number) {
    if (selectedShapeIndex >= (shapes.length - 1)) return;
    const [selectedShape] = shapes.splice(selectedShapeIndex, 1);
    shapes.push(selectedShape);
}
