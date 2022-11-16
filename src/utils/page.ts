export const flickerElement = (element: Element) => {
  element.classList.add('flicker');
  setTimeout(() => element.classList.remove('flicker'), 1000);
};
