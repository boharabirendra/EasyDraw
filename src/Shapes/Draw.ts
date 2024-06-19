import { IPoint, SHAPES } from "../Utils/Common";
import { Shape } from "./Shape";

export class Draw extends Shape {
  path: IPoint[];

  constructor(start: IPoint) {
    super(start, SHAPES.DRAW);
    this.path = [start];
  }

  addPoint(point: IPoint) {
    this.path.push(point);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (this.path.length < 2) return;
    ctx.beginPath();
    ctx.strokeStyle = "green";
    ctx.lineWidth = 14;
    ctx.moveTo(this.path[0].posX, this.path[0].posY);
    for (let i = 1; i < this.path.length; i++) {
      ctx.lineTo(this.path[i].posX, this.path[i].posY);
    }
    ctx.stroke();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
  }

  isMouseWithinShape(currentMousePosition: IPoint): boolean {
    return false;
  }

  isMouseNearEdge(currentMousePosition: IPoint): string | boolean | null {
    return null;
  }

  move(dx: number, dy: number): void {}
  reSize(...args: any): void {}
}
