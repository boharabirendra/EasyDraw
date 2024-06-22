import { IPoint, SHAPES } from "../Utils/Common";
import { Shape } from "./Shape";

export class Draw extends Shape {
  path: IPoint[];
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;

  constructor(
    start: IPoint,
    strokeColor = "black",
    strokeWidth = 16,
    fillColor = "transparent"
  ) {
    super(start, SHAPES.DRAW);
    this.path = [start];
    this.fillColor = fillColor;
    this.strokeColor = strokeColor;
    this.strokeWidth = strokeWidth;
  }

  addPoint(point: IPoint) {
    this.path.push(point);
  }

  setStrokeColor(color: string) {
    this.strokeColor = color;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (this.path.length < 2) return;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(this.path[0].posX, this.path[0].posY);
    for (let i = 1; i < this.path.length; i++) {
      ctx.lineTo(this.path[i].posX, this.path[i].posY);
    }
    ctx.lineWidth = this.strokeWidth;
    ctx.strokeStyle = this.strokeColor;
    ctx.stroke();
    ctx.restore();
  }
  // @ts-ignore
  isMouseWithinShape(currentMousePosition: IPoint): boolean {
    return false;
  }
  // @ts-ignore
  isMouseNearEdge(currentMousePosition: IPoint): string | boolean | null {
    return null;
  }
  // @ts-ignore
  move(dx: number, dy: number): void {}
  // @ts-ignore
  reSize(...args: any): void {}
  //@ts-ignore
  drawOutline(ctx: CanvasRenderingContext2D): void {}
  //@ts-ignore
  setIsSelected(value: boolean): void {}
}
