declare global {
  interface String {
    toTitleCase: (isUnderscoreSeparated?: boolean) => string;
    isTitleCase: () => boolean;
    isUpperCase: () => boolean;
    isLowerCase: () => boolean;
    contains: (string: string) => boolean;
    chunk: (
      config:
        | number
        | {
            indexChunkLength?: number;
            numberOfChunks?: number;
            chunkLength?: number;
            rawOutput?: boolean;
          },
      indexChunkLength?: number
    ) => string | string[] | number | number[];
    reverse: () => string;
    hyphenatePascal: () => string;
    titleCasePascal: () => string;
    toCamelCase: (from: 'HYPHENATED' | 'UPPER_CASE') => string;
    replaceAt: (
      startIndex?: number,
      replacement?: string,
      endIndex?: number
    ) => string;
    insertAt: (index?: number, insertion?: string) => string;
    trimIndent: () => string;
  }
}

export {};

String.prototype.toTitleCase = function (isUnderscoreSeparated) {
  this.toLowerCase();
  let words;
  if (isUnderscoreSeparated) {
    words = this.split('_');
  } else {
    words = this.split(/\s/g);
  }
  words.forEach((word, index) => {
    !(isUnderscoreSeparated || word.toUpperCase() !== word) ||
      (words[index] = word.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }));
  });
  return words.join(' ');
};

String.prototype.isTitleCase = function () {
  return this.split(' ').every((string) => {
    return (
      string.isUpperCase() ||
      (string.charAt(0).isUpperCase() && string.slice(1).isLowerCase())
    );
  });
};

String.prototype.isUpperCase = function () {
  return String(this) === this.toUpperCase();
};

String.prototype.isLowerCase = function () {
  return String(this) === this.toLowerCase();
};

String.prototype.contains = function (string) {
  return this.indexOf(string) !== -1;
};

String.prototype.chunk = function (config, indexChunkLength) {
  config || (config = {});
  if (
    !indexChunkLength &&
    typeof config === 'object' &&
    config.indexChunkLength
  ) {
    indexChunkLength = config.indexChunkLength;
  }
  const string = String(this);
  let numberOfChunks =
    typeof config === 'number' ? config : config.numberOfChunks;
  let chunkDigest = string;
  let chunkedOutput: Array<any> = [];
  if (numberOfChunks) {
    if (indexChunkLength) {
      chunkedOutput.push(indexChunkLength);
      chunkDigest = this.substring(indexChunkLength, this.length);
      numberOfChunks--;
    }
    const chunkDigestLength = chunkDigest.length;
    const chunkLength = Math.floor(chunkDigest.length / numberOfChunks);
    for (let i = 1; i <= numberOfChunks; i++) {
      chunkedOutput.push(chunkLength);
      if (i === numberOfChunks) {
        chunkedOutput[i - 1] += chunkDigestLength % numberOfChunks;
      }
    }
    chunkedOutput = chunkedOutput.map((currentChunckLength, index) => {
      return string.substr(
        index > 0
          ? chunkedOutput.slice(0, index).reduce((a: number, b: number) => {
              return a + b;
            }, 0)
          : 0,
        currentChunckLength
      );
    });
  } else if (typeof config === 'object' && config.chunkLength) {
    do {
      chunkedOutput.push(chunkDigest.substr(0, config.chunkLength));
      chunkDigest = chunkDigest.substring(config.chunkLength);
    } while (chunkDigest.length > 0);
  }
  if (typeof config === 'object' && config.rawOutput) return chunkedOutput;
  return chunkedOutput.join(' ');
};

String.prototype.reverse = function () {
  return this.split('').reverse().join('');
};

String.prototype.hyphenatePascal = function () {
  if (this.toUpperCase() === this.toString()) return this.toLowerCase();
  return this.replace(/[A-Z]+/g, (upperCaseCharacters) => {
    if (upperCaseCharacters.length > 1) {
      if (upperCaseCharacters.length === 2)
        return (
          upperCaseCharacters.charAt(0) +
          upperCaseCharacters.charAt(1).toLowerCase()
        );
      return (
        upperCaseCharacters.charAt(0) +
        upperCaseCharacters
          .substring(1, upperCaseCharacters.length - 1)
          .toLowerCase() +
        upperCaseCharacters.charAt(upperCaseCharacters.length - 1)
      );
    }
    return upperCaseCharacters;
  }).replace(
    /[A-Z]/g,
    (upperCaseCharacters, offset) =>
      (offset > 0 ? '-' : '') + upperCaseCharacters.toLowerCase()
  );
};

String.prototype.titleCasePascal = function () {
  const inputString = String(this);
  if (inputString.toUpperCase() === inputString) return inputString;
  return this.replace(
    /[A-Z]/g,
    (upperCaseCharacters, offset) =>
      (offset > 0 ? ' ' : '') + upperCaseCharacters
  )
    .toTitleCase()
    .replace(/(?<=\b[A-Z])\s(?=[A-Z]\b)/g, '');
};

String.prototype.toCamelCase = function (from) {
  let string = String(this);
  switch (from) {
    case 'HYPHENATED':
      string = string
        .split('-')
        .map((subString) => subString.toTitleCase())
        .join('');
      break;
    case 'UPPER_CASE':
      string = string.toTitleCase(true).replace(/\s/g, '');
      break;
  }
  return string.charAt(0).toLowerCase() + string.substr(1);
};

String.prototype.replaceAt = function (
  startIndex = 0,
  replacement = '',
  endIndex = 0
) {
  const replacementString = typeof replacement === 'string' ? replacement : '';
  const replacementLength =
    typeof replacement === 'number' ? replacement : replacement.length;
  return (
    this.substr(0, startIndex) +
    replacementString +
    this.substr(endIndex || startIndex + replacementLength)
  );
};

String.prototype.insertAt = function (index = 0, insertion = '') {
  return this.substr(0, index) + insertion + this.substr(index);
};

String.prototype.trimIndent = function () {
  return this.trim()
    .split('\n')
    .map((string) => string.trimStart())
    .join('\n');
};
