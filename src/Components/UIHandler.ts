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