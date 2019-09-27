export function formatString(format: string, values: any) {
  let str = format;
  if (arguments.length) {
    for (const key in values) {
      if (values.hasOwnProperty(key)) {
        str = str.replace(new RegExp('\\{' + key + '\\}', 'gi'), values[key]);
      }
    }
  }

  return str;
}
