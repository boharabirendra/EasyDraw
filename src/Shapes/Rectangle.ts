import { EDGE_DETECTION_WIDTH, SELECTED_SHAPE_INDICATOR_CIRCLE_RADIUS } from "../Constants/Constants";
import { IPoint, IDimension, SHAPES, selectionIndicateCircle, getLeftTopCircleCenter, getLeftBottomCircleCenter, getRightTopCircleCenter, getRightBottomCircleCenter } from "../Utils/Common";
import { Shape } from "./Shape";

export class Rectangle extends Shape {
  dimension: IDimension;
  static isSelected: boolean = false;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;

  constructor(position: IPoint, dimension: IDimension, fillColor = "transparent", strokeColor = "black", strokeWidth = 2) {
    super(position, SHAPES.RECTANGLE);
    this.dimension = dimension;
    this.fillColor = fillColor;
    this.strokeColor = strokeColor;
    this.strokeWidth = strokeWidth;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.beginPath();
    ctx.rect(
      this.position.posX,
      this.position.posY,
      this.dimension.width,
      this.dimension.height
    );
    ctx.fillStyle = this.fillColor;
    ctx.fill();
    ctx.lineWidth = this.strokeWidth;
    ctx.strokeStyle = this.strokeColor;
    ctx.stroke();
    ctx.restore();
    if(Rectangle.isSelected){
      this.drawOutline(ctx);
    }
  }

  drawOutline(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.beginPath();
    ctx.rect(
      this.position.posX - 2,
      this.position.posY - 2,
      this.dimension.width + 4,
      this.dimension.height + 4,
    );
    ctx.lineWidth = 2;
    ctx.strokeStyle = "gray";
    ctx.stroke();
    ctx.restore();
    const leftTopCircleCenter:IPoint = getLeftTopCircleCenter(this.position);
    const leftBottomCircle:IPoint = getLeftBottomCircleCenter(this.position, this.dimension);
    const rightTopCircle: IPoint = getRightTopCircleCenter(this.position, this.dimension);
    const rightBottomCircle: IPoint = getRightBottomCircleCenter(this.position, this.dimension);
    selectionIndicateCircle(ctx,leftTopCircleCenter, SELECTED_SHAPE_INDICATOR_CIRCLE_RADIUS)
    selectionIndicateCircle(ctx,leftBottomCircle, SELECTED_SHAPE_INDICATOR_CIRCLE_RADIUS)
    selectionIndicateCircle(ctx,rightTopCircle, SELECTED_SHAPE_INDICATOR_CIRCLE_RADIUS)
    selectionIndicateCircle(ctx,rightBottomCircle, SELECTED_SHAPE_INDICATOR_CIRCLE_RADIUS)
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

  reSize(...args:any) {
    const [edge, dx, dy] = args;
    switch (edge) {
      case "left":
        this.position.posX += dx;
        this.dimension.width -= dx;
        break;
      case "right":
        this.dimension.width += dx;
        break;
      case "top":
        this.position.posY += dy;
        this.dimension.height -= dy;
        break;
      case "bottom":
        this.dimension.height += dy;
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
