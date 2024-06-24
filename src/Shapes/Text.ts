import { SELECTED_SHAPE_INDICATOR_CIRCLE_RADIUS } from "../Constants/Constants";
import {
  IDimension,
  IPoint,
  SHAPES,
  getLeftBottomCircleCenter,
  getLeftTopCircleCenter,
  getRightBottomCircleCenter,
  getRightTopCircleCenter,
  selectionIndicateCircle,
  selectionIndicateRectangle,
} from "../Utils/Common";
import { Shape } from "./Shape";

export class Text extends Shape {
  text: string;
  fontColor: string;
  isSelected: boolean = false;
  boundingBox: { x: number; y: number; width: number; height: number };

  constructor(
    position: IPoint,
    text: string,
    boundingBox: { x: number; y: number; width: number; height: number },
    fontColor: string = "black"
  ) {
    super(position, SHAPES.TEXT);
    this.text = text;
    this.boundingBox = boundingBox;
    this.fontColor = fontColor;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.font = "24px Virgil";
    ctx.fillStyle = this.fontColor;
    ctx.fillText(this.text, this.position.posX, this.position.posY + 16);
    if (this.isSelected) {
      this.drawOutline(ctx);
    }
  }

  drawOutline(ctx: CanvasRenderingContext2D): void {
    const position: IPoint = {
      posX: this.boundingBox.x - 5,
      posY: this.boundingBox.y + 14,
    };
    const dimension: IDimension = {
      width: this.boundingBox.width + 10,
      height: this.boundingBox.height + 14,
    };

    selectionIndicateRectangle(ctx, position, dimension);

    const leftTopCircleCenter: IPoint = getLeftTopCircleCenter(position);
    const leftBottomCircle: IPoint = getLeftBottomCircleCenter(
      position,
      dimension
    );
    const rightTopCircle: IPoint = getRightTopCircleCenter(position, dimension);
    const rightBottomCircle: IPoint = getRightBottomCircleCenter(
      position,
      dimension
    );
    selectionIndicateCircle(
      ctx,
      leftTopCircleCenter,
      SELECTED_SHAPE_INDICATOR_CIRCLE_RADIUS
    );
    selectionIndicateCircle(
      ctx,
      leftBottomCircle,
      SELECTED_SHAPE_INDICATOR_CIRCLE_RADIUS
    );
    selectionIndicateCircle(
      ctx,
      rightTopCircle,
      SELECTED_SHAPE_INDICATOR_CIRCLE_RADIUS
    );
    selectionIndicateCircle(
      ctx,
      rightBottomCircle,
      SELECTED_SHAPE_INDICATOR_CIRCLE_RADIUS
    );
  }

  setIsSelected(value: boolean): void {
    this.isSelected = value;
  }

  isMouseWithinShape(point: IPoint): boolean {
    return (
      point.posX >= this.boundingBox.x &&
      point.posX <= this.boundingBox.x + this.boundingBox.width &&
      point.posY >= this.boundingBox.y + 16 &&
      point.posY <= this.boundingBox.y + 16 + this.boundingBox.height
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
