function toISOString(date: number) {
  return new Date(date * 1000).toISOString();
}

function toNumeric(date: string) {
  return new Date(date).valueOf() / 1000;
}

export default { toISOString, toNumeric };
