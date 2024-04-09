// Import required modules
const T = require('../tools');

function assembleBitMap_127() {
  const state = this.checkMTI();
  if (this.dataElements['0'] && state) {
    const bitmapArray = new Uint8Array(64);

    for (let i = 0; i < bitmapArray.length; i++) {
      const field = '127.' + (i + 1);
      // if (field === '127.25') {
      //   const keyFound = Object.keys(this.dataElements).find((key) => key.startsWith('127.25'));
      //   bitmapArray[i] = keyFound ? 1 : 0;
      // } else
      if (this.dataElements[field]) {
        bitmapArray[i] = 1;
      }
    }

    return bitmapArray;
  } else {
    return T.toErrorObject('bitmap error, iso message type undefined or invalid');
  }
}

module.exports = assembleBitMap_127;
