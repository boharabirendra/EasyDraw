import { ArrowLine } from "../Shapes/ArrowLine";
import { Circle } from "../Shapes/Circle";
import { Draw } from "../Shapes/Draw";
import { Line } from "../Shapes/Line";
import { Rectangle } from "../Shapes/Rectangle";
import { Shape } from "../Shapes/Shape";
import { Text } from "../Shapes/Text";
import { IPoint, SHAPES } from "../Utils/Common";

export function getDataFromLocalStorage(): Shape[] | null {

  const savedData = localStorage.getItem("savedData");
  if (savedData) {
    const shapes:any[] = JSON.parse(savedData);
    const savedShapes: any[] = [];
    shapes.forEach((shape) => {
      if (shape._shapeType === SHAPES.RECTANGLE) {
        savedShapes.push(
          new Rectangle(
            shape._position,
            shape.dimension,
            shape._fillColor,
            shape._strokeColor,
            shape._strokeWidth,
            shape._strokeStyle
          )
        );
      } else if (shape._shapeType === SHAPES.CIRCLE) {
        savedShapes.push(
          new Circle(
            shape._position,
            shape.radius,
            shape._fillColor,
            shape._strokeColor,
            shape._strokeWidth,
            shape._strokeStyle
          )
        );
      } else if (shape._shapeType === SHAPES.LINE) {
        savedShapes.push(
          new Line(
            shape._position,
            shape.end,
            shape._fillColor,
            shape._strokeColor,
            shape._strokeWidth,
            shape._strokeStyle
          )
        );
      } else if (
        shape._shapeType === SHAPES.ARROW 
      ) {
        savedShapes.push(
          new ArrowLine(
            shape._position,
            shape.end,
            shape._fillColor,
            shape._strokeColor,
            shape._strokeWidth,
            shape._strokeStyle
          )
        );
      } else if (shape._shapeType === SHAPES.TEXT) {
        savedShapes.push(
          new Text(
            shape._position,
            shape.text,
            shape.boundingBox,
            shape._strokeColor
          )
        );
      } else if (shape._shapeType === SHAPES.DRAW) {
        const newDraw = new Draw(
          shape._position,
          shape._strokeColor,
          shape._strokeWidth
        );
        shape.path.forEach((path: IPoint) => newDraw.addPoint(path));
        savedShapes.push(newDraw);
      }
    });
    return savedShapes as Shape[];
  }
  return null;
}
