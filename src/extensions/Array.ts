declare global {
  interface ArrayConstructor {
    diff: (array1: Array<any>, array2: Array<any>) => Array<any>;
  }
  interface Array<T> {
    sum: (this: Array<T>, property: string) => number;
    move: (this: Array<T>, oldIndex: number, newIndex: number) => this;
    first: (this: Array<T>) => T;
    last: (this: Array<T>) => T;
    selectRandom: (this: Array<T>) => T;
    shuffle: (this: Array<T>) => this;
  }
}

export {};

Array.diff = (array1, array2) => {
  return array1.concat(array2).filter((el) => {
    return (
      (array1.includes(el) && !array2.includes(el)) ||
      (!array1.includes(el) && array2.includes(el))
    );
  });
};

Array.prototype.sum = function (property) {
  return this.reduce(
    property
      ? (accumulator, element) => {
          return (
            accumulator +
            (typeof element[property] === 'number' ? element[property] : 0)
          );
        }
      : (accumulator, element) => {
          return accumulator + (typeof element === 'number' ? element : 0);
        },
    0
  );
};

Array.prototype.move = function (oldIndex, newIndex) {
  if (newIndex >= this.length) {
    let k = newIndex - this.length + 1;
    while (k--) {
      this.push(undefined);
    }
  }
  this.splice(newIndex, 0, this.splice(oldIndex, 1)[0]);
  return this;
};

Array.prototype.first = function () {
  return this[0];
};

Array.prototype.last = function () {
  return this[this.length - 1];
};

Array.prototype.selectRandom = function () {
  return this[Math.floor(Math.random() * this.length)];
};

Array.prototype.shuffle = function () {
  return this.sort(() => Math.random() - 0.5);
};
