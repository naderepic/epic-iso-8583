const moment = require('moment');
const reversalMessage = require('./reversalMessage');

const stan = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
const transmissionDateTime = moment.utc().format('MMDDhhmmss');
const switchKey = `0200:${stan}:${transmissionDateTime}:787755594`;

const acquirerInstitutionIdCode = '12345678';
const forwardingInstitutionIdCode = '111111';
const originalData = {
  messageType: '0200',
  stan: stan.toString(),
  transmissionDateTime: transmissionDateTime,
  acquirerInstitutionIdCode: acquirerInstitutionIdCode.padStart(11, '0'),
  forwardingInstitutionIdCode: forwardingInstitutionIdCode.padStart(11, '0'),
  switchKey: switchKey
};
reversalMessage(originalData);
