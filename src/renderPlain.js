import _ from 'lodash';

const stringify = (value) => {
  if (_.isObject(value)) {
    return '[complex value]';
  }
  if (typeof value === 'string') {
    return `'${value}'`;
  }

  return value;
};

const getName = names => names.join('.');

const methods = {
  unchanged: property => `Property '${getName(property)}' wasn't changed`,
  added: (property, value) => `Property '${getName(property)}' was added with value: ${value}`,
  deleted: property => `Property '${getName(property)}' was removed`,
  updated: (property, currentValue, previousValue) => `Property '${getName(property)}' was updated. From ${previousValue} to ${currentValue}`,
  nested: (property, currentValue, previousValue, children) => `${children}`,
};

const toString = (
  status, property, currentValue, previousValue, children,
) => methods[status](property, stringify(currentValue), stringify(previousValue), children);

export default (diff) => {
  const genOutput = (arr, previousProperties) => {
    const strings = arr.map(node => toString(
      node.status,
      [...previousProperties, node.property],
      node.currentValue,
      node.previousValue,
      genOutput(node.children, [...previousProperties, node.property]),
    ));
    return `${strings.join('\n')}`;
  };

  return genOutput(diff, []);
};