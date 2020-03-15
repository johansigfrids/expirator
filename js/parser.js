export default function parser(str) {
  const result = {};
  let state = 'key';
  let from = 0;
  let key = null;
  let quote = null;
  for (let to = 0; to < str.length; to++) {
    if (to < from) {
      continue;
    }
    switch (state) {
      case 'key':
        if (str[to] === '=') {
          state = 'valueOrStr';
          key = str.slice(from, to);
          from = to + 1;
        }
        continue;
      case 'valueOrStr':
        if (str[to] === "'" || str[to] === '"') {
          state = 'str';
          quote = str[to];
          from = to + 1;
        } else {
          state = 'value';
        }
        continue;
      case 'str':
        if (str[to] == quote) {
          result[key] = str.slice(from, to);
          from = to + 2;
          state = 'key';
        }
        continue;
      case 'value':
        if (str[to] === ',') {
          result[key] = str.slice(from, to)
          from = to + 1;
          state = 'key';
        }
        continue;
      default:
        continue;
    }
  }
  if (state === 'value') {
    result[key] = str.slice(from, str.length);
  }
  return result;
}