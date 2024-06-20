import { DIMENSION } from "../Constants/Constants";
import { ArrowLine } from "../Shapes/ArrowLine";
import { Circle } from "../Shapes/Circle";
import { Eraser } from "../Shapes/Eraser";
import { Line } from "../Shapes/Line";
import { Rectangle } from "../Shapes/Rectangle";
import { Shape } from "../Shapes/Shape";
import { Text } from "../Shapes/Text";
import { Draw } from "../Shapes/Draw";
import { IPoint, SHAPES, adjustToolSection } from "../Utils/Common";
import {
  body,
  highlightCurrentSelectedTool,
} from "../Utils/HighlightSelectedTool";

export class Canvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private shapes: Shape[] = [];
  private isDrawing: boolean = false;
  private isDragging: boolean = false;
  private currentEraser?: Eraser;
  private isErasing: boolean = false;
  private dragStartPosition: IPoint = { posX: 0, posY: 0 };
  private startPosition: IPoint = { posX: 0, posY: 0 };
  private startResizingPosition: IPoint = { posX: 0, posY: 0 };
  private currentShape: SHAPES = SHAPES.CURSOR;
  private selectedShape: Shape | undefined = undefined;
  private resizeEdge: string | null | boolean = null;
  private isResizing: boolean = false;
  private redoStack: Shape[] = [];
  private currentDrawing?: Draw;
  private isUndoStart: boolean = false;
  private sizeOfShapesAtUndoStart: number = 0;
  private selectedShapeForDeletion: { index: number; shape: Shape }[] = [];
  private selectedShapeIndex: number | null = null;
  private toBeColorChangeShape: Shape | undefined = undefined;
  private drawingColor: string = "black";

  constructor() {
    this.canvas = document.createElement("canvas");
    this.canvas.width = DIMENSION.CANVAS_WIDTH;
    this.canvas.height = DIMENSION.CANVAS_HEIGHT;
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.ctx.font = '24px "Gloria Hallelujah", sans-serif';
    document.getElementById("app")?.appendChild(this.canvas);

    this.init();
    highlightCurrentSelectedTool();
    this.changeShapeColor();

    /* Redo & Undo Events*/
    document
      .querySelector("#undoBtn")
      ?.addEventListener("click", this.undo.bind(this));
    document
      .querySelector("#redoBtn")
      ?.addEventListener("click", this.redo.bind(this));
    document.addEventListener("keydown", this.undoUsingKeyboard.bind(this));
    document.addEventListener("keydown", this.redoUsingKeyboard.bind(this));
    document.addEventListener("keydown", this.deleteSelectedShape.bind(this));
    this.activateRedoUndoBtn(this.shapes, this.redoStack);
  }

  init() {
    this.canvas.addEventListener("mousedown", this.onMouseDown.bind(this));
    this.canvas.addEventListener("mousemove", this.onMouseMove.bind(this));
    this.canvas.addEventListener("mouseup", this.onMouseUp.bind(this));

    document.getElementById("cursorBtn")?.addEventListener("click", () => {
      this.currentShape = SHAPES.CURSOR;
      this.isErasing = false;
    });
    document.getElementById("rectangleBtn")?.addEventListener("click", () => {
      this.currentShape = SHAPES.RECTANGLE;
      this.isErasing = false;
    });
    document.getElementById("circleBtn")?.addEventListener("click", () => {
      this.currentShape = SHAPES.CIRCLE;
      this.isErasing = false;
    });
    document.getElementById("lineBtn")?.addEventListener("click", () => {
      this.currentShape = SHAPES.LINE;
      this.isErasing = false;
    });
    document.getElementById("arrowBtn")?.addEventListener("click", () => {
      this.currentShape = SHAPES.ARROW;
    });
    document.getElementById("drawBtn")?.addEventListener("click", () => {
      this.currentShape = SHAPES.DRAW;
      this.isErasing = false;
    });
    document.getElementById("textBtn")?.addEventListener("click", () => {
      this.currentShape = SHAPES.TEXT;
      this.isErasing = false;
    });
    document.getElementById("eraserBtn")?.addEventListener("click", () => {
      this.currentShape = SHAPES.ERASER;
    });
    document.getElementById("clearBtn")?.addEventListener("click", () => {
      this.shapes = [];
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.currentShape = SHAPES.CURSOR;
      adjustToolSection();
      this.isErasing = false;
    });
  }

  onMouseDown(event: MouseEvent) {
    const currentMousePosition = this.getMousePosition(event);
    if (this.currentShape === SHAPES.CURSOR) {
      this.selectedShape = this.shapes.find((shape, index) => {
        if (shape) {
          this.selectedShapeIndex = index;
          return shape.isMouseWithinShape(currentMousePosition);
        }
      });
      this.toBeColorChangeShape = this.selectedShape;
      if (this.selectedShape) {
        this.selectedShapeForDeletion.push({
          index: this.selectedShapeIndex!,
          shape: this.selectedShape,
        });
        this.resizeEdge =
          this.selectedShape.isMouseNearEdge(currentMousePosition);
        if (this.resizeEdge) {
          this.isResizing = true;
          this.startResizingPosition = currentMousePosition;
        } else {
          this.isDragging = true;
          this.dragStartPosition = currentMousePosition;
        }
      }
    } else if (this.currentShape === SHAPES.DRAW) {
      this.isDrawing = true;
      this.currentDrawing = new Draw(currentMousePosition, this.drawingColor);
    } else if (this.currentShape === SHAPES.ERASER) {
      this.isErasing = true;
      this.currentEraser = new Eraser(currentMousePosition);
    } else {
      this.isDrawing = true;
      this.startPosition = currentMousePosition;
    }
  }

  onMouseMove(event: MouseEvent) {
    const position = this.getMousePosition(event);
    /* Changing mouse shape */
    if (this.currentShape === SHAPES.CURSOR) {
      const tempSelectedShape = this.shapes.find((shape) => {
        if (shape) {
          return shape.isMouseWithinShape(position);
        }
      });
      if (tempSelectedShape) {
        body.style.cursor = "move";
        const currentMousePosition = this.getMousePosition(event);
        const edge = tempSelectedShape.isMouseNearEdge(currentMousePosition);
        if (edge) {
          const cursorStyle =
            edge === "left" || edge === "right" ? "ew-resize" : "ns-resize";
          body.style.cursor = cursorStyle;
        }
      } else {
        body.style.cursor = "default";
      }
    }
    if (this.isDragging && this.selectedShape) {
      const dx = position.posX - this.dragStartPosition.posX;
      const dy = position.posY - this.dragStartPosition.posY;
      this.selectedShape.move(dx, dy);
      this.dragStartPosition = position; /* Store previous mouse position */
      this.displayAllShapes();
    } else if (this.isErasing) {
      if (this.currentEraser) {
        this.currentEraser.addPoint(position);
        this.currentEraser.draw(this.ctx);
      }
    } else if (this.isDrawing) {
      this.displayAllShapes();
      switch (this.currentShape) {
        case SHAPES.RECTANGLE:
          this.drawRectangle(position);
          break;
        case SHAPES.CIRCLE:
          this.drawCircle(position);
          break;
        case SHAPES.LINE:
          this.drawLine(position);
          break;
        case SHAPES.ARROW:
          this.drawArrowLine(position);
          break;
        case SHAPES.DRAW:
          if (this.currentDrawing) {
            this.currentDrawing.addPoint(position);
            this.currentDrawing.draw(this.ctx);
          }
          break;
        case SHAPES.TEXT:
          this.drawText(position);
          break;
      }
    } else if (this.isResizing) {
      const dx = position.posX - this.startResizingPosition.posX;
      const dy = position.posY - this.startResizingPosition.posY;
      switch (this.selectedShape?.shapeType) {
        case SHAPES.RECTANGLE:
          this.selectedShape?.reSize(this.resizeEdge, dx, dy);
          this.startResizingPosition = position;
          this.displayAllShapes();
          break;
        case SHAPES.CIRCLE:
          this.selectedShape?.reSize(position);
          this.startResizingPosition = position;
          this.displayAllShapes();
          break;
        case SHAPES.LINE:
          this.selectedShape?.reSize(this.resizeEdge, position);
          this.startResizingPosition = position;
          this.displayAllShapes();
          break;
        case SHAPES.ARROW:
          this.selectedShape?.reSize(this.resizeEdge, position);
          this.startResizingPosition = position;
          this.displayAllShapes();
          break;
      }
    }
    this.activateRedoUndoBtn(this.shapes, this.redoStack);
  }

  onMouseUp(event: MouseEvent) {
    const position = this.getMousePosition(event);
    if (this.isDragging) {
      this.isDragging = false;
      this.selectedShape = undefined;
    } else if (this.isDrawing) {
      this.isDrawing = false;
      switch (this.currentShape) {
        case SHAPES.RECTANGLE:
          this.drawRectangle(position, true);
          adjustToolSection();
          this.currentShape = SHAPES.CURSOR;
          break;
        case SHAPES.CIRCLE:
          this.drawCircle(position, true);
          adjustToolSection();
          this.currentShape = SHAPES.CURSOR;
          break;
        case SHAPES.LINE:
          this.drawLine(position, true);
          adjustToolSection();
          this.currentShape = SHAPES.CURSOR;
          break;
        case SHAPES.ARROW:
          this.drawArrowLine(position, true);
          adjustToolSection();
          this.currentShape = SHAPES.CURSOR;
          break;
        case SHAPES.DRAW:
          if (this.currentDrawing) {
            this.shapes.push(this.currentDrawing);
          }
          break;
        case SHAPES.TEXT:
          this.drawText(position);
          adjustToolSection();
          this.currentShape = SHAPES.CURSOR;
          break;
      }
    } else if (this.isResizing) {
      this.isResizing = false;
      this.resizeEdge = null;
    }
    /* Clear redo stack if shapes added after undo */
    if (this.shapes.length > this.sizeOfShapesAtUndoStart) {
      this.redoStack = [];
    }
  }

  private clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private getMousePosition(event: MouseEvent): IPoint {
    return {
      posX: event.offsetX,
      posY: event.offsetY,
    };
  }

  /* Draw rectangle */
  private drawRectangle(
    currentMousePosition: IPoint,
    finalize: boolean = false
  ) {
    const width = currentMousePosition.posX - this.startPosition.posX;
    const height = currentMousePosition.posY - this.startPosition.posY;
    if (!finalize) {
      const rect = new Rectangle(this.startPosition, { width, height });
      rect.draw(this.ctx);
    } else {
      const newRect = Rectangle.generateShape(
        this.startPosition,
        currentMousePosition
      );
      this.shapes.push(newRect);
      newRect.draw(this.ctx);
    }
  }

  /*Draw circle*/
  private drawCircle(center: IPoint, finalize: boolean = false) {
    const radius = Math.sqrt(
      Math.pow(center.posX - this.startPosition.posX, 2) +
        Math.pow(center.posY - this.startPosition.posY, 2)
    );

    const adjustedCenter: IPoint = {
      posX: this.startPosition.posX,
      posY: this.startPosition.posY + radius / 2,
    };

    if (!finalize) {
      const circle = new Circle(adjustedCenter, radius);
      circle.draw(this.ctx);
    } else {
      const newCircle = new Circle(adjustedCenter, radius);
      this.shapes.push(newCircle);
      newCircle.draw(this.ctx);
    }
  }

  /* Draw line */
  private drawLine(end: IPoint, finalize: boolean = false) {
    if (!finalize) {
      const line = new Line(this.startPosition, end);
      line.draw(this.ctx);
    } else {
      const newLine = new Line(this.startPosition, {
        posX: end.posX,
        posY: end.posY,
      });
      this.shapes.push(newLine);
      newLine.draw(this.ctx);
    }
  }

  /* Draw arrow line */
  private drawArrowLine(end: IPoint, finalize: boolean = false) {
    if (!finalize) {
      const arrowLine = new ArrowLine(this.startPosition, end);
      arrowLine.draw(this.ctx);
    } else {
      const newArrowLine = new ArrowLine(
        { posX: this.startPosition.posX, posY: this.startPosition.posY },
        { posX: end.posX, posY: end.posY }
      );
      this.shapes.push(newArrowLine);
      newArrowLine.draw(this.ctx);
    }
  }

  /* Draw text */
  private drawText(position: IPoint) {
    const input = document.createElement("input");
    input.type = "text";
    input.style.position = "absolute";
    input.style.border = "none";
    input.style.outline = "none";
    input.style.fontFamily = "Gloria Hallelujah, sans-serif";
    input.style.fontSize = "24px";
    input.style.left = `${position.posX}px`;
    input.style.top = `${position.posY}px`;
    input.style.maxWidth = "50rem";

    document.body.appendChild(input);
    input.focus();

    const onInputBlur = () => {
      const text = input.value;
      if (text) {
        const ctx = this.canvas.getContext("2d");
        if (ctx) {
          ctx.font = '24px "Gloria Hallelujah", sans-serif';
          const textWidth = ctx.measureText(text).width;
          const textHeight = parseInt(ctx.font);

          const boundingBox = {
            x: position.posX,
            y: position.posY - textHeight,
            width: textWidth,
            height: textHeight,
          };

          const newText = new Text(position, text, boundingBox);
          this.shapes.push(newText);
          this.clearCanvas();
          this.shapes.forEach((shape) => shape.draw(this.ctx));
        }
      }
      document.body.removeChild(input);
    };
    input.addEventListener("input", resizeInput);
    resizeInput();
    input.addEventListener("blur", onInputBlur);
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        input.blur();
      }
    });
    function resizeInput() {
      input.style.width = `${input.value.length + 1}ch`;
    }
  }

  /* Undo & Redo */
  private undo() {
    if (this.shapes.length > 0) {
      const lastMomento = this.shapes.pop();
      this.isUndoStart = true;
      if (lastMomento) {
        this.redoStack.push(lastMomento);
        this.displayAllShapes();
      }
      if (this.isUndoStart) {
        this.sizeOfShapesAtUndoStart = this.shapes.length;
      }
    }
  }
  private redo() {
    if (this.redoStack.length > 0) {
      const lastMomento = this.redoStack.pop();
      if (lastMomento) {
        this.shapes.push(lastMomento);
        this.displayAllShapes();
      }
    }
  }
  private undoUsingKeyboard(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === "z") {
      event.preventDefault();
      this.undo();
    }
  }
  private redoUsingKeyboard(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === "y") {
      event.preventDefault();
      this.redo();
    }
  }
  private activateRedoUndoBtn(undoStack: Shape[], redoStack: Shape[]) {
    const undoBtn = document.querySelector("#undoBtn") as HTMLButtonElement;
    const redoBtn = document.querySelector("#redoBtn") as HTMLButtonElement;
    if (undoStack.length === 0) {
      undoBtn.style.opacity = "0.4";
    } else {
      undoBtn.style.opacity = "1";
    }
    if (redoStack.length === 0) {
      redoBtn.style.opacity = "0.4";
    } else {
      redoBtn.style.opacity = "1";
    }
  }
  /* Shape deletion */
  private deleteSelectedShape(event: KeyboardEvent) {
    if (event.key === "Delete") {
      if (this.selectedShapeForDeletion.length > 0) {
        if (this.shapes.length === 1 && this.selectedShapeIndex === 0) {
          this.clearCanvas();
        } else {
          for (
            let i = this.selectedShapeIndex!;
            i <= this.shapes.length - 1;
            i++
          ) {
            this.shapes[i] = this.shapes[i + 1];
          }
          this.displayAllShapes();
        }
      }
    }
  }

  /*Display all shapes*/
  private displayAllShapes() {
    this.clearCanvas();
    this.shapes.forEach((shape) => {
      if (shape) {
        shape.draw(this.ctx);
      }
    });
  }

  /*Change shapes colors*/
  private updateSelectedShapeFillColor(color: string) {
    if (
      this.toBeColorChangeShape &&
      this.toBeColorChangeShape.shapeType === SHAPES.CIRCLE &&
      this.toBeColorChangeShape instanceof Circle
    ) {
      this.toBeColorChangeShape.fillColor = color;
      this.displayAllShapes();
    }
    if (
      this.toBeColorChangeShape &&
      this.toBeColorChangeShape.shapeType === SHAPES.RECTANGLE &&
      this.toBeColorChangeShape instanceof Rectangle
    ) {
      this.toBeColorChangeShape.fillColor = color;
      this.displayAllShapes();
    }
  }
  private updateSelectedShapeStrokeColor(color: string) {
    if (
      this.toBeColorChangeShape &&
      this.toBeColorChangeShape.shapeType === SHAPES.CIRCLE &&
      this.toBeColorChangeShape instanceof Circle
    ) {
      this.toBeColorChangeShape.strokeColor = color;
      this.displayAllShapes();
    }
    if (
      this.toBeColorChangeShape &&
      this.toBeColorChangeShape.shapeType === SHAPES.RECTANGLE &&
      this.toBeColorChangeShape instanceof Rectangle
    ) {
      this.toBeColorChangeShape.strokeColor = color;
      this.displayAllShapes();
    }
    if (
      this.toBeColorChangeShape &&
      this.toBeColorChangeShape.shapeType === SHAPES.LINE &&
      this.toBeColorChangeShape instanceof Line
    ) {
      this.toBeColorChangeShape.strokeColor = color;
      this.displayAllShapes();
    }
    if (
      this.toBeColorChangeShape &&
      this.toBeColorChangeShape.shapeType === SHAPES.ARROW &&
      this.toBeColorChangeShape instanceof ArrowLine
    ) {
      this.toBeColorChangeShape.strokeColor = color;
      this.displayAllShapes();
    }
    if (
      this.toBeColorChangeShape &&
      this.toBeColorChangeShape.shapeType === SHAPES.DRAW &&
      this.toBeColorChangeShape instanceof Draw
    ) {
      this.toBeColorChangeShape.strokeColor = color;
      this.displayAllShapes();
    }
  }

  private changeShapeColor() {
    const backgroundColorContainer = document.querySelector(
      ".background__color__container"
    ) as HTMLDivElement;
    const colorsBtn: NodeListOf<HTMLButtonElement> =
      backgroundColorContainer.querySelectorAll("button");
    colorsBtn.forEach((colorBtn) => {
      colorBtn.addEventListener("click", () => {
        const color = colorBtn.getAttribute("data-color")!;
        this.updateSelectedShapeFillColor(color);
      });
    });

    const strokeColorContainer = document.querySelector(
      ".stroke__color__container"
    ) as HTMLDivElement;
    const strokeBtn: NodeListOf<HTMLButtonElement> =
      strokeColorContainer.querySelectorAll("button");
    strokeBtn.forEach((strokeBtn) => {
      strokeBtn.addEventListener("click", () => {
        const color = strokeBtn.getAttribute("data-color")!;
        if(this.currentShape === SHAPES.DRAW){
          this.drawingColor = color;
        }
        this.updateSelectedShapeStrokeColor(color);
      });
    });
  }

  /* Side panel column */
}
