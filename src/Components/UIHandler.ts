export function handleShortcut() {
  const shortcutItemsEl = document.querySelector(
    '#shortcut_items'
  ) as HTMLDivElement;
  shortcutItemsEl.style.display = 'none';
  const shortcutEl = document.querySelector('#shortcut') as HTMLButtonElement;
  shortcutEl.textContent = 'Shortcuts';
  shortcutEl.addEventListener('click', () => {
    if (flag) {
      shortcutItemsEl.style.display = 'none';
      flag = false;
    } else {
      shortcutItemsEl.style.display = 'block';
      flag = true;
    }
  });
}
