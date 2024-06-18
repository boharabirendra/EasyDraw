import { IPoint } from "../Utils/Common";
import { Shape } from "./Shape";

export class Eraser extends Shape{
    private end: IPoint;
  
    constructor(start: IPoint, end: IPoint) {
      super(start);
      this.end = end;
    }
  
    draw(ctx: CanvasRenderingContext2D) {
      ctx.clearRect(this.position.posX, this.position.posY, this.end.posX - this.position.posX, this.end.posY - this.position.posY);
    }
  }
  