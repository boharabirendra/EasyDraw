import { Shape } from "../Shapes/Shape";

export function saveCurrentState(shapes: Shape[], undoStack: Shape[][]) {
  undoStack.push([...shapes]);
}

export function savePreviousState(shapes: Shape[], redoStack: Shape[][]) {
  redoStack.push([...shapes]);
}

export function undo(
  shapes: Shape[],
  undoStack: Shape[][],
  redoStack: Shape[][]
) {
  if (undoStack.length > 0) {
    savePreviousState(shapes, redoStack);
    const previousState = undoStack.pop();
    if (previousState) {
      shapes.length = 0;
      shapes.push(...previousState);
    }
  }
}

export function redo(
  shapes: Shape[],
  undoStack: Shape[][],
  redoStack: Shape[][]
) {
  if (redoStack.length > 0) {
    saveCurrentState(shapes, undoStack);
    const nextState = redoStack.pop();
    if (nextState) {
      shapes.length = 0;
      shapes.push(...nextState);
    }
  }
}

export function clearRedoStack(redoStack: Shape[][]) {
  redoStack.length = 0;
}
