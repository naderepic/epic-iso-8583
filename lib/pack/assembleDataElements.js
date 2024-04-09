// Import required modules
const formats = require('../formats');
const types = require('../types');
const T = require('../tools');

function assembleDataElements() {
  const bitMapCheck = this.getBitMapHex();
  const bitmaps = this.assembleBitMap();

  const mti = this.getMTI();
  if (!mti.status) {
    return mti.error;
  }
  const mtiBuffer = Buffer.alloc(4, mti.data.mti);

  let buff;
  buff = this.buildBitmapBuffer(bitMapCheck, 'hex');
  buff = Buffer.concat([mtiBuffer, buff]);

  for (let i = 1; i < bitmaps.length; i++) {
    const field = i + 1;
    if (parseInt(bitmaps[i]) === 1) {
      // Assemble Field 127 and its sub-fields
      if (field === 127) {
        const _127_extensions = this.assemble127_extensions();
        if (!_127_extensions.error) {
          if (_127_extensions.byteLength > 12) {
            buff = Buffer.concat([buff, _127_extensions]);
            continue;
          } else {
            continue;
          }
        } else {
          return _127_extensions;
        }
      }
      if (!this.dataElements[field]) {
        console.log('Field ', field, ' in bitmap but not in json');
      }
      const this_format = formats[field];
      const state = types(this_format, this.dataElements[field], field);
      if (state.error) {
        return state;
      }

      if (this_format) {
        if (this_format.LenType === 'fixed') {
          if (this_format.ContentType === 'b') {
            if (this_format.MaxLen === this.dataElements[field].length) {
              const size = this_format.MaxLen / 2;
              const thisBuff = Buffer.alloc(size, this.dataElements[field], 'hex');
              buff = Buffer.concat([buff, thisBuff]);
            } else {
              console.log('invalid length of data on field ', field);
            }
          } else {
            if (this_format.MaxLen === this.dataElements[field].length) {
              const thisBuff = Buffer.alloc(
                this.dataElements[field].length,
                this.dataElements[field]
              );
              buff = Buffer.concat([buff, thisBuff]);
            } else {
              console.log('invalid length of data on field ', field);
            }
          }
        } else {
          const thisLen = T.getLenType(this_format.LenType);
          if (!this_format.MaxLen)
            console.log('max length not implemented for ', this_format.LenType, field);
          if (this.dataElements[field] && this.dataElements[field].length > this_format.MaxLen)
            console.log('invalid length of data on field ', field);
          if (thisLen === 0) {
            console.log('field', field, ' has no field implementation');
          } else {
            const actualLength = this.dataElements[field].length;
            const padCount = thisLen - actualLength.toString().length;
            let lenIndicator = actualLength.toString();
            for (let i = 0; i < padCount; i++) {
              lenIndicator = 0 + lenIndicator;
            }
            const thisBuff = Buffer.alloc(
              this.dataElements[field].length + lenIndicator.length,
              lenIndicator + this.dataElements[field]
            );
            buff = Buffer.concat([buff, thisBuff]);
          }
        }
      } else {
        console.log('field ', field, ' has invalid data');
      }
    }
  }

  return Buffer.concat([buff]);
}

module.exports = assembleDataElements;
