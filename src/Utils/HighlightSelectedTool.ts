let toolbarIcons: NodeListOf<HTMLButtonElement>;
export const body = document.querySelector("body") as HTMLBodyElement;
export const cursorBtn = document.querySelector(
  "#cursorBtn"
) as HTMLButtonElement;
export function highlightCurrentSelectedTool(): void {
  const toolbarContainer = document.querySelector(
    ".toolbar_container"
  ) as HTMLDivElement;
      tool.style.backgroundColor = "#E0DFFF";  toolbarIcons.forEach((tool) => {
    if (tool.id === "cursorBtn") {
      tool.style.backgroundColor = "#E0DFFF";
    }
    tool.addEventListener("click", () => {
      removeBg();
      if (tool.id === "eraserBtn") {
          tool.style.backgroundColor = "#E0DFFF";          "url(https://res.cloudinary.com/drmynjjhg/image/upload/v1719141476/eraser_vnk7nr.png), auto";
      } else if (tool.id === "clearBtn" || tool.id === "cursorBtn") {
        body.style.cursor = "default";
      } else {
        body.style.cursor = "crosshair";
      }
      tool.style.backgroundColor = "#E0DFFF";
    });
  });
}

export function removeBg() {
  toolbarIcons.forEach((tool) => {
    tool.style.backgroundColor = "";
function removeBg() {}
