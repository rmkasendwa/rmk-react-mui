export const isDescendant = (parent: HTMLElement, child: HTMLElement) => {
  if (parent === child) {
    return true;
  }

  let node = child.parentNode;
  while (node != null) {
    if (node == parent) {
      return true;
    }
    node = node.parentNode;
  }
  return false;
};
