// Import required modules
const T = require('../tools');

function assembleBitmap_127_25() {
  const state = this.checkMTI();
  if (state) {
    if (this.dataElements['0'] && state) {
      const _map = new Uint8Array(64);
      for (let i = 0; i < _map.length; i++) {
        const field = '127.25.' + (i + 1);
        if (this.dataElements[field]) {
          _map[i] = 1;
        }
      }
      return _map;
    } else return T.toErrorObject('bitmap error, iso message type undefined or invalid');
  } else return T.toErrorObject('bitmap error, iso message type undefined or invalid');
}

module.exports = assembleBitmap_127_25;
