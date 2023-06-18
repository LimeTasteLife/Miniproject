const { InfluxDB, Point } = require('@influxdata/influxdb-client');
const dotenv = require('dotenv');

dotenv.config({ path: '../.env' });
let org = `InssaChain`;
let bucket = `InssaChain`;

const token = process.env.INFLUXDB_TOKEN;
const url = 'http://localhost:8086';
const inputFilePath = './chain-info.json';
//console.log(token);

const client = new InfluxDB({ url, token });
let queryApi = client.getQueryApi(org);
let fluxQuery = `from(bucket: "${bucket}")
  |> range(start: 0)
  |> filter(fn: (r) => r._measurement == "testModuleBalance") 
  |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
  |> filter(fn: (r) => r.denom == "uatom")
`;

/*
let fluxQuery = `from(bucket: "${bucket}")
  |> range(start: 0)
  |> filter(fn: (r) => r._measurement == "testModuleBalance" and r._field =~ /a|b/) 
  |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
  |> filter(fn: (r) => r.denom == "uatom")
  |> filter(fn: (r) => r.a > 0 and r.b == 30)
`;
*/

async function collectRows() {
  console.log('\n*** CollectRows ***');
  const data = await queryApi.collectRows(
    fluxQuery //, you can also specify a row mapper as a second argument
  );
  data.forEach((x) => console.log(JSON.stringify(x)));
  console.log('\nCollect ROWS SUCCESS');
}
collectRows().catch((error) => console.error('CollectRows ERROR', error));
