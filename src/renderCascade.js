import _ from 'lodash';

const makeTab = times => '  '.repeat(times);

const stringify = (value, depth) => {
  if (!_.isObject(value)) {
    return value;
  }

  const strings = _.keys(value).map(key => `${makeTab(depth + 2)}  ${key}: ${value[key]}`);
  return `{\n${strings.join('\n')}\n${makeTab(depth + 1)}}`;
};

const methods = {
  unchanged: (depth, property, value) => `${makeTab(depth)}  ${property}: ${value}`,
  added: (depth, property, value) => `${makeTab(depth)}+ ${property}: ${value}`,
  deleted: (depth, property, value) => `${makeTab(depth)}- ${property}: ${value}`,
  updated: (depth, property, currentValue, previousValue) => [`${makeTab(depth)}- ${property}: ${previousValue}`, `${makeTab(depth)}+ ${property}: ${currentValue}`],
  nested: (depth, property, currentValue, previousValue, children) => `${makeTab(depth)}  ${property}: {\n${children}\n${makeTab(depth + 1)}}`,
};

const toString = (
  depth, status, property, currentValue, previousValue, children,
) => methods[status](
  depth, property, stringify(currentValue, depth), stringify(previousValue, depth), children,
);

export default (ast) => {
  const genOutput = (arr, depth) => {
    const strings = arr.map(element => toString(
      depth,
      element.status,
      element.property,
      element.currentValue,
      element.previousValue,
      genOutput(element.children, depth + 2),
    ));

    return `${_.flattenDeep(strings).join('\n')}`;
  };

  return `{\n${genOutput(ast, 1)}\n}`;
};