import {
  BOLD_LINE_WIDTH,
  DASH_GAP,
  DASH_WIDTH,
  DIMENSION,
  DOT_GAP,
  DOT_WIDTH,
  DRAW_BOLD_LINE_WIDTH,
  DRAW_EXTRA_BOLD_LINE_WIDTH,
  EXTRA_BOLD_LINE_WIDTH,
  THIN_LINE_WIDTH,
} from "../Constants/Constants";
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
  private undoStack: Shape[] = [];
  private currentDrawing?: Draw;
  private isUndoStart: boolean = false;
  private sizeOfShapesAtUndoStart: number = 0;
  private selectedShapeForAltering: { index: number; shape: Shape }[] = [];
  private selectedShapeIndex: number | null = null;
  private toBeChangeShape: Shape | undefined = undefined;
  private drawingColor: string = "black";
  private drawingWidth: number = THIN_LINE_WIDTH;
  private scale: number = 1;
  private scaleFactor: number = 1.1;
  private zoomPercentage: number = 100;
  private zoomPercentageEl: HTMLButtonElement | null = null;
  private previouslySelectedShape: Shape | null = null;
  private isShowingSidePanel: boolean = false;
  private selectedStrokeColor: string = "";
  private selectedBackgroundColor: string = "transparent";
  private selectedWidthSize: number = THIN_LINE_WIDTH;
  private selectedWidthStyle: number[] = [];

  constructor() {
    this.canvas = document.createElement("canvas");
    this.canvas.width = DIMENSION.CANVAS_WIDTH;
    this.canvas.height = DIMENSION.CANVAS_HEIGHT;
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.ctx.font = '24px "Virgil", sans-serif';
    document.getElementById("app")?.appendChild(this.canvas);
    this.zoomPercentageEl = document.querySelector(
      "#zoom__percentage"
    ) as HTMLButtonElement;
    this.init();
  }

  init() {
    this.canvas.addEventListener("mousedown", this.onMouseDown.bind(this));
    this.canvas.addEventListener("mousemove", this.onMouseMove.bind(this));
    this.canvas.addEventListener("mouseup", this.onMouseUp.bind(this));
    this.canvas.addEventListener("dblclick", this.doubleClick.bind(this));

    document.addEventListener("click", this.sidePanelHandler.bind(this));
    document.addEventListener("keydown", this.keyboardActions.bind(this));
    this.zoomPercentageEl!.innerHTML = `${this.zoomPercentage}%`;
    /* Function call */
    highlightCurrentSelectedTool();
    this.toolBarManager();
    this.changeShapeColor();
    this.changeWidthOfShape();
    this.changeWidthStyleOfShape();
    this.layerManager();
    this.undoRedoManager();
    this.zoomManager();
    this.handleActions();
    this.getDataFromLocalStorage();
  }


  /**Edit text */
  doubleClick(event:MouseEvent){
    const currentMousePosition = this.getMousePosition(event);
    for (let i = this.shapes.length - 1; i >= 0; i--) {
      if (this.shapes[i].isMouseWithinShape(currentMousePosition)) {
        this.selectedShape = this.shapes[i];
        this.selectedShapeIndex = i;
        break;
      }
    }
    
    if(this.selectedShape instanceof Text){ 
      const prevText = this.selectedShape.text;
      const rect: { x: number; y: number; width: number; height: number } = this.selectedShape.boundingBox;
      this.ctx.clearRect(rect.x - 5, rect.y + 18, rect.width + 10, rect.height + 14);
      this.shapes.splice(this.selectedShapeIndex!, 1);
      this.selectedShape.setIsSelected(false);
      this.displayAllShapes();
      this.drawText({posX: rect.x, posY: rect.y + 16}, prevText);
    }else{
      this.drawText(currentMousePosition);
    }
  }

  onMouseDown(event: MouseEvent) {
    this.selectedShapeForAltering = [];
    this.selectedShape = undefined;
    if (this.currentShape !== SHAPES.DRAW) {
      this.isShowingSidePanel = false;
    }
    const currentMousePosition = this.getMousePosition(event);
    this.deSelectPreviouslySelectedShape(this.previouslySelectedShape);
    this.displayAllShapes();

   
    if (this.currentShape === SHAPES.CURSOR) {
      for (let i = this.shapes.length - 1; i >= 0; i--) {
        if (this.shapes[i].isMouseWithinShape(currentMousePosition)) {
          this.selectedShape = this.shapes[i];
          this.selectedShapeIndex = i;
          break;
        }
      }


      this.toBeChangeShape = this.selectedShape;
      if (this.selectedShape) {
        this.previouslySelectedShape = this.selectedShape;
        this.selectedShape.setIsSelected(true);
        this.selectedShape.drawOutline(this.ctx);
        this.isShowingSidePanel = true;
        this.selectedShapeForAltering.push({
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
      this.currentDrawing = new Draw(
        currentMousePosition,
        this.drawingColor,
        this.drawingWidth
      );
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
    this.changeMouseShape(position, event);
    this.shapeConnector(event);
    this.eraseShape(event);

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

  /*Change mouse shape */
  private changeMouseShape(position: IPoint, event: MouseEvent) {
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
        if (edge && this.toBeChangeShape) {
          let cursorStyle: string = "";
          if (edge === "left" || edge === "right") {
            cursorStyle = "ew-resize";
          } else if (edge === "top" || edge === "bottom") {
            cursorStyle = "ns-resize";
          } else if (edge === "top-left" || edge === "bottom-right") {
            cursorStyle = "nwse-resize";
          } else if (edge === "top-right" || edge === "bottom-left") {
            cursorStyle = "nesw-resize";
          } else if (edge === "start" || edge === "end") {
            cursorStyle = "pointer";
          }
          body.style.cursor = cursorStyle;
        }
      } else {
        body.style.cursor = "default";
      }
    }
  }

  /**Connector arrow line */
  private shapeConnector(event: MouseEvent) {
    const currentMousePosition = this.getMousePosition(event);
    if (this.currentShape === SHAPES.ARROW) {
      const tempSelectedShape = this.shapes.find((shape) => {
        if (shape) {
          return shape.isMouseWithinShape(currentMousePosition);
        }
      });
      if (tempSelectedShape) {
        tempSelectedShape.setIsSelected(true);
        tempSelectedShape.drawOutline(this.ctx);
      }
      tempSelectedShape?.setIsSelected(false);
      if (!tempSelectedShape) {
        this.displayAllShapes();
      }
    }
  }

  private eraseShape(event: MouseEvent) {
    const currentMousePosition = this.getMousePosition(event);
    let shapeIndex: number | null = null;
    if (this.currentShape === SHAPES.ERASER) {
      const tempSelectedShape = this.shapes.find((shape, index) => {
        if (shape) {
          shapeIndex = index;
          return shape.isMouseWithinShape(currentMousePosition);
        }
      });
      if (tempSelectedShape) {
        tempSelectedShape.setIsSelected(true);
        tempSelectedShape.drawOutline(this.ctx);
        if (shapeIndex !== null) {
          this.selectedShapeForAltering.push({
            index: shapeIndex,
            shape: tempSelectedShape,
          });
        }
        this.deleteSelectedShapes();
      }
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

  /* Tool bar selection */
  private toolBarManager() {
    document
      .querySelector("#toolbar_container")
      ?.querySelectorAll("button")
      .forEach((button) => {
        button.addEventListener("click", () => {
          const shape = button.getAttribute("data-shape");
          if (shape) {
            this.currentShape = SHAPES[shape as keyof typeof SHAPES];
            this.isErasing = (shape === "ERASER");
            if (this.currentShape !== SHAPES.CURSOR) {
              this.isShowingSidePanel = true;
            } else {
              this.isShowingSidePanel = false;
            }
          }
          if (button.id === "clearBtn") {
            this.shapes = [];
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.currentShape = SHAPES.CURSOR;
            this.isErasing = false;
            adjustToolSection();
            localStorage.removeItem("savedData");
          }
        });
      });
  }

  /* Draw rectangle */
  private drawRectangle(
    currentMousePosition: IPoint,
    finalize: boolean = false
  ) {
    const width = currentMousePosition.posX - this.startPosition.posX;
    const height = currentMousePosition.posY - this.startPosition.posY;
    if (!finalize) {
      const rect = new Rectangle(
        this.startPosition,
        { width, height },
        this.selectedBackgroundColor,
        this.selectedStrokeColor,
        this.selectedWidthSize,
        this.selectedWidthStyle
      );
      rect.draw(this.ctx);
    } else {
      const newRect = Rectangle.generateShape(
        this.startPosition,
        currentMousePosition,
        this.selectedBackgroundColor,
        this.selectedStrokeColor,
        this.selectedWidthSize,
        this.selectedWidthStyle
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
      const circle = new Circle(
        adjustedCenter,
        radius,
        this.selectedBackgroundColor,
        this.selectedStrokeColor,
        this.selectedWidthSize,
        this.selectedWidthStyle
      );
      circle.draw(this.ctx);
    } else {
      const newCircle = Circle.generateCircle(
        adjustedCenter,
        radius,
        this.selectedBackgroundColor,
        this.selectedStrokeColor,
        this.selectedWidthSize,
        this.selectedWidthStyle
      );
      this.shapes.push(newCircle);
      newCircle.draw(this.ctx);
    }
  }

  /* Draw line */
  private drawLine(end: IPoint, finalize: boolean = false) {
    if (!finalize) {
      const line = new Line(
        this.startPosition,
        end,
        this.selectedBackgroundColor,
        this.selectedStrokeColor,
        this.selectedWidthSize,
        this.selectedWidthStyle
      );
      line.draw(this.ctx);
    } else {
      const newLine = Line.generateLine(
        this.startPosition,
        {
          posX: end.posX,
          posY: end.posY,
        },
        this.selectedBackgroundColor,
        this.selectedStrokeColor,
        this.selectedWidthSize,
        this.selectedWidthStyle
      );
      this.shapes.push(newLine);
      newLine.draw(this.ctx);
    }
  }

  /* Draw arrow line */
  private drawArrowLine(end: IPoint, finalize: boolean = false) {
    if (!finalize) {
      const arrowLine = new ArrowLine(
        this.startPosition,
        end,
        this.selectedBackgroundColor,
        this.selectedStrokeColor,
        this.selectedWidthSize,
        this.selectedWidthStyle
      );
      arrowLine.draw(this.ctx);
    } else {
      const newArrowLine = ArrowLine.generateArrowLine(
        { posX: this.startPosition.posX, posY: this.startPosition.posY },
        { posX: end.posX, posY: end.posY },
        this.selectedBackgroundColor,
        this.selectedStrokeColor,
        this.selectedWidthSize,
        this.selectedWidthStyle
      );
      this.shapes.push(newArrowLine);
      newArrowLine.draw(this.ctx);
    }
  }

  /* Draw text */
  private drawText(position: IPoint, prevText?: string) {
    const input = document.createElement("input");
    input.type = "text";
    input.style.position = "absolute";
    input.style.border = "none";
    input.style.outline = "none";
    input.style.fontFamily = "Virgil, sans-serif";
    input.style.fontSize = "24px";
    input.style.color = this.selectedStrokeColor;
    input.style.left = `${position.posX}px`;
    input.style.top = `${position.posY}px`;
    if(prevText){
      input.value = prevText;
    }
    document.body.appendChild(input);
    input.focus();
    
    const onInputBlur = () => {
      const text = input.value;
      if (text) {
        if (this.ctx) {
          this.ctx.font = '24px "Virgil", sans-serif';
          const textWidth = this.ctx.measureText(text).width;
          const textHeight = parseInt(this.ctx.font);
          const boundingBox = {
            x: position.posX,
            y: position.posY - textHeight,
            width: textWidth,
            height: textHeight,
          };

          const newText = new Text(
            position,
            text,
            boundingBox,
            this.selectedStrokeColor
          );
          this.shapes.push(newText);
          this.displayAllShapes();
        }
      }
      document.body.removeChild(input);
    };
    input.addEventListener("input", resizeInput);
    resizeInput();
    input.addEventListener("blur", onInputBlur);
    function resizeInput() {
      input.style.width = `${input.value.length + 1}ch`;
    }
  }

  /* Undo & Redo */
  private undo() {
    let lastMomento;
    this.isUndoStart = true;
    if (this.undoStack.length > 0) {
      lastMomento = this.undoStack.pop();
      if (lastMomento) {
        this.redoStack.push(lastMomento);
        this.shapes.push(lastMomento);
        this.displayAllShapes();
      }
    } else {
      lastMomento = this.shapes.pop();
      if (lastMomento) {
        this.redoStack.push(lastMomento);
        this.displayAllShapes();
      }
    }
    if (this.isUndoStart) {
      this.sizeOfShapesAtUndoStart = this.shapes.length;
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

  /*Keyboard actions*/
  private keyboardActions(event: KeyboardEvent) {
    /* Undo actions */
    if (event.ctrlKey && event.key === "z") {
      event.preventDefault();
      this.undo();
    }
    /* Redo action */
    if (event.ctrlKey && event.key === "y") {
      event.preventDefault();
      this.redo();
    }
    /* Shape deletion */
    if (event.key === "Delete") {
      this.deleteSelectedShapes();
    }
    /* zoom in and zoom out */
    if (event.ctrlKey) {
      switch (event.key) {
        case "+":
        case "=":
          this.zoomIn();
          event.preventDefault();
          break;
        case "-":
          this.zoomOut();
          event.preventDefault();
          break;
      }
    }
  }

  private deleteSelectedShapes() {
    if (this.selectedShapeForAltering.length > 0) {
      this.selectedShapeForAltering.forEach((selected) => {
        const index = selected.index;
        if (index !== undefined && index >= 0 && index < this.shapes.length) {
          this.undoStack.push(this.shapes[index]);
          this.shapes.splice(index, 1);
        }
      });
      this.clearCanvas();
      this.displayAllShapes();
      this.selectedShapeForAltering = [];
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

  /*Display all shapes*/
  private displayAllShapes() {
    this.clearCanvas();
    this.ctx.save();
    this.ctx.translate(this.ctx.canvas.width / 2, this.ctx.canvas.height / 2);
    this.ctx.scale(this.scale, this.scale);
    this.ctx.translate(-this.ctx.canvas.width / 2, -this.ctx.canvas.height / 2);
    this.shapes.forEach((shape) => {
      if (shape) {
        shape.draw(this.ctx);
      }
    });
    this.ctx.restore();
  }

  /*Change shapes colors*/
  private updateSelectedShapeFillColor(color: string) {
    if (
      this.toBeChangeShape &&
      this.toBeChangeShape.shapeType === SHAPES.CIRCLE &&
      this.toBeChangeShape instanceof Circle
    ) {
      this.toBeChangeShape.fillColor = color;
      this.displayAllShapes();
    }
    if (
      this.toBeChangeShape &&
      this.toBeChangeShape.shapeType === SHAPES.RECTANGLE &&
      this.toBeChangeShape instanceof Rectangle
    ) {
      this.toBeChangeShape.fillColor = color;
      this.displayAllShapes();
    }
  }
  private updateSelectedShapeStrokeColor(color: string) {
    if (
      this.toBeChangeShape &&
      this.toBeChangeShape.shapeType === SHAPES.CIRCLE &&
      this.toBeChangeShape instanceof Circle
    ) {
      this.toBeChangeShape.strokeColor = color;
      this.displayAllShapes();
    }
    if (
      this.toBeChangeShape &&
      this.toBeChangeShape.shapeType === SHAPES.RECTANGLE &&
      this.toBeChangeShape instanceof Rectangle
    ) {
      this.toBeChangeShape.strokeColor = color;
      this.displayAllShapes();
    }
    if (
      this.toBeChangeShape &&
      this.toBeChangeShape.shapeType === SHAPES.LINE &&
      this.toBeChangeShape instanceof Line
    ) {
      this.toBeChangeShape.strokeColor = color;
      this.displayAllShapes();
    }
    if (
      this.toBeChangeShape &&
      this.toBeChangeShape.shapeType === SHAPES.ARROW &&
      this.toBeChangeShape instanceof ArrowLine
    ) {
      this.toBeChangeShape.strokeColor = color;
      this.displayAllShapes();
    }
    if (
      this.toBeChangeShape &&
      this.toBeChangeShape.shapeType === SHAPES.TEXT &&
      this.toBeChangeShape instanceof Text
    ) {
      this.toBeChangeShape.fontColor = color;
      this.displayAllShapes();
    }
    if (
      this.toBeChangeShape &&
      this.toBeChangeShape.shapeType === SHAPES.DRAW &&
      this.toBeChangeShape instanceof Draw
    ) {
      this.toBeChangeShape.strokeColor = color;
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
        backgroundColorContainer
          .querySelectorAll("button")
          .forEach((button) => (button.style.border = "none"));
        colorBtn.style.border = "1px solid gray";
        const color = colorBtn.getAttribute("data-color")!;
        this.selectedBackgroundColor = color;
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
        strokeColorContainer
          .querySelectorAll("button")
          .forEach((button) => (button.style.border = "none"));
        strokeBtn.style.border = "1px solid black";
        const color = strokeBtn.getAttribute("data-color")!;
        this.selectedStrokeColor = color;
        if (this.currentShape === SHAPES.DRAW) {
          this.drawingColor = color;
        }
        this.updateSelectedShapeStrokeColor(color);
      });
    });
  }

  /**Shape width change */
  private changeWidthOfShape() {
    const strokeWidthContainer = document.querySelector(
      ".stroke__width"
    ) as HTMLDivElement;
    strokeWidthContainer.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        const widthType = button.id;
        strokeWidthContainer
          .querySelectorAll("button")
          .forEach((button) => (button.style.border = "none"));
        button.style.border = "1px solid black";
        this.selectedWidthSize = this.widthSelector(widthType);
        if (this.currentShape === SHAPES.DRAW) {
          this.drawingWidth = this.widthSelector(widthType);
        }
        this.updateSelectedShapeWidth(widthType);
      });
    });
  }

  private updateSelectedShapeWidth(widthType: string) {
    if (
      this.toBeChangeShape &&
      this.toBeChangeShape.shapeType === SHAPES.RECTANGLE &&
      this.toBeChangeShape instanceof Rectangle
    ) {
      this.toBeChangeShape.strokeWidth = this.widthSelector(widthType);
      this.displayAllShapes();
    } else if (
      this.toBeChangeShape &&
      this.toBeChangeShape.shapeType === SHAPES.CIRCLE &&
      this.toBeChangeShape instanceof Circle
    ) {
      this.toBeChangeShape.strokeWidth = this.widthSelector(widthType);
      this.displayAllShapes();
    } else if (
      this.toBeChangeShape &&
      this.toBeChangeShape.shapeType === SHAPES.LINE &&
      this.toBeChangeShape instanceof Line
    ) {
      this.toBeChangeShape.strokeWidth = this.widthSelector(widthType);
      this.displayAllShapes();
    } else if (
      this.toBeChangeShape &&
      this.toBeChangeShape.shapeType === SHAPES.ARROW &&
      this.toBeChangeShape instanceof ArrowLine
    ) {
      this.toBeChangeShape.strokeWidth = this.widthSelector(widthType);
      this.displayAllShapes();
    }
  }

  private widthSelector(widthType: string): number {
    if (widthType === "thin") {
      return THIN_LINE_WIDTH;
    } else if (widthType === "bold") {
      if (this.currentShape === SHAPES.DRAW) return DRAW_BOLD_LINE_WIDTH;
      return BOLD_LINE_WIDTH;
    } else {
      if (this.currentShape === SHAPES.DRAW) return DRAW_EXTRA_BOLD_LINE_WIDTH;
      return EXTRA_BOLD_LINE_WIDTH;
    }
  }

  /**Width style change */
  private changeWidthStyleOfShape() {
    const strokeWidthStyleContainer = document.querySelector(
      ".stroke__style"
    ) as HTMLDivElement;
    strokeWidthStyleContainer.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        strokeWidthStyleContainer
          .querySelectorAll("button")
          .forEach((button) => (button.style.border = "none"));
        const widthStyle = button.id;
        button.style.border = "1px solid black";
        this.selectedWidthStyle = this.widthStyleSelector(widthStyle);
        this.updateSelectedShapeWidthStyle(widthStyle);
      });
    });
  }

  private updateSelectedShapeWidthStyle(widthStyle: string) {
    if (
      this.toBeChangeShape &&
      this.toBeChangeShape.shapeType === SHAPES.RECTANGLE &&
      this.toBeChangeShape instanceof Rectangle
    ) {
      this.toBeChangeShape.strokeStyle = this.widthStyleSelector(widthStyle);
      this.displayAllShapes();
    } else if (
      this.toBeChangeShape &&
      this.toBeChangeShape.shapeType === SHAPES.CIRCLE &&
      this.toBeChangeShape instanceof Circle
    ) {
      this.toBeChangeShape.strokeStyle = this.widthStyleSelector(widthStyle);
      this.displayAllShapes();
    } else if (
      this.toBeChangeShape &&
      this.toBeChangeShape.shapeType === SHAPES.LINE &&
      this.toBeChangeShape instanceof Line
    ) {
      this.toBeChangeShape.strokeStyle = this.widthStyleSelector(widthStyle);
      this.displayAllShapes();
    } else if (
      this.toBeChangeShape &&
      this.toBeChangeShape.shapeType === SHAPES.ARROW &&
      this.toBeChangeShape instanceof ArrowLine
    ) {
      this.toBeChangeShape.strokeStyle = this.widthStyleSelector(widthStyle);
      this.displayAllShapes();
    }
  }

  private widthStyleSelector(widthStyle: string): number[] {
    if (widthStyle === "solid") {
      return [];
    } else if (widthStyle === "dashed") {
      return [DASH_WIDTH, DASH_GAP];
    } else {
      return [DOT_WIDTH, DOT_GAP];
    }
  }
  /* Zoom section */
  private zoomIn() {
    this.scale *= this.scaleFactor; // Use *= instead of += for scaling
    this.zoomPercentage += 10;
    document.querySelector(
      "#zoom__percentage"
    )!.innerHTML = `${this.zoomPercentage}%`;
    this.displayAllShapes();
  }

  private zoomOut() {
    if (this.zoomPercentage > 10) {
      this.scale /= this.scaleFactor; // Use /= instead of /=
      this.zoomPercentage -= 10;
      document.querySelector(
        "#zoom__percentage"
      )!.innerHTML = `${this.zoomPercentage}%`;
      this.displayAllShapes();
    }
  }

  /**INDEXING SHAPES */
  private sendToBack() {
    if (this.selectedShapeForAltering.length < 1) return;
    const selectedIndex = this.selectedShapeForAltering[0].index;
    if (selectedIndex === 0) return;
    let tempShapes: Shape[] = [];
    tempShapes.push(this.selectedShapeForAltering[0].shape);
    this.shapes.forEach((shape, index) => {
      if (index !== this.selectedShapeForAltering[0].index) {
        tempShapes.push(shape);
      }
    });
    this.shapes = [];
    tempShapes.forEach((shape) => {
      this.shapes.push(shape);
    });
    this.deSelectPreviouslySelectedShape(
      this.selectedShapeForAltering[0].shape
    );
    this.displayAllShapes();
    this.selectedShapeForAltering = [];
  }

  private bringToFront() {
    if (this.selectedShapeForAltering.length < 1) return;
    const selectedIndex = this.selectedShapeForAltering[0].index;
    if (selectedIndex === this.shapes.length - 1) return;
    let tempShapes: Shape[] = [];
    this.shapes.forEach((shape, index) => {
      if (index !== selectedIndex) {
        tempShapes.push(shape);
      }
    });
    tempShapes.push(this.selectedShapeForAltering[0].shape);
    this.shapes = [];
    tempShapes.forEach((shape) => {
      this.shapes.push(shape);
    });
    this.deSelectPreviouslySelectedShape(
      this.selectedShapeForAltering[0].shape
    );
    this.displayAllShapes();
    this.selectedShapeForAltering = [];
  }

  private sendBackward() {
    if (this.selectedShapeForAltering.length === 0) return;
    const selectedIndex = this.selectedShapeForAltering[0].index;
    if (selectedIndex === 0) return;
    const temp = this.shapes[selectedIndex];
    this.shapes[selectedIndex] = this.shapes[selectedIndex - 1];
    this.shapes[selectedIndex - 1] = temp;
    this.deSelectPreviouslySelectedShape(
      this.selectedShapeForAltering[0].shape
    );
    this.displayAllShapes();
    this.selectedShapeForAltering = [];
  }

  private bringForward() {
    if (this.selectedShapeForAltering.length === 0) return;
    const selectedIndex = this.selectedShapeForAltering[0].index;
    if (selectedIndex === this.shapes.length - 1) return;
    const temp = this.shapes[selectedIndex];
    this.shapes[selectedIndex] = this.shapes[selectedIndex + 1];
    this.shapes[selectedIndex + 1] = temp;
    this.deSelectPreviouslySelectedShape(
      this.selectedShapeForAltering[0].shape
    );
    this.displayAllShapes();
    this.selectedShapeForAltering = [];
  }

  private layerManager() {
    document
      .querySelector(".layer__container")
      ?.querySelectorAll("button")
      .forEach((button) => {
        button.addEventListener("click", () => {
          if (button.id === "toBack") {
            this.sendToBack();
          } else if (button.id === "backward") {
            this.sendBackward();
          } else if (button.id === "bringForward") {
            this.bringForward();
          } else if (button.id === "toFront") {
            this.bringToFront();
          }
        });
      });
  }

  private deSelectPreviouslySelectedShape(
    previouslySelectedShape: Shape | null
  ) {
    if (previouslySelectedShape) {
      previouslySelectedShape.setIsSelected(false);
    }
  }

  private sidePanelHandler() {
    const sidePane = document.querySelector(".panelColumn") as HTMLDivElement;
    if (this.isShowingSidePanel) {
      sidePane.style.display = "block";
    } else {
      sidePane.style.display = "none";
    }
  }

  /**Export selected shape */
  private exportSelectedShape() {
    const exportedImage = document.getElementById(
      "exportedImage"
    ) as HTMLImageElement;
    const tempCanvas = document.createElement("canvas") as HTMLCanvasElement;
    const tempContext = tempCanvas.getContext("2d")!;
    tempCanvas.width = this.canvas.width;
    tempCanvas.height = this.canvas.height;
    if (this.selectedShapeForAltering.length > 0) {
      const selectedShape = this.selectedShapeForAltering[0].shape;
      selectedShape.setIsSelected(false);
      selectedShape.draw(tempContext);
      const imageData = tempCanvas.toDataURL("image/png");
      exportedImage.src = imageData;
      const downloadLink = document.createElement("a");
      downloadLink.href = imageData;
      downloadLink.download = "selected_shapes.png";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  }

  /**Zoom section */
  private zoomManager() {
    document
      .querySelector("#zoom")
      ?.querySelectorAll("button")
      .forEach((button) => {
        button.addEventListener("click", () => {
          button.style.border = "1px solid blue";
          button.style.borderTopLeftRadius = "5px";
          button.style.borderBottomLeftRadius = "5px";
          button.style.transition = "0.3s";
          if (button.id === "zoom__out") {
            this.zoomOut();
          } else if (button.id === "zoom__in") {
            this.zoomIn();
          } else if (button.id === "zoom__percentage") {
            this.scale = 1;
            this.zoomPercentage = 100;
            this.zoomPercentageEl!.innerHTML = `${this.zoomPercentage}%`;
            this.displayAllShapes();
          }
          setTimeout(() => {
            button.style.border = "none";
          }, 700);
        });
      });
  }

  /*Undo & Redo */
  private undoRedoManager() {
    document
      .querySelector("#redo_undo")
      ?.querySelectorAll("button")
      .forEach((button) => {
        button.addEventListener("click", () => {
          button.style.border = "1px solid blue";
          button.style.borderTopLeftRadius = "5px";
          button.style.borderBottomLeftRadius = "5px";
          button.style.transition = "0.3s";
          if (button.id === "undoBtn") {
            this.undo();
          } else if (button.id === "redoBtn") {
            this.redo();
          }
          setTimeout(() => {
            button.style.border = "none";
          }, 700);
        });
      });
  }

  /**Action section */
  private handleActions() {
    document
      .querySelector(".actions")
      ?.querySelectorAll("button")
      .forEach((button) => {
        button.addEventListener("click", () => {
          button.style.backgroundColor = "rgb(216, 216, 216)";
          button.style.transition = "0.3s";
          setTimeout(() => {
            button.style.backgroundColor = "#EFEFEF";
          }, 700);
          const id = button.id;
          if (id === "deleteBtn") {
            this.deleteSelectedShapes();
          } else if (id === "exportBtn") {
            this.exportSelectedShape();
          } else if (id === "saveBtn") {
            this.saveToLocalStorage();
          }
        });
      });
  }

  /**Local storage */
  private saveToLocalStorage() {
    localStorage.setItem("savedData", JSON.stringify(this.shapes));
  }

  private getDataFromLocalStorage() {
    const savedData = localStorage.getItem("savedData");
    if (savedData) {
      const shapes: any[] = JSON.parse(savedData);
      shapes.forEach((shape) => {
        if (shape.shapeType === SHAPES.RECTANGLE) {
          this.shapes.push(
            new Rectangle(
              shape.position,
              shape.dimension,
              shape.fillColor,
              shape.strokeColor,
              shape.strokeWidth,
              shape.strokeStyle
            )
          );
        } else if (shape.shapeType === SHAPES.CIRCLE) {
          this.shapes.push(
            new Circle(
              shape.position,
              shape.radius,
              shape.fillColor,
              shape.strokeColor,
              shape.strokeWidth,
              shape.strokeStyle
            )
          );
        } else if (shape.shapeType === SHAPES.LINE) {
          this.shapes.push(
            new Line(
              shape.position,
              shape.end,
              shape.fillColor,
              shape.strokeColor,
              shape.strokeWidth,
              shape.strokeStyle
            )
          );
        } else if (shape.shapeType === SHAPES.ARROW) {
          this.shapes.push(
            new ArrowLine(
              shape.position,
              shape.end,
              shape.fillColor,
              shape.strokeColor,
              shape.strokeWidth,
              shape.strokeStyle
            )
          );
        } else if (shape.shapeType === SHAPES.TEXT) {
          this.shapes.push(
            new Text(
              shape.position,
              shape.text,
              shape.boundingBox,
              shape.strokeColor
            )
          );
        } else if (shape.shapeType === SHAPES.DRAW) {
          const newDraw = new Draw(
            shape.position,
            shape.strokeColor,
            shape.strokeWidth
          );
          shape.path.forEach((path: IPoint) => newDraw.addPoint(path));
          this.shapes.push(newDraw);
        }
      });
      this.displayAllShapes();
    }
  }
}
