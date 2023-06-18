const fs = require('fs');
const JSONStream = require('JSONStream');
const moment = require('moment');

const inputFilePath = './chain-info.json';

const stream = fs.createReadStream(inputFilePath, { encoding: 'utf8' });
const jsonStream = JSONStream.parse('list.*');

jsonStream.on('data', (data) => {
  const { chain, apr, inflation, txs, tps, updatedAt } = data;
  const values = data.market.values;
  const valuesBTC = data.market.valuesBTC;
  const date = new Date(updatedAt);
  const timestampNow = moment(date).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');

  if (values[3] != null) {
    console.log(timestampNow, values[3]);
  } else if (values[12] != null) {
    console.log(timestampNow, values[12]);
  } else if (values[13] != null) {
    console.log(timestampNow, values[13]);
  }

  if (valuesBTC) {
    if (valuesBTC[3] != null) {
      console.log(timestampNow, valuesBTC[3]);
    } else if (valuesBTC[12] != null) {
      console.log(timestampNow, valuesBTC[3]);
    } else if (valuesBTC[13] != null) {
      console.log(timestampNow, valuesBTC[3]);
    }
  }

  //console.log(timestampNow);
});

stream.pipe(jsonStream);
