# epic-iso-8583

epic-iso-8583 is a <span style="color:green; font-size:18px">Customizable ISO 8583 Library for JavaScript and NodeJS</span> that does message conversion between a system and an interface that exchange [ISO 8583 Financial transaction card originated messages](https://en.wikipedia.org/wiki/ISO_8583).

## Install from GitHub using

```shell
npm install @naderepic/epic-iso-8583
```

## Basic Usage: Bitmap Messaging

See the a sample usage example see [this example](https://github.com/naderepic/epic-iso-8583/tree/develop/example)

```javascript
const moment = require('moment');
const CryptoJS = require('crypto-js');
const iso8583 = require('@naderepic/epic-iso-8583');

const key = CryptoJS.enc.Hex.parse(process.env.PIN_ENCRYPTION_KEY);
const pin = '2587';
// Perform DES encryption on PIN
const encrypted = CryptoJS.DES.encrypt(pin, key, {
mode: CryptoJS.mode.ECB,
});

// Convert ciphertext as hex string
const encryptedPin = encrypted.ciphertext.toString();

const stan = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
const transmissionDateTime = moment.utc().format('MMDDhhmmss');
const switchKey = `0200:${stan}:${transmissionDateTime}:787755594`;
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
    52: encryptedPin,
    98: '3FAB000100000000000000000',
    100: '666057',
    103: '2090512395',
    123: '510101511344101',
    127.2: switchKey,
    127.13: '      000000  566',
    '127.20': moment().format('YYYYMMDD'),
    127.22: `212ORIGINAL_RID235<ORIGINAL_RID>627629</ORIGINAL_RID>`,
    127.25: `<?xml version='1.0' encoding='UTF-8'?><IccData><IccRequest><AmountAuthorized>000000000100</AmountAuthorized><AmountOther>000000000000</AmountOther><ApplicationIdentifier>A0000000041010</ApplicationIdentifier><ApplicationInterchangeProfile>3900</ApplicationInterchangeProfile><ApplicationTransactionCounter>0649</ApplicationTransactionCounter><Cryptogram>47A6DF4D1C0F0A0C</Cryptogram><CryptogramInformationData>80</CryptogramInformationData><CvmResults>420301</CvmResults><IssuerApplicationData>0110A000002A0000000000000000000000FF</IssuerApplicationData><TerminalCapabilities>E0F8C8</TerminalCapabilities><TerminalCountryCode>566</TerminalCountryCode><TerminalVerificationResult>0440248000</TerminalVerificationResult><TransactionCurrencyCode>566</TransactionCurrencyCode><TransactionDate>231027</TransactionDate><DedicatedFileName>A0000000041010</DedicatedFileName><TransactionType>50</TransactionType><UnpredictableNumber>576D7C9F</UnpredictableNumber></IccRequest></IccData>`,
    127.33: '6008',
    127.41: '10.2.103.19,36065',
};

// Initialize your ISO 8583 message
let isoPack = new iso8583(dataElements);
```

The object initialized has the following methods:

```javascript
let bufferMessage = isoPack.buildIsoMessage(); 
// returns a buffer containing the message with 2 additional bytes indicating the length 
// or an error object
<Buffer 05 a4 30 32 30 30 f2 3e 46 d1 a9 e0 90 00 00 00 00 00 52 00 00 22 31 36 35 35 35 39 34 30 31 32 33 34 35 36 37 38 37 37 35 30 30 30 30 30 30 30 30 30 ... 1396 more bytes>

```

To unpack a message from the interface, that usually comes in a tcp stream/buffer just parse the incoming buffer or string to the method

```javascript
let incoming = new iso8583().getIsoJSON(incoming);
// returns parsed json object:
let testData = {
    "0": "0210",
    "2": "5559401234567877",
    "3": "500000",
    "4": "000000100000",
    "7": "0412010408",
    "11": "472579",
    "12": "010408",
    "13": "0412",
    "14": "2407",
    "15": "0408",
    "18": "6013",
    "22": "051",
    "23": "000",
    "25": "00",
    "28": "D00010000",
    "30": "C00000000",
    "32": "12345678",
    "33": "111111",
    "35": "5559401234567877=2407221",
    "37": "734119472579",
    "39": "00",
    "40": "221",
    "41": "2EPTXXXX",
    "42": "2EPT00000000001",
    "43": "S&O TELECOM            AGBADO         NG",
    "49": "566",
    "54": "4002840C0000000100004001840D000000010000",
    "59": "666057",
    "98": "2090512395,00,627629,    ",
    "103": "2090512395",
    "123": "510101511344101",
    "127.2": "0200:472579:0412010408:787755594",
    "127.3": "EPICSRC     AcCOSnk     472579472579DebitGroup  ",
    "127.6": "11",
    "127.13": "      000000  566",
    "127.20": "20230408",
    "127.22": "212ORIGINAL_RID235<ORIGINAL_RID>627629</ORIGINAL_RID>219INTRA_BANK_TRANSFER247<INTRA_BANK_TRANSFER>true</INTRA_BANK_TRANSFER>",
    "127.33": "8501"
};

```
### Message Packaging and Un-packaging

This library uses a default mode of message encoding and packaging. If you are using a third party message source or a third party packaging source, you have to pre-format your data to meet the default encoding or configure things for yourself. See configuration for more info.

### Unpacking

This only applies when you are receiving messages from others sources that don't encode as per this library like JPos.
Default unpack conditions:

`2-byte leng header in hex` + `4-byte MTI encoded in utf8` + `16-byte Bitmap encoded in hex`

If the message you are receiving is in a different state, the passing config to `getIsoJSON` like below.

### Packing

Messages are packaged as:

- 2 byte length indicator + 4 byte message type + 16 byte bitmap(primary + secondary bitmap) + message field data.
- Each field with variable length data is preceded with the actual length of the data in that field.

## <span style="color:green">Thanks</span> , <span style="color:blue">Have</span> <span style="color:orange">Fun</span>