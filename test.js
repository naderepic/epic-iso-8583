const moment = require('moment');
const crypto = require('crypto');

const iso8583 = require('./lib/iso8583');
const connectToIswServer = require('./lib/interSwitch.service');

const cipher = crypto.createCipheriv('des-ecb', Buffer.from('4d1ad5305af55d61', 'hex'), null);

const pin = '1234'; // Your PIN
let encrypted = cipher.update(pin, 'utf8', 'hex');
encrypted += cipher.final('hex');

const stan = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
const transmissionDateTime = moment.utc().format('MMDDhhmmss');
const dataElements = {
  0: '0200',
  2: '5559401234567877',
  3: '500000',
  4: '000000100000',
  7: transmissionDateTime,
  11: stan.toString(),
  12: moment().format('hhmmss'),
  13: moment().format('MMDD'),
  14: '2407',
  15: moment().format('MMDD'),
  18: '6013',
  22: '051',
  23: '000',
  25: '00',
  26: '04',
  28: 'D00010000',
  32: '12345678',
  33: '111111',
  35: '5559401234567877=2407221',
  37: `734119${stan}`,
  40: '221',
  41: '2EPTXXXX',
  42: '2EPT00000000001',
  43: 'S&O TELECOM            AGBADO         NG',
  49: '566',
  52: encrypted,
  98: '3FAB000100000000000000000',
  100: '666057',
  103: '2090512395',
  123: '510101511344101',
  127.2: `0200:${stan}:${transmissionDateTime}:787755594`,
  127.13: '      000000  566',
  '127.20': moment().format('YYYYMMDD'),
  127.22: `212ORIGINAL_RID235<ORIGINAL_RID>627629</ORIGINAL_RID>`,
  127.25: `<?xml version='1.0' encoding='UTF-8'?><IccData><IccRequest><AmountAuthorized>000000000100</AmountAuthorized><AmountOther>000000000000</AmountOther><ApplicationIdentifier>A0000000041010</ApplicationIdentifier><ApplicationInterchangeProfile>3900</ApplicationInterchangeProfile><ApplicationTransactionCounter>0649</ApplicationTransactionCounter><Cryptogram>47A6DF4D1C0F0A0C</Cryptogram><CryptogramInformationData>80</CryptogramInformationData><CvmResults>420301</CvmResults><IssuerApplicationData>0110A000002A0000000000000000000000FF</IssuerApplicationData><TerminalCapabilities>E0F8C8</TerminalCapabilities><TerminalCountryCode>566</TerminalCountryCode><TerminalVerificationResult>0440248000</TerminalVerificationResult><TransactionCurrencyCode>566</TransactionCurrencyCode><TransactionDate>231027</TransactionDate><DedicatedFileName>A0000000041010</DedicatedFileName><TransactionType>50</TransactionType><UnpredictableNumber>576D7C9F</UnpredictableNumber></IccRequest></IccData>`,
  127.33: '6008',
  127.41: '10.2.103.19,36065'
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
