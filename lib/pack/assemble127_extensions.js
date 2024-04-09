// Import required modules
const formats = require('../formats');
const types = require('../types');
const T = require('../tools');

function assemble127_extensions() {
  const mtiCheck = this.checkMTI();
  if (mtiCheck) {
    const bitmaps_127 = this.assembleBitMap_127();
    const bmpsHex = this.getBitMapHex_127_ext();
    let buff = Buffer.alloc(8, bmpsHex, 'hex');

    for (let i = 0; i < bitmaps_127.length; i++) {
      const field = '127.' + (Number(i) + 1);
      if (bitmaps_127[i] === 1) {
        // if (field === '127.25') {
        //   const _25_buff = this.assemble127_25_extensions();
        //   if (!_25_buff.error) {
        //     if (_25_buff.byteLength > 12) {
        //       buff = Buffer.concat([buff, _25_buff]);
        //       continue;
        //     } else {
        //       continue;
        //     }
        //   }
        // }

        if (!this.dataElements[field]) {
          return { error: 'Field ' + field + ' in bitmap but not in json' };
        }

        const this_format = formats[field];
        if (this_format) {
          const state = types(this_format, this.dataElements[field], field);
          if (state.error) {
            return state;
          }

          if (this_format.LenType === 'fixed') {
            if (formats[field].ContentType === 'b') {
              if (this_format.MaxLen === this.dataElements[field].length) {
                const size = this_format.MaxLen / 2;
                const thisBuff = Buffer.alloc(size, this.dataElements[field], 'hex');
                buff = Buffer.concat([buff, thisBuff]);
              } else {
                return { error: 'invalid length of data on field ' + field };
              }
            } else {
              if (this_format.MaxLen === this.dataElements[field].length) {
                const thisBuff = Buffer.alloc(
                  this.dataElements[field].length,
                  this.dataElements[field]
                );
                buff = Buffer.concat([buff, thisBuff]);
              } else {
                return { error: 'invalid length of data on field ' + field };
              }
            }
          } else {
            const thisLen = T.getLenType(this_format.LenType);
            if (!this_format.MaxLen) {
              return { error: 'max length not implemented for ' + this_format.LenType + field };
            }

            if (this.dataElements[field] && this.dataElements[field].length > this_format.MaxLen) {
              return { error: 'invalid length of data on field ' + field };
            }

            if (thisLen === 0) {
              return { error: 'field' + field + ' has no field implementation' };
            } else {
              const actualLength = this.dataElements[field].length;
              const padCount = thisLen - actualLength.toString().length;
              let lenIndicator = actualLength.toString();
              for (let i = 0; i < padCount; i++) lenIndicator = 0 + lenIndicator;

              const thisBuff = Buffer.alloc(
                this.dataElements[field].length + lenIndicator.length,
                lenIndicator + this.dataElements[field]
              );
              buff = Buffer.concat([buff, thisBuff]);
            }
          }
        } else {
          return { error: 'field ' + field + ' not implemented' };
        }
      }
    }

    const padCount = T.getLenType(formats['127'].LenType);
    let actualLen = buff.byteLength.toString();
    const x = padCount - actualLen.length;

    for (let i = 0; i < x; i++) actualLen = '0' + actualLen;

    const bitmapBuff = buff.slice(0, 8);
    const lenBuff = Buffer.alloc(actualLen.length, actualLen);
    const dataBuff = buff.slice(8, buff.byteLength);

    return Buffer.concat([lenBuff, bitmapBuff, dataBuff]);
  } else {
    return T.toErrorObject('Invalid Message in 127 extensions');
  }
}

module.exports = assemble127_extensions;
