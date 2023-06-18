const dotenv = require('dotenv');
const { InfluxDB, Point } = require('@influxdata/influxdb-client');

dotenv.config({ path: '../.env' });
let org = `InssaChain`;
let bucket = `InssaChain`;

const token = process.env.INFLUXDB_TOKEN;
const url = 'http://localhost:8086';
//console.log(token);

const client = new InfluxDB({ url, token });
const writeApi = client.getWriteApi(org, bucket);
writeApi.useDefaultTags({ version: 'test' });

console.log(new Date('2023-04-24T12:00:00Z'));

const point1 = new Point('testMeasurement')
  .timestamp(new Date('2022-01-17T00:34:41.497Z'))
  .tag('testTag', 'testValue')
  .floatField('value', 29);

console.log(` ${point1}`);

writeApi.writePoint(point1);

writeApi.close().then(() => {
  console.log('WRITE FINISHED');
});
