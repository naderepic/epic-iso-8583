function assembleBitMap() {
  const bitmapArray = new Uint8Array(128);
  const fields = Object.keys(this.dataElements);
  bitmapArray[0] = 1;

  // Construct 128-bit mask
  for (let i = 0; i < fields.length; i++) {
    const field = parseInt(fields[i], 10);
    if (field > 1) {
      bitmapArray[field - 1] = 1;
    }
  }

  return bitmapArray;
}

module.exports = assembleBitMap;
