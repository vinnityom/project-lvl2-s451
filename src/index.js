import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import parse from './parsers';
import render from './render';

const getPath = pathString => path.resolve(pathString);

const getContent = (filepath) => {
  const extention = path.extname(filepath);
  return parse(extention)(fs.readFileSync(getPath(filepath), 'utf-8'));
};

const buildAST = (property, status, value, children) => ({
  property,
  status,
  value,
  children,
});

const buildDiff = (contentBefore, contentAfter) => {
  const properties = _.union(_.keys(contentBefore), _.keys(contentAfter));

  return properties.map((property) => {
    const valueOfFrom = contentBefore[property];
    const valueOfTo = contentAfter[property];

    if (_.has(contentBefore, property) && _.has(contentAfter, property)) {
      if (valueOfFrom === valueOfTo) {
        return buildAST(property, 'unchanged', valueOfFrom);
      }

      if (_.isObject(valueOfFrom) && _.isObject(valueOfTo)) {
        return buildAST(property, 'unchanged', null, buildDiff(valueOfFrom, valueOfTo));
      }

      return buildAST(property, 'changed', { before: valueOfFrom, after: valueOfTo });
    }

    if (_.has(contentAfter, property)) {
      return buildAST(property, 'added', valueOfTo);
    }

    return buildAST(property, 'deleted', valueOfFrom);
  });
};

export default (filepath1, filepath2) => {
  const contentBefore = getContent(filepath1);
  const contentAfter = getContent(filepath2);
  const arr = buildDiff(contentBefore, contentAfter);

  return render(arr);
};
