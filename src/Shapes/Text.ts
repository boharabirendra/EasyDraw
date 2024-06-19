import { IPoint, SHAPES } from "../Utils/Common";
import { Shape } from "./Shape";

export class Text extends Shape {
  private text: string;
  private boundingBox: { x: number; y: number; width: number; height: number };

  constructor(
    position: IPoint,
    text: string,
    boundingBox: { x: number; y: number; width: number; height: number }
  ) {
    super(position, SHAPES.TEXT);
    this.text = text;
    this.boundingBox = boundingBox;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillText(this.text, this.position.posX, this.position.posY);
  }

  isMouseWithinShape(point: IPoint): boolean {
    return (
      point.posX >= this.boundingBox.x &&
      point.posX <= this.boundingBox.x + this.boundingBox.width &&
      point.posY >= this.boundingBox.y &&
      point.posY <= this.boundingBox.y + this.boundingBox.height
    );
  }

  move(dx: number, dy: number): void {
    this.position.posX += dx;
    this.position.posY += dy;
    this.boundingBox.x += dx;
    this.boundingBox.y += dy;
  }
  // @ts-ignore
  isMouseNearEdge(currentMousePosition: IPoint): string | boolean | null {
    return null;
  }
   // @ts-ignore
  reSize(...args: any): void {}
}
