const moment = require('moment');

const iso8583 = require('../lib/iso8583');
const connectToIswServer = require('../lib/interSwitch.service');

const stan = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
const transmissionDateTime = moment.utc().format('MMDDhhmmss');
const dataElements = {
  0: '0420',
  2: '5559401234567877',
  3: '000000',
  4: '000000001000',
  5: '000000011914',
  7: transmissionDateTime,
  11: stan.toString(),
  12: moment().format('hhmmss'),
  13: moment().format('MMDD'),
  14: '2407',
  15: moment().format('MMDD'),
  18: '6011',
  22: '000',
  23: '001',
  25: '00',
  26: '12',
  28: 'C00000000',
  29: 'D00000000',
  32: '000039',
  35: '5559401234567877=2407221',
  41: '4023SNKP',
  42: '4KPOLU000000002',
  43: 'S&O TELECOM            AGBADO         NG',
  49: '566',
  56: '4021',
  90: '020055306204151000310001234567800000111111',
  95: '000000000000000000000000C00000000C00000000',
  100: '17177',
  123: '51120151114C021',
  127.2: 'SIMNODE_00005646',
  127.8: ' 302202362102786 | ',
  127.11: 'SIMNODE_00005645',
  127.13: '              834',
  '127.20': moment().format('YYYYMMDD'),
  127.22: `218Postilion:MetaData21116MSISDN111`,
  127.27: 'U',
  '127.40': '12M0232FDC9F609EDE61CEB25790AC4BB5ACB23'
};
const isoPack = new iso8583(dataElements);

const isoBufferMessage = isoPack.buildIsoMessage();
console.log({ isoBufferMessage });

const unpackedMessage = new iso8583().getIsoJSON(isoBufferMessage);
console.log({ unpackedMessage });

if (process.env.CONNECT_ISW_SERVER === 'true') {
  // Connect to the server and send message
  const iswClient = connectToIswServer();
  try {
    iswClient.write(isoBufferMessage);
  } catch (error) {
    throw new Error(error.message);
  }
}
