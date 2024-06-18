import { EDGE_DETECTION_WIDTH } from "../Constants/Constants";
import { IPoint, IDimension, SHAPES } from "../Utils/Common";
import { Shape } from "./Shape";

export class Rectangle extends Shape {
  dimension: IDimension;

  constructor(position: IPoint, dimension: IDimension) {
    super(position, SHAPES.RECTANGLE);
    this.dimension = dimension;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.fillStyle = "green";
    ctx.rect(
      this.position.posX,
      this.position.posY,
      this.dimension.width,
      this.dimension.height
    );
    ctx.fill();
    ctx.stroke();
  }

  isMouseWithinShape(point: IPoint): boolean {
    return (
      point.posX >= this.position.posX &&
      point.posX <= this.position.posX + this.dimension.width &&
      point.posY >= this.position.posY &&
      point.posY <= this.position.posY + this.dimension.height
    );
  }

  isMouseNearEdge(currentMousePosition: IPoint): string | null {
    if (
      Math.abs(currentMousePosition.posX - this.position.posX) <=
      EDGE_DETECTION_WIDTH
    )
      return "left";
    if (
      Math.abs(
        currentMousePosition.posX - (this.position.posX + this.dimension.width)
      ) <= EDGE_DETECTION_WIDTH
    )
      return "right";
    if (
      Math.abs(currentMousePosition.posY - this.position.posY) <=
      EDGE_DETECTION_WIDTH
    )
      return "top";
    if (
      Math.abs(
        currentMousePosition.posY - (this.position.posY + this.dimension.height)
      ) <= EDGE_DETECTION_WIDTH
    )
      return "bottom";
    return null;
  }

  reSize(...args:any[]) {
    switch (args[0]) {
      case "left":
        this.position.posX += args[1];
        this.dimension.width -= args[1];
        break;
      case "right":
        this.dimension.width += args[1];
        break;
      case "top":
        this.position.posY += args[2];
        this.dimension.height -= args[2];
        break;
      case "bottom":
        this.dimension.height += args[2];
        break;
    }
  }

  static generateShape(start: IPoint, end: IPoint): Rectangle {
    const width = end.posX - start.posX;
    const height = end.posY - start.posY;
    return new Rectangle(start, { width, height });
  }

  move(dx: number, dy: number): void {
    this.position.posX += dx;
    this.position.posY += dy;
  }
}
