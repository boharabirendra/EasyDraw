import { EDGE_DETECTION_WIDTH } from "../Constants/Constants";
import { IPoint, SHAPES } from "../Utils/Common";
import { Shape } from "./Shape";

export class Circle extends Shape {
  private radius: number;

  constructor(position: IPoint, radius: number) {
    super(position, SHAPES.CIRCLE);
    this.radius = radius;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.fillStyle = "gray"
    ctx.arc(
      this.position.posX,
      this.position.posY,
      this.radius,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.stroke();
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

  reSize(...args:any[]): void {
    const x = args[0]?.posX! - this.position.posX;
    const y = args[0]?.posY! - this.position.posY;
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
