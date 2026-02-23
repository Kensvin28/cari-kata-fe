import { env } from '$env/dynamic/public';

function isValidCharacters(input: string): boolean {
  const regex = /^[a-zA-Z ]+$/;
  return regex.test(input);
}

function isValidMapping(input: string): boolean {
  const pairs = input.split(',').map(pair => pair.trim());
  const regex = /^[1-9][0-9]*:[a-zA-Z]$/;

  if (!pairs.every(pair => regex.test(pair))) return false;
  
  const positions = pairs.map(pair => parseInt(pair.split(':')[0]));
  // check if any position exceeds the maximum allowed word length
  if (Math.max(...positions) > parseInt(env.PUBLIC_MAX_WORD_LENGTH)) return false;
  // check if there are any duplicate positions
  const uniquePositions = new Set(positions);
  return positions.length === uniquePositions.size;
}

function isValidUnderscoreMapping(input: string): boolean {
  const regex = /^[a-zA-Z_]+$/;
  return regex.test(input);
}

export { isValidCharacters, isValidMapping, isValidUnderscoreMapping };