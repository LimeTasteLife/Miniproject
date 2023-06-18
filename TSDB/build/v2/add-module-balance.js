const fs = require('fs');
const JSONStream = require('JSONStream');
const moment = require('moment');
const dotenv = require('dotenv');
const { InfluxDB, Point } = require('@influxdata/influxdb-client');

dotenv.config({ path: '../../.env' });
let org = `InssaChain`;
let bucket = `InssaChain`;

const chainName = ['cosmos', 'osmosis', 'kava', 'juno'];
// 한 번에 4개 넣으면 왜 에러?

const token = process.env.INFLUXDB_TOKEN;
const url = 'http://localhost:8086';
const timestampFilePath = './module-balance-ts-2.json';
//console.log(token);

const client = new InfluxDB({ url, token });
const writeApi = client.getWriteApi(org, bucket);
writeApi.useDefaultTags({ version: 'test2' });

for (const item of chainName) {
  const inputFilePath = `./module-balance.${item}.json`;
  const writeFunction = async () => {
    try {
      const stream = fs.createReadStream(inputFilePath, { encoding: 'utf8' });
      const jsonStream = JSONStream.parse('modules.*');

      const timestampFile = fs.readFileSync(timestampFilePath, 'utf8');
      const timestampArray = JSON.parse(timestampFile);

      jsonStream.on('data', (data) => {
        const { name, type, address } = data;

        data.balances.forEach((balance) => {
          const { denom, amounts } = balance;
          for (const [index, value] of amounts.entries()) {
            let point1 = new Point('testModuleBalance');
            if (value > 9223372036854775807) {
              point1
                .timestamp(new Date(timestampArray.item[index]))
                .tag('moduleName', name)
                .tag('moduleType', type)
                .tag('moduleAddress', address)
                .tag('denom', denom)
                .stringField('amountBigValue', value);
            } else {
              point1
                .timestamp(new Date(timestampArray.item[index]))
                .tag('moduleName', name)
                .tag('moduleType', type)
                .tag('moduleAddress', address)
                .tag('denom', denom)
                .intField('amountValue', value);
            }
            writeApi.writePoint(point1);
          }
        });
      }); // end of jsonStream on
      jsonStream.on('end', () => {
        console.log(`WRITE FINISHED ${item}`);
      }); // end of jsonStream end

      stream.pipe(jsonStream);
    } catch (error) {
      console.log(error);
    }
  };
  writeFunction();
}
