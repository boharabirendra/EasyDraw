import { IPoint, SHAPES } from "../Utils/Common";
import { Shape } from "./Shape";

export class Draw extends Shape {
  path: IPoint[];

  constructor(start: IPoint, strokeColor = "black", strokeWidth = 16) {
    super(start, SHAPES.DRAW, "", strokeColor, strokeWidth, []);
    this.path = [start];
    this.strokeColor = strokeColor;
    this.strokeWidth = strokeWidth;
  }

  addPoint(point: IPoint) {
    this.path.push(point);
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

  isMouseWithinShape(currentMousePosition: IPoint): boolean {
    const tempCanvas = document.createElement("canvas");
    const tempContext = tempCanvas.getContext("2d")!;
    tempCanvas.width = 1;
    tempCanvas.height = 1;

    tempContext.beginPath();
    tempContext.moveTo(this.path[0].posX, this.path[0].posY);
    for (let i = 1; i < this.path.length; i++) {
      tempContext.lineTo(this.path[i].posX, this.path[i].posY);
    }
    tempContext.lineWidth = this.strokeWidth;
    tempContext.strokeStyle = this.strokeColor;
    tempContext.stroke();

    return tempContext.isPointInStroke(
      currentMousePosition.posX,
      currentMousePosition.posY
    );
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
