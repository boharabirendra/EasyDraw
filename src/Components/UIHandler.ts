import { Shape } from "../Shapes/Shape";

/**Shortcut section */
export function handleShortcut() {
  const shortcutItemsEl = document.querySelector(
    "#shortcut_items"
  ) as HTMLDivElement;
  shortcutItemsEl.style.display = "none";
  let flag = false;
  const shortcutEl = document.querySelector("#shortcut") as HTMLButtonElement;
  shortcutEl.addEventListener("click", () => {
    if (flag) {
      shortcutItemsEl.style.display = "none";
      flag = false;
    } else {
      shortcutItemsEl.style.display = "block";
      flag = true;
    }
  });
}

export function toggleSidePanel(isShowingSidePanel: boolean) {
  const sidePane = document.querySelector(".panelColumn") as HTMLDivElement;
  if (isShowingSidePanel) {
    sidePane.style.display = "block";
  } else {
    sidePane.style.display = "none";
  }
}

export function activateRedoUndoBtn(
  undoStack: Shape[][],
  redoStack: Shape[][]
) {
  const undoBtn = document.querySelector("#undoBtn") as HTMLButtonElement;
  const redoBtn = document.querySelector("#redoBtn") as HTMLButtonElement;
  if (undoStack.length === 0) {
    undoBtn.style.opacity = "0.4";
    undoBtn.disabled = true;
  } else {
    undoBtn.style.opacity = "1";
    undoBtn.disabled = false;
  }
  if (redoStack.length === 0) {
    redoBtn.style.opacity = "0.4";
    redoBtn.disabled = true;
  } else {
    redoBtn.style.opacity = "1";
    redoBtn.disabled = false;
  }
}
