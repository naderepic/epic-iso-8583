// Import required modules
require('dotenv').config();

const T = require('./tools');
const msgTypes = require('./msgTypes');

const assembleBitMap = require('./bitmap/assembleBitMap');
const assembleBitMap_127 = require('./bitmap/assembleBitMap_127');
const assembleBitMap_127_25 = require('./bitmap/assembleBitMap_127_25');

const assembleDataElements = require('./pack/assembleDataElements');
const assemble127_extensions = require('./pack/assemble127_extensions');
const assemble127_25_extensions = require('./pack/assemble127_25_extensions');

const unpack_0_127 = require('./unpack/unpack_0_127');
const unpack_127_1_63 = require('./unpack/unpack_127_1_63');
const unpack_127_25_1_63 = require('./unpack/unpack_127_25_1_63');

class Main {
  constructor(dataElements) {
    if (dataElements) {
      this.MsgType = dataElements[0];
      this.dataElements = dataElements;
    } else {
      this.MsgType = null;
      this.dataElements = {};
    }

    this.assembleBitMap = assembleBitMap.bind(this);
    this.assembleBitMap_127 = assembleBitMap_127.bind(this);
    this.assembleBitMap_127_25 = assembleBitMap_127_25.bind(this);

    this.assembleDataElements = assembleDataElements.bind(this);
    this.assemble127_extensions = assemble127_extensions.bind(this);
    this.assemble127_25_extensions = assemble127_25_extensions.bind(this);

    this.unpack_0_127 = unpack_0_127.bind(this);
    this.unpack_127_1_63 = unpack_127_1_63.bind(this);
    this.unpack_127_25_1_63 = unpack_127_25_1_63.bind(this);
  }

  checkMTI() {
    return msgTypes(this.dataElements['0']) ? true : false;
  }

  _checkMTI(mti) {
    if (msgTypes(mti)) return true;
    else return false;
  }

  getMTI() {
    const state = this.checkMTI();
    if (state) {
      const mti = this.MsgType;

      if (mti === null || mti === undefined) {
        return T.toErrorObject(['mti undefined in message']);
      } else {
        if (this.checkMTI()) {
          let _mti;

          if (!this.dataElements['0']) {
            if (!this.MsgType) return T.toErrorObject(['mti undefined on field 0']);
            else _mti = this.MsgType;
          } else _mti = this.dataElements['0'];

          const mtiArray = new Uint8Array(4);
          for (let i = 0; i < 4; i++) {
            mtiArray[i] = parseInt(_mti[i], 10);
          }

          const data = { mti: mtiArray.join('') };
          return T.toSuccessObject(data);
        } else {
          return T.toErrorObject(['invalid mti']);
        }
      }
    } else {
      return T.toErrorObject(['mti undefined on field 0']);
    }
  }

  buildBitmapBuffer(bitmap, type) {
    if (type === 'ascii') return Buffer.alloc(32, bitmap.toUpperCase());
    else return Buffer.alloc(16, bitmap, 'hex');
  }

  getBitMapHex() {
    const bitmaps = this.assembleBitMap();
    let hexMap = '';
    const hexMaps = [];
    let counter = 0;

    for (let i = 0; i < bitmaps.length; i++) {
      counter++;
      hexMap += bitmaps[i];

      if (counter === 4) {
        hexMaps.push(parseInt(hexMap, 2).toString(16));
        counter = 0;
        hexMap = '';
      }
    }

    return hexMaps.join('');
  }

  hasSecondaryBitmap(primaryBitmapBuffer, config) {
    const binary = primaryBitmapBuffer.toString(config.bitmapEncoding || 'hex');
    const bitmap = T.getHex(binary).split('').map(Number);
    return bitmap[0] === 1;
  }

  getBitMapHex_127_ext() {
    const state = this.assembleBitMap_127();
    if (state.error) {
      return state;
    } else {
      let hexMap = '';
      const hexMaps = [];
      let counter = 0;

      for (let i = 0; i < state.length; i++) {
        counter++;
        hexMap += state[i];

        if (counter === 4) {
          hexMaps.push(parseInt(hexMap, 2).toString(16));
          counter = 0;
          hexMap = '';
        }
      }

      return hexMaps.join('');
    }
  }

  getBitMapHex_127_25_ext() {
    const state = this.assembleBitMap_127_25();
    if (state.error) {
      return state;
    } else {
      let hexMap = '';
      const hexMaps = [];
      let counter = 0;

      for (let i = 0; i < state.length; i++) {
        counter++;
        hexMap += state[i];

        if (counter === 4) {
          hexMaps.push(parseInt(hexMap, 2).toString(16));
          counter = 0;
          hexMap = '';
        }
      }

      return hexMaps.join('');
    }
  }

  buildIsoMessage() {
    const bufferMessage = this.assembleDataElements();
    if (bufferMessage.error) {
      return bufferMessage;
    } else {
      const len_0_127_1 = T.getTCPHeaderBuffer(
        parseInt(Number(bufferMessage.byteLength) / 256, 10)
      );
      const len_0_127_2 = T.getTCPHeaderBuffer(
        parseInt(Number(bufferMessage.byteLength) % 256, 10)
      );
      return Buffer.concat([len_0_127_1, len_0_127_2, bufferMessage]);
    }
  }

  getIsoJSON(buffer, config) {
    const _config = config || {};

    if (Buffer.isBuffer(buffer)) {
      if (_config.lenHeader === false) {
        buffer = buffer.slice(0, buffer.byteLength);
      } else {
        buffer = buffer.slice(2, buffer.byteLength);
      }

      const iso = this.unpack_0_127(buffer, {}, _config);
      if (iso.error) {
        return iso;
      } else {
        return iso.json;
      }
    } else {
      return T.toErrorObject(['expecting buffer but got ', typeof buffer]);
    }
  }
}

module.exports = Main;
