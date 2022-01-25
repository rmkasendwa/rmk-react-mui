import { APP_NAME } from '../constants';

export const updatePageTitle = (title?: string) => {
  if (title) {
    const titleElement = document.head.querySelector('title');
    titleElement != null && (titleElement.innerText = `${title} | ${APP_NAME}`);
  }
};

export const resetPageTitle = () => {
  const titleElement = document.head.querySelector('title');
  titleElement != null && (titleElement.innerText = APP_NAME);
};

export const flickerElement = (element: Element) => {
  element.classList.add('flicker');
  setTimeout(() => element.classList.remove('flicker'), 1000);
};
