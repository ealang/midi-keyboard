const numKeys = 88,
      numWhiteKeys = 52,
      keyStart = 21,
      keyEnd = keyStart + numKeys;

const keySize = 18,
      keyBorderWidth = 2,
      whiteKeyWidth = keySize,
      blackKeyWidth = keySize * 2 / 3,
      whiteKeyHeight = keySize * 5,
      blackKeyHeight = keySize * 5 / 2,
      keyboardOffset = keyBorderWidth / 2,
      dragBarHeight = keySize,
      keyboardHeight = whiteKeyHeight + keyBorderWidth + dragBarHeight;

export const layout = {
  keyStart,
  keyEnd,
  numWhiteKeys,
  keyBorderWidth,
  whiteKeyWidth,
  blackKeyWidth,
  whiteKeyHeight,
  blackKeyHeight,
  keyboardOffset,
  keyboardHeight,
  dragBarHeight
};
