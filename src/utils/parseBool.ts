export function parseBool(
  val: string | undefined,
  defaultVal: boolean
): boolean;
export function parseBool(
  val: string | undefined,
  defaultVal?: undefined
): boolean | undefined;
export function parseBool(
  val: string | undefined,
  defaultVal?: boolean
): boolean | undefined {
  if (typeof val === 'string' && val.toLowerCase() === 'true') {
    return true;
  } else if (typeof val === 'string' && val.toLowerCase() === 'false') {
    return false;
  } else {
    return defaultVal;
  }
}
