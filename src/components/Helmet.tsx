import PropTypes from 'prop-types';
import React from 'react';
import withSideEffect from 'react-side-effect';

type Props = Record<string, Record<string, string> | Record<string, string>[]>;

const ATTRIBUTE_NAMES = {
  BODY: 'bodyAttributes',
  HTML: 'htmlAttributes',
  TITLE: 'titleAttributes',
};

const TAG_NAMES = {
  BASE: 'base',
  BODY: 'body',
  HEAD: 'head',
  HTML: 'html',
  LINK: 'link',
  META: 'meta',
  NOSCRIPT: 'noscript',
  SCRIPT: 'script',
  STYLE: 'style',
  TITLE: 'title',
};

const VALID_TAG_NAMES = Object.values(TAG_NAMES);

const TAG_PROPERTIES = {
  CHARSET: 'charset',
  CSS_TEXT: 'cssText',
  HREF: 'href',
  HTTPEQUIV: 'http-equiv',
  INNER_HTML: 'innerHTML',
  ITEM_PROP: 'itemprop',
  NAME: 'name',
  PROPERTY: 'property',
  REL: 'rel',
  SRC: 'src',
  TARGET: 'target',
};

const REACT_TAG_MAP: Record<string, string> = {
  accesskey: 'accessKey',
  charset: 'charSet',
  class: 'className',
  contenteditable: 'contentEditable',
  contextmenu: 'contextMenu',
  'http-equiv': 'httpEquiv',
  itemprop: 'itemProp',
  tabindex: 'tabIndex',
};

const HELMET_PROPS: Record<string, string> = {
  DEFAULT_TITLE: 'defaultTitle',
  DEFER: 'defer',
  ENCODE_SPECIAL_CHARACTERS: 'encodeSpecialCharacters',
  ON_CHANGE_CLIENT_STATE: 'onChangeClientState',
  TITLE_TEMPLATE: 'titleTemplate',
};

const HTML_TAG_MAP = Object.keys(REACT_TAG_MAP).reduce((obj, key) => {
  obj[REACT_TAG_MAP[key]] = key;
  return obj;
}, {} as Record<string, string>);

const SELF_CLOSING_TAGS = [
  TAG_NAMES.NOSCRIPT,
  TAG_NAMES.SCRIPT,
  TAG_NAMES.STYLE,
];

const HELMET_ATTRIBUTE = 'data-react-helmet';

const encodeSpecialCharacters = (str: string, encode = true) => {
  if (encode === false) {
    return String(str);
  }

  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

const getTitleFromPropsList = (propsList: Props[]) => {
  const innermostTitle = getInnermostProperty(propsList, TAG_NAMES.TITLE);
  const innermostTemplate = getInnermostProperty(
    propsList,
    HELMET_PROPS.TITLE_TEMPLATE
  );

  if (innermostTemplate && innermostTitle) {
    // use function arg to avoid need to escape $ characters
    return innermostTemplate.replace(/%s/g, () =>
      Array.isArray(innermostTitle) ? innermostTitle.join('') : innermostTitle
    );
  }

  const innermostDefaultTitle = getInnermostProperty(
    propsList,
    HELMET_PROPS.DEFAULT_TITLE
  );

  return innermostTitle || innermostDefaultTitle || undefined;
};

const getOnChangeClientState = (propsList: Props[]) => {
  return getInnermostProperty(propsList, HELMET_PROPS.ON_CHANGE_CLIENT_STATE);
};

const getAttributesFromPropsList = (tagType: string, propsList: Props[]) => {
  return propsList
    .filter((props) => typeof props[tagType] !== 'undefined')
    .map((props) => props[tagType])
    .reduce((tagAttrs, current) => {
      return { ...tagAttrs, ...current };
    }, {});
};

const getBaseTagFromPropsList = (
  primaryAttributes: string[],
  propsList: any[]
) => {
  return propsList
    .filter((props) => typeof props[TAG_NAMES.BASE] !== 'undefined')
    .map((props) => props[TAG_NAMES.BASE])
    .reverse()
    .reduce((innermostBaseTag, tag) => {
      if (!innermostBaseTag.length) {
        const keys = Object.keys(tag);

        for (let i = 0; i < keys.length; i++) {
          const attributeKey = keys[i];
          const lowerCaseAttributeKey = attributeKey.toLowerCase();

          if (
            primaryAttributes.indexOf(lowerCaseAttributeKey) !== -1 &&
            tag[lowerCaseAttributeKey]
          ) {
            return innermostBaseTag.concat(tag);
          }
        }
      }

      return innermostBaseTag;
    }, []);
};

const getTagsFromPropsList = (
  tagName: string,
  primaryAttributes: string[],
  propsList: Props[]
) => {
  // Calculate list of tags, giving priority innermost component (end of the propslist)
  const approvedSeenTags: Record<string, Record<string, string>> = {};

  return propsList
    .filter((props) => {
      if (Array.isArray(props[tagName])) {
        return true;
      }
      if (typeof props[tagName] !== 'undefined') {
        warn(
          `Helmet: ${tagName} should be of type "Array". Instead found type "${typeof props[
            tagName
          ]}"`
        );
      }
      return false;
    })
    .map((props) => props[tagName] as Record<string, string>[])
    .reverse()
    .reduce((approvedTags, instanceTags) => {
      const instanceSeenTags: Record<string, Record<string, boolean>> = {};

      instanceTags
        .filter((tag) => {
          let primaryAttributeKey;
          const keys = Object.keys(tag);
          for (let i = 0; i < keys.length; i++) {
            const attributeKey = keys[i];
            const lowerCaseAttributeKey = attributeKey.toLowerCase();

            // Special rule with link tags, since rel and href are both primary tags, rel takes priority
            if (
              primaryAttributes.indexOf(lowerCaseAttributeKey) !== -1 &&
              !(
                primaryAttributeKey &&
                primaryAttributeKey === TAG_PROPERTIES.REL &&
                tag[primaryAttributeKey].toLowerCase() === 'canonical'
              ) &&
              !(
                lowerCaseAttributeKey === TAG_PROPERTIES.REL &&
                tag[lowerCaseAttributeKey].toLowerCase() === 'stylesheet'
              )
            ) {
              primaryAttributeKey = lowerCaseAttributeKey;
            }
            // Special case for innerHTML which doesn't work lowercased
            if (
              primaryAttributes.indexOf(attributeKey) !== -1 &&
              (attributeKey === TAG_PROPERTIES.INNER_HTML ||
                attributeKey === TAG_PROPERTIES.CSS_TEXT ||
                attributeKey === TAG_PROPERTIES.ITEM_PROP)
            ) {
              primaryAttributeKey = attributeKey;
            }
          }

          if (!primaryAttributeKey || !tag[primaryAttributeKey]) {
            return false;
          }

          const value = tag[primaryAttributeKey].toLowerCase();

          if (!approvedSeenTags[primaryAttributeKey]) {
            approvedSeenTags[primaryAttributeKey] = {};
          }

          if (!instanceSeenTags[primaryAttributeKey]) {
            instanceSeenTags[primaryAttributeKey] = {};
          }

          if (!approvedSeenTags[primaryAttributeKey][value]) {
            instanceSeenTags[primaryAttributeKey][value] = true;
            return true;
          }

          return false;
        })
        .reverse()
        .forEach((tag) => approvedTags.push(tag));

      // Update seen tags with tags from this instance
      const keys = Object.keys(instanceSeenTags);
      for (let i = 0; i < keys.length; i++) {
        const attributeKey = keys[i];
        const tagUnion = Object.assign(
          {},
          approvedSeenTags[attributeKey],
          instanceSeenTags[attributeKey]
        );

        approvedSeenTags[attributeKey] = tagUnion;
      }

      return approvedTags;
    }, [])
    .reverse();
};

const getInnermostProperty = (propsList: any[], property: string) => {
  for (let i = propsList.length - 1; i >= 0; i--) {
    const props = propsList[i];

    if (props.hasOwnProperty(property)) {
      return props[property];
    }
  }

  return null;
};

const reducePropsToState = (propsList: Props[]) => ({
  baseTag: getBaseTagFromPropsList(
    [TAG_PROPERTIES.HREF, TAG_PROPERTIES.TARGET],
    propsList
  ),
  bodyAttributes: getAttributesFromPropsList(ATTRIBUTE_NAMES.BODY, propsList),
  defer: getInnermostProperty(propsList, HELMET_PROPS.DEFER),
  encode: getInnermostProperty(
    propsList,
    HELMET_PROPS.ENCODE_SPECIAL_CHARACTERS
  ),
  htmlAttributes: getAttributesFromPropsList(ATTRIBUTE_NAMES.HTML, propsList),
  linkTags: getTagsFromPropsList(
    TAG_NAMES.LINK,
    [TAG_PROPERTIES.REL, TAG_PROPERTIES.HREF],
    propsList
  ),
  metaTags: getTagsFromPropsList(
    TAG_NAMES.META,
    [
      TAG_PROPERTIES.NAME,
      TAG_PROPERTIES.CHARSET,
      TAG_PROPERTIES.HTTPEQUIV,
      TAG_PROPERTIES.PROPERTY,
      TAG_PROPERTIES.ITEM_PROP,
    ],
    propsList
  ),
  noscriptTags: getTagsFromPropsList(
    TAG_NAMES.NOSCRIPT,
    [TAG_PROPERTIES.INNER_HTML],
    propsList
  ),
  onChangeClientState: getOnChangeClientState(propsList),
  scriptTags: getTagsFromPropsList(
    TAG_NAMES.SCRIPT,
    [TAG_PROPERTIES.SRC, TAG_PROPERTIES.INNER_HTML],
    propsList
  ),
  styleTags: getTagsFromPropsList(
    TAG_NAMES.STYLE,
    [TAG_PROPERTIES.CSS_TEXT],
    propsList
  ),
  title: getTitleFromPropsList(propsList),
  titleAttributes: getAttributesFromPropsList(ATTRIBUTE_NAMES.TITLE, propsList),
});

const rafPolyfill = (() => {
  let clock = Date.now();

  return (callback: (t: number) => void) => {
    const currentTime = Date.now();

    if (currentTime - clock > 16) {
      clock = currentTime;
      callback(currentTime);
    } else {
      setTimeout(() => {
        rafPolyfill(callback);
      }, 0);
    }
  };
})();

const warn = (msg: string) => {
  return console && typeof console.warn === 'function' && console.warn(msg);
};

let _helmetCallback: ReturnType<typeof window.requestAnimationFrame> | null =
  null;

const handleClientStateChange = (newState: any) => {
  if (_helmetCallback) {
    window.cancelAnimationFrame(_helmetCallback);
  }

  if (newState.defer) {
    _helmetCallback = window.requestAnimationFrame(() => {
      commitTagChanges(newState, () => {
        _helmetCallback = null;
      });
    });
  } else {
    commitTagChanges(newState);
    _helmetCallback = null;
  }
};

const commitTagChanges = (newState: any, cb?: () => void) => {
  const {
    baseTag,
    bodyAttributes,
    htmlAttributes,
    linkTags,
    metaTags,
    noscriptTags,
    onChangeClientState,
    scriptTags,
    styleTags,
    title,
    titleAttributes,
  } = newState;
  updateAttributes(TAG_NAMES.BODY, bodyAttributes);
  updateAttributes(TAG_NAMES.HTML, htmlAttributes);

  updateTitle(title, titleAttributes);

  const tagUpdates: any = {
    baseTag: updateTags(TAG_NAMES.BASE, baseTag),
    linkTags: updateTags(TAG_NAMES.LINK, linkTags),
    metaTags: updateTags(TAG_NAMES.META, metaTags),
    noscriptTags: updateTags(TAG_NAMES.NOSCRIPT, noscriptTags),
    scriptTags: updateTags(TAG_NAMES.SCRIPT, scriptTags),
    styleTags: updateTags(TAG_NAMES.STYLE, styleTags),
  };

  const addedTags: Record<string, any> = {};
  const removedTags: Record<string, any> = {};

  Object.keys(tagUpdates).forEach((tagType) => {
    const { newTags, oldTags } = tagUpdates[tagType];

    if (newTags.length) {
      addedTags[tagType] = newTags;
    }
    if (oldTags.length) {
      removedTags[tagType] = tagUpdates[tagType].oldTags;
    }
  });

  cb && cb();
  onChangeClientState && onChangeClientState(newState, addedTags, removedTags);
};

const flattenArray = (possibleArray: string | string[]) => {
  return Array.isArray(possibleArray) ? possibleArray.join('') : possibleArray;
};

const updateTitle = (title: string, attributes: Record<string, string>) => {
  if (typeof title !== 'undefined' && document.title !== title) {
    document.title = flattenArray(title);
  }

  updateAttributes(TAG_NAMES.TITLE, attributes);
};

const updateAttributes = (
  tagName: string,
  attributes: Record<string, string>
) => {
  const elementTag = document.getElementsByTagName(tagName)[0];

  if (!elementTag) {
    return;
  }

  const helmetAttributeString = elementTag.getAttribute(HELMET_ATTRIBUTE);
  const helmetAttributes = helmetAttributeString
    ? helmetAttributeString.split(',')
    : [];
  const attributesToRemove = [...helmetAttributes];
  const attributeKeys = Object.keys(attributes);

  for (let i = 0; i < attributeKeys.length; i++) {
    const attribute = attributeKeys[i];
    const value = attributes[attribute] || '';

    if (elementTag.getAttribute(attribute) !== value) {
      elementTag.setAttribute(attribute, value);
    }

    if (helmetAttributes.indexOf(attribute) === -1) {
      helmetAttributes.push(attribute);
    }

    const indexToSave = attributesToRemove.indexOf(attribute);
    if (indexToSave !== -1) {
      attributesToRemove.splice(indexToSave, 1);
    }
  }

  for (let i = attributesToRemove.length - 1; i >= 0; i--) {
    elementTag.removeAttribute(attributesToRemove[i]);
  }

  if (helmetAttributes.length === attributesToRemove.length) {
    elementTag.removeAttribute(HELMET_ATTRIBUTE);
  } else if (
    elementTag.getAttribute(HELMET_ATTRIBUTE) !== attributeKeys.join(',')
  ) {
    elementTag.setAttribute(HELMET_ATTRIBUTE, attributeKeys.join(','));
  }
};

const updateTags = (type: string, tags: any[]) => {
  const headElement = document.head || document.querySelector(TAG_NAMES.HEAD);
  const tagNodes = headElement.querySelectorAll(`${type}[${HELMET_ATTRIBUTE}]`);
  const oldTags = Array.prototype.slice.call(tagNodes);
  const newTags: any[] = [];
  let indexToDelete: number;

  if (tags && tags.length) {
    tags.forEach((tag) => {
      const newElement = document.createElement(type);

      for (const attribute in tag) {
        if (tag.hasOwnProperty(attribute)) {
          if (attribute === TAG_PROPERTIES.INNER_HTML) {
            newElement.innerHTML = tag.innerHTML;
          } else if (attribute === TAG_PROPERTIES.CSS_TEXT) {
            if (newElement.style) {
              newElement.style.cssText = tag.cssText;
            } else {
              newElement.appendChild(document.createTextNode(tag.cssText));
            }
          } else {
            const value =
              typeof tag[attribute] === 'undefined' ? '' : tag[attribute];
            newElement.setAttribute(attribute, value);
          }
        }
      }

      newElement.setAttribute(HELMET_ATTRIBUTE, 'true');

      // Remove a duplicate tag from domTagstoRemove, so it isn't cleared.
      if (
        oldTags.some((existingTag, index) => {
          indexToDelete = index;
          return newElement.isEqualNode(existingTag);
        })
      ) {
        oldTags.splice(indexToDelete, 1);
      } else {
        newTags.push(newElement);
      }
    });
  }

  oldTags.forEach((tag) => tag.parentNode.removeChild(tag));
  newTags.forEach((tag) => headElement.appendChild(tag));

  return {
    oldTags,
    newTags,
  };
};

const generateElementAttributesAsString = (
  attributes: Record<string, string>
) =>
  Object.keys(attributes).reduce((str, key) => {
    const attr =
      typeof attributes[key] !== 'undefined'
        ? `${key}="${attributes[key]}"`
        : `${key}`;
    return str ? `${str} ${attr}` : attr;
  }, '');

const generateTitleAsString = (
  type: string,
  title: string,
  attributes: Record<string, string>,
  encode: boolean
) => {
  const attributeString = generateElementAttributesAsString(attributes);
  const flattenedTitle = flattenArray(title);
  return attributeString
    ? `<${type} ${HELMET_ATTRIBUTE}="true" ${attributeString}>${encodeSpecialCharacters(
        flattenedTitle,
        encode
      )}</${type}>`
    : `<${type} ${HELMET_ATTRIBUTE}="true">${encodeSpecialCharacters(
        flattenedTitle,
        encode
      )}</${type}>`;
};

const generateTagsAsString = (type: string, tags: any[], encode: boolean) =>
  tags.reduce((str, tag) => {
    const attributeHtml = Object.keys(tag)
      .filter(
        (attribute) =>
          !(
            attribute === TAG_PROPERTIES.INNER_HTML ||
            attribute === TAG_PROPERTIES.CSS_TEXT
          )
      )
      .reduce((string, attribute) => {
        const attr =
          typeof tag[attribute] === 'undefined'
            ? attribute
            : `${attribute}="${encodeSpecialCharacters(
                tag[attribute],
                encode
              )}"`;
        return string ? `${string} ${attr}` : attr;
      }, '');

    const tagContent = tag.innerHTML || tag.cssText || '';

    const isSelfClosing = SELF_CLOSING_TAGS.indexOf(type) === -1;

    return `${str}<${type} ${HELMET_ATTRIBUTE}="true" ${attributeHtml}${
      isSelfClosing ? `/>` : `>${tagContent}</${type}>`
    }`;
  }, '');

const convertElementAttributestoReactProps = (
  attributes: Record<string, string>,
  initProps: Record<string, string> = {}
) => {
  return Object.keys(attributes).reduce((obj, key) => {
    obj[REACT_TAG_MAP[key] || key] = attributes[key];
    return obj;
  }, initProps);
};

const convertReactPropstoHtmlAttributes = (
  props: Record<string, string>,
  initAttributes: Record<string, string> = {}
) => {
  return Object.keys(props).reduce((obj, key) => {
    obj[HTML_TAG_MAP[key] || key] = props[key];
    return obj;
  }, initAttributes);
};

const generateTitleAsReactComponent = (
  type: string,
  title: string,
  attributes: Record<string, string>
) => {
  // assigning into an array to define toString function on it
  const initProps: Record<string, any> = {
    key: title,
    [HELMET_ATTRIBUTE]: true,
  };
  const props = convertElementAttributestoReactProps(attributes, initProps);

  return [React.createElement(TAG_NAMES.TITLE, props, title)];
};

const generateTagsAsReactComponent = (type: string, tags: any[]) =>
  tags.map((tag, i) => {
    const mappedTag: any = {
      key: i,
      [HELMET_ATTRIBUTE]: true,
    };

    Object.keys(tag).forEach((attribute) => {
      const mappedAttribute = REACT_TAG_MAP[attribute] || attribute;

      if (
        mappedAttribute === TAG_PROPERTIES.INNER_HTML ||
        mappedAttribute === TAG_PROPERTIES.CSS_TEXT
      ) {
        const content = tag.innerHTML || tag.cssText;
        mappedTag.dangerouslySetInnerHTML = { __html: content };
      } else {
        mappedTag[mappedAttribute] = tag[attribute];
      }
    });

    return React.createElement(type, mappedTag);
  });

const getMethodsForTag = (type: string, tags: any, encode: boolean) => {
  switch (type) {
    case TAG_NAMES.TITLE:
      return {
        toComponent: () =>
          generateTitleAsReactComponent(type, tags.title, tags.titleAttributes),
        toString: () =>
          generateTitleAsString(type, tags.title, tags.titleAttributes, encode),
      };
    case ATTRIBUTE_NAMES.BODY:
    case ATTRIBUTE_NAMES.HTML:
      return {
        toComponent: () => convertElementAttributestoReactProps(tags),
        toString: () => generateElementAttributesAsString(tags),
      };
    default:
      return {
        toComponent: () => generateTagsAsReactComponent(type, tags),
        toString: () => generateTagsAsString(type, tags, encode),
      };
  }
};

const mapStateOnServer = ({
  baseTag,
  bodyAttributes,
  encode,
  htmlAttributes,
  linkTags,
  metaTags,
  noscriptTags,
  scriptTags,
  styleTags,
  title = '',
  titleAttributes,
}: any) => ({
  base: getMethodsForTag(TAG_NAMES.BASE, baseTag, encode),
  bodyAttributes: getMethodsForTag(
    ATTRIBUTE_NAMES.BODY,
    bodyAttributes,
    encode
  ),
  htmlAttributes: getMethodsForTag(
    ATTRIBUTE_NAMES.HTML,
    htmlAttributes,
    encode
  ),
  link: getMethodsForTag(TAG_NAMES.LINK, linkTags, encode),
  meta: getMethodsForTag(TAG_NAMES.META, metaTags, encode),
  noscript: getMethodsForTag(TAG_NAMES.NOSCRIPT, noscriptTags, encode),
  script: getMethodsForTag(TAG_NAMES.SCRIPT, scriptTags, encode),
  style: getMethodsForTag(TAG_NAMES.STYLE, styleTags, encode),
  title: getMethodsForTag(TAG_NAMES.TITLE, { title, titleAttributes }, encode),
});

const NullComponent = () => null;

const HelmetSideEffects = withSideEffect(
  reducePropsToState,
  handleClientStateChange,
  mapStateOnServer
)(NullComponent);

const Helmet = (Component: typeof HelmetSideEffects) => {
  return class HelmetWrapper extends React.Component {
    /**
     * @param {Object} base: {"target": "_blank", "href": "http://mysite.com/"}
     * @param {Object} bodyAttributes: {"className": "root"}
     * @param {String} defaultTitle: "Default Title"
     * @param {Boolean} defer: true
     * @param {Boolean} encodeSpecialCharacters: true
     * @param {Object} htmlAttributes: {"lang": "en", "amp": undefined}
     * @param {Array} link: [{"rel": "canonical", "href": "http://mysite.com/example"}]
     * @param {Array} meta: [{"name": "description", "content": "Test description"}]
     * @param {Array} noscript: [{"innerHTML": "<img src='http://mysite.com/js/test.js'"}]
     * @param {Function} onChangeClientState: "(newState) => console.log(newState)"
     * @param {Array} script: [{"type": "text/javascript", "src": "http://mysite.com/js/test.js"}]
     * @param {Array} style: [{"type": "text/css", "cssText": "div { display: block; color: blue; }"}]
     * @param {String} title: "Title"
     * @param {Object} titleAttributes: {"itemprop": "name"}
     * @param {String} titleTemplate: "MySite.com - %s"
     */
    static propTypes = {
      base: PropTypes.object,
      bodyAttributes: PropTypes.object,
      children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node,
      ]),
      defaultTitle: PropTypes.string,
      defer: PropTypes.bool,
      encodeSpecialCharacters: PropTypes.bool,
      htmlAttributes: PropTypes.object,
      link: PropTypes.arrayOf(PropTypes.object),
      meta: PropTypes.arrayOf(PropTypes.object),
      noscript: PropTypes.arrayOf(PropTypes.object),
      onChangeClientState: PropTypes.func,
      script: PropTypes.arrayOf(PropTypes.object),
      style: PropTypes.arrayOf(PropTypes.object),
      title: PropTypes.string,
      titleAttributes: PropTypes.object,
      titleTemplate: PropTypes.string,
    };

    static defaultProps = {
      defer: true,
      encodeSpecialCharacters: true,
    };

    // Component.peek comes from react-side-effect:
    // For testing, you may use a static peek() method available on the returned component.
    // It lets you get the current state without resetting the mounted instance stack.
    // Don’t use it for anything other than testing.
    static peek = Component.peek;

    static rewind = () => {
      let mappedState = Component.rewind();
      if (!mappedState) {
        // provide fallback if mappedState is undefined
        mappedState = mapStateOnServer({
          baseTag: [],
          bodyAttributes: {},
          encodeSpecialCharacters: true,
          htmlAttributes: {},
          linkTags: [],
          metaTags: [],
          noscriptTags: [],
          scriptTags: [],
          styleTags: [],
          title: '',
          titleAttributes: {},
        });
      }

      return mappedState;
    };

    mapNestedChildrenToProps(child: any, nestedChildren: any) {
      if (!nestedChildren) {
        return null;
      }

      switch (child.type) {
        case TAG_NAMES.SCRIPT:
        case TAG_NAMES.NOSCRIPT:
          return {
            innerHTML: nestedChildren,
          };

        case TAG_NAMES.STYLE:
          return {
            cssText: nestedChildren,
          };
      }

      throw new Error(
        `<${child.type} /> elements are self-closing and can not contain children. Refer to our API for more information.`
      );
    }

    flattenArrayTypeChildren({
      child,
      arrayTypeChildren,
      newChildProps,
      nestedChildren,
    }: any) {
      return {
        ...arrayTypeChildren,
        [child.type]: [
          ...(arrayTypeChildren[child.type] || []),
          {
            ...newChildProps,
            ...this.mapNestedChildrenToProps(child, nestedChildren),
          },
        ],
      };
    }

    mapObjectTypeChildren({
      child,
      newProps,
      newChildProps,
      nestedChildren,
    }: any) {
      switch (child.type) {
        case TAG_NAMES.TITLE:
          return {
            ...newProps,
            [child.type]: nestedChildren,
            titleAttributes: { ...newChildProps },
          };

        case TAG_NAMES.BODY:
          return {
            ...newProps,
            bodyAttributes: { ...newChildProps },
          };

        case TAG_NAMES.HTML:
          return {
            ...newProps,
            htmlAttributes: { ...newChildProps },
          };
      }

      return {
        ...newProps,
        [child.type]: { ...newChildProps },
      };
    }

    mapArrayTypeChildrenToProps(arrayTypeChildren: any, newProps: any) {
      let newFlattenedProps = { ...newProps };

      Object.keys(arrayTypeChildren).forEach((arrayChildName) => {
        newFlattenedProps = {
          ...newFlattenedProps,
          [arrayChildName]: arrayTypeChildren[arrayChildName],
        };
      });

      return newFlattenedProps;
    }

    warnOnInvalidChildren(child: any, nestedChildren: any) {
      if (process.env.NODE_ENV !== 'production') {
        if (!VALID_TAG_NAMES.some((name) => child.type === name)) {
          if (typeof child.type === 'function') {
            return warn(
              `You may be attempting to nest <Helmet> components within each other, which is not allowed. Refer to our API for more information.`
            );
          }

          return warn(
            `Only elements types ${VALID_TAG_NAMES.join(
              ', '
            )} are allowed. Helmet does not support rendering <${
              child.type
            }> elements. Refer to our API for more information.`
          );
        }

        if (
          nestedChildren &&
          typeof nestedChildren !== 'string' &&
          (!Array.isArray(nestedChildren) ||
            nestedChildren.some(
              (nestedChild) => typeof nestedChild !== 'string'
            ))
        ) {
          throw new Error(
            `Helmet expects a string as a child of <${child.type}>. Did you forget to wrap your children in braces? ( <${child.type}>{\`\`}</${child.type}> ) Refer to our API for more information.`
          );
        }
      }

      return true;
    }

    mapChildrenToProps(children: any, newProps: any) {
      let arrayTypeChildren = {};

      React.Children.forEach(children, (child) => {
        if (!child || !child.props) {
          return;
        }

        const { children: nestedChildren, ...childProps } = child.props;
        const newChildProps = convertReactPropstoHtmlAttributes(childProps);

        this.warnOnInvalidChildren(child, nestedChildren);

        switch (child.type) {
          case TAG_NAMES.LINK:
          case TAG_NAMES.META:
          case TAG_NAMES.NOSCRIPT:
          case TAG_NAMES.SCRIPT:
          case TAG_NAMES.STYLE:
            arrayTypeChildren = this.flattenArrayTypeChildren({
              child,
              arrayTypeChildren,
              newChildProps,
              nestedChildren,
            });
            break;

          default:
            newProps = this.mapObjectTypeChildren({
              child,
              newProps,
              newChildProps,
              nestedChildren,
            });
            break;
        }
      });

      newProps = this.mapArrayTypeChildrenToProps(arrayTypeChildren, newProps);
      return newProps;
    }

    render() {
      const { children, ...props } = this.props as any;
      let newProps = { ...props };

      if (children) {
        newProps = this.mapChildrenToProps(children, newProps);
      }

      return <Component {...newProps} />;
    }
  };
};

const HelmetExport = Helmet(HelmetSideEffects);

export { HelmetExport as Helmet };
export default HelmetExport;
