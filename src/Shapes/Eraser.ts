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
   // @ts-ignore
  isMouseNearEdge(currentMousePosition: IPoint): string | boolean | null {
    return null;
  }
   // @ts-ignore
  isMouseWithinShape(currentMousePosition: IPoint): boolean {
    return false;
  }
   // @ts-ignore
  reSize(...args: any): void {}
   // @ts-ignore
  move(dx: number, dy: number): void {}
}
