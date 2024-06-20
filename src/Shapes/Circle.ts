import { EDGE_DETECTION_WIDTH } from "../Constants/Constants";
import { IPoint, SHAPES } from "../Utils/Common";
import { Shape } from "./Shape";

export class Circle extends Shape {
  radius: number;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;

  constructor(position: IPoint, radius: number, fillColor = "transparent", strokeColor = "black", strokeWidth = 2) {
    super(position, SHAPES.CIRCLE);
    this.radius = radius;
    this.fillColor = fillColor;
    this.strokeColor = strokeColor;
    this.strokeWidth = strokeWidth;
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
    ctx.strokeStyle = this.strokeColor;
    ctx.stroke();
    ctx.restore();
  }

  isMouseWithinShape(point: IPoint): boolean {
    const dx = point.posX - this.position.posX;
    const dy = point.posY - this.position.posY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= this.radius;
  }

  isMouseNearEdge(currentMousePosition: IPoint): string | null | boolean {
    const dx = currentMousePosition.posX - this.position.posX;
    const dy = currentMousePosition.posY - this.position.posY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return Math.abs(distance - this.radius) < EDGE_DETECTION_WIDTH;
  }

  reSize(...args: any): void {
    const [currentMousePosition] = args;
    const x = currentMousePosition.posX - this.position.posX;
    const y = currentMousePosition.posY - this.position.posY;
    this.radius = Math.sqrt(x * x + y * y);
  }

  static createFromRadius(position: IPoint, radius: number): Circle {
    return new Circle(position, radius);
  }

  move(dx: number, dy: number): void {
    this.position.posX += dx;
    this.position.posY += dy;
  }
}
