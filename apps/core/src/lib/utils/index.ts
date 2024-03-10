export function toPossessive(str) {
  const suffix = str.endsWith('s') ? "'" : "'s";
  return str + suffix;
}
