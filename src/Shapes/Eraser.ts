import { IPoint, SHAPES } from "../Utils/Common";
import { Shape } from "./Shape";

export class Eraser extends Shape {
  private end: IPoint;

  constructor(start: IPoint, end: IPoint) {
    super(start, SHAPES.ERASER);
    this.end = end;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(
      this.position.posX,
      this.position.posY,
      this.end.posX - this.position.posX,
      this.end.posY - this.position.posY
    );
  }
  isMouseNearEdge(currentMousePosition: IPoint): string | boolean | null {
    return null;
  }
  isMouseWithinShape(currentMousePosition: IPoint): boolean {
    return false;
  }
  reSize(...args: any): void {}
  move(dx: number, dy: number): void {}
}
