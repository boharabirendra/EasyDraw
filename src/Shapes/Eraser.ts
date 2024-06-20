import { IPoint, SHAPES } from "../Utils/Common";
import { Shape } from "./Shape";

export class Eraser extends Shape {
  path: IPoint[];

  constructor(start: IPoint) {
    super(start, SHAPES.ERASER);
    this.path = [start];
  }

  addPoint(point: IPoint) {
    this.path.push(point);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (this.path.length < 2) return;
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 14;
    ctx.moveTo(this.path[0].posX, this.path[0].posY);
    for (let i = 1; i < this.path.length; i++) {
      ctx.lineTo(this.path[i].posX, this.path[i].posY);
    }
    ctx.stroke();
    ctx.restore();
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
  //@ts-ignore
  drawOutline(ctx: CanvasRenderingContext2D): void {}
}
