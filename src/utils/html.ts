/**
 * Checks if the child is a descendant of the parent
 *
 * @param parent The parent element
 * @param child The child element
 * @returns Whether the child is a descendant of the parent
 */
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

/**
 * Checks if the element is interactive
 *
 * @param element The element to check
 * @param ancestorElementLimit The element to stop checking at
 * @returns Whether the element is interactive
 */
export const isElementInteractive = (
  element: HTMLElement,
  ancestorElementLimit = document.body
): boolean => {
  const interactiveElements = [
    'a',
    'audio',
    'button',
    'details',
    'embed',
    'iframe',
    'img',
    'input',
    'label',
    'object',
    'select',
    'textarea',
    'video',
  ];

  const elementPassedInteractiveCheck =
    interactiveElements.includes(element.tagName.toLowerCase()) ||
    element.hasAttribute('tabindex');

  if (
    !elementPassedInteractiveCheck &&
    element.parentElement &&
    ancestorElementLimit !== element.parentElement
  ) {
    return isElementInteractive(element.parentElement, ancestorElementLimit);
  }

  return elementPassedInteractiveCheck;
};
