import { EDGE_DETECTION_WIDTH, SELECTED_SHAPE_INDICATOR_CIRCLE_RADIUS } from "../Constants/Constants";
import {
  IDimension,
  IPoint,
  SHAPES,
  getLeftBottomCircleCenter,
  getLeftTopCircleCenter,
  getRightBottomCircleCenter,
  getRightTopCircleCenter,
  selectionIndicateCircle,
  selectionIndicateRectangle,
} from "../Utils/Common";
import { Shape } from "./Shape";

export class Circle extends Shape {
  radius: number;
  isSelected: boolean = false;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  strokeStyle: number[];

  constructor(
    position: IPoint,
    radius: number,
    fillColor = "transparent",
    strokeColor = "black",
    strokeWidth = 2,
    strokeStyle: number[] = [],
  ) {
    super(position, SHAPES.CIRCLE);
    this.radius = radius;
    this.fillColor = fillColor;
    this.strokeColor = strokeColor;
    this.strokeWidth = strokeWidth;
    this.strokeStyle = strokeStyle
  }

  draw(ctx: CanvasRenderingContext2D) {

    ctx.save();
    ctx.beginPath();
    ctx.arc(
      this.position.posX,
      this.position.posY,
      this.radius,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = this.fillColor;
    ctx.fill();
    ctx.lineWidth = this.strokeWidth;
    ctx.setLineDash(this.strokeStyle);
    ctx.strokeStyle = this.strokeColor;
    ctx.stroke();
    ctx.restore();
    if(this.isSelected){
      this.drawOutline(ctx);
    }
  }

  setPosition(scale: number){
    this.position.posX = this.position.posX * scale;
    this.position.posY = this.position.posY * scale;
  }
  setRadius(scale: number){
    this.radius = this.radius * scale;
  }

  getCenter():IPoint{
    return this.position;
  }

  setIsSelected(value: boolean): void{
    this.isSelected = value;
  }

  drawOutline(ctx: CanvasRenderingContext2D): void {
    const position: IPoint = {
      posX: this.position.posX - this.radius,
      posY: this.position.posY - this.radius,
    };
    const dimension: IDimension = {
      width: this.radius * 2,
      height: this.radius * 2,
    };

    selectionIndicateRectangle(ctx, position, dimension);
    const leftTopCircleCenter: IPoint = getLeftTopCircleCenter(position);
    const leftBottomCircle: IPoint = getLeftBottomCircleCenter(
      position,
      dimension
    );
    const rightTopCircle: IPoint = getRightTopCircleCenter(position, dimension);
    const rightBottomCircle: IPoint = getRightBottomCircleCenter(
      position,
      dimension
    );
    selectionIndicateCircle(ctx, leftTopCircleCenter, SELECTED_SHAPE_INDICATOR_CIRCLE_RADIUS);
    selectionIndicateCircle(ctx, leftBottomCircle, SELECTED_SHAPE_INDICATOR_CIRCLE_RADIUS);
    selectionIndicateCircle(ctx, rightTopCircle, SELECTED_SHAPE_INDICATOR_CIRCLE_RADIUS);
    selectionIndicateCircle(ctx, rightBottomCircle, SELECTED_SHAPE_INDICATOR_CIRCLE_RADIUS);
  }

  isMouseWithinShape(point: IPoint): boolean {
    const dx = point.posX - this.position.posX;
    const dy = point.posY - this.position.posY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= this.radius;
  }
  
isMouseNearEdge(currentMousePosition: IPoint): string | null {
  const rectLeft = this.position.posX - this.radius;
  const rectRight = this.position.posX + this.radius;
  const rectTop = this.position.posY - this.radius;
  const rectBottom = this.position.posY + this.radius;

  const xNearLeft = Math.abs(currentMousePosition.posX - rectLeft) <= EDGE_DETECTION_WIDTH;
  const xNearRight = Math.abs(currentMousePosition.posX - rectRight) <= EDGE_DETECTION_WIDTH;
  const yNearTop = Math.abs(currentMousePosition.posY - rectTop) <= EDGE_DETECTION_WIDTH;
  const yNearBottom = Math.abs(currentMousePosition.posY - rectBottom) <= EDGE_DETECTION_WIDTH;

  if (xNearLeft && yNearTop) return "top-left";
  if (xNearRight && yNearTop) return "top-right";
  if (xNearLeft && yNearBottom) return "bottom-left";
  if (xNearRight && yNearBottom) return "bottom-right";
  if (xNearLeft) return "left";
  if (xNearRight) return "right";
  if (yNearTop) return "top";
  if (yNearBottom) return "bottom";

  return null;
}


  reSize(...args: any): void {
    const [currentMousePosition] = args;
    const x = currentMousePosition.posX - this.position.posX;
    const y = currentMousePosition.posY - this.position.posY;
    this.radius = Math.sqrt(x * x + y * y);
  }

  static generateCircle(position: IPoint, radius: number,  fillColor: string,
    strokeColor: string,
    strokeWidth: number,
    strokeStyle: number[]): Circle {
    return new Circle(position, radius,  fillColor, strokeColor, strokeWidth, strokeStyle);
  }

  move(dx: number, dy: number): void {
    this.position.posX += dx;
    this.position.posY += dy;
  }
}
