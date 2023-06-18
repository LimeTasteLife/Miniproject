const dotenv = require('dotenv');
const { InfluxDB, Point } = require('@influxdata/influxdb-client');

dotenv.config({ path: '../.env' });
let org = `InssaChain`;
let bucket = `InssaChain`;

const token = process.env.INFLUXDB_TOKEN;
const url = 'http://localhost:8086';
//console.log(token);

const client = new InfluxDB({ url, token });
let queryApi = client.getQueryApi(org);
let fluxQuery = `from(bucket: "${bucket}")
  |> range(start: 0)
  |> filter(fn: (r) => r._measurement == "testMeasurement")
`;

// Execute query and receive table metadata and rows in a result observer.
const myQuery = async () => {
  console.log('*** QueryRows ***');
  queryApi.queryRows(fluxQuery, {
    next: (row, tableMeta) => {
      const o = tableMeta.toObject(row);
      console.log(
        `${o._time} ${o._measurement} in '${o.version}' (${o.testTag}): ${o._field}=${o._value}`
      );
    },
    error: (error) => {
      console.error(error);
      console.log('\nQueryRows Error ERROR');
    },
    complete: () => {
      console.log('*** QueryRows completed ***');
    },
  });
};
myQuery();

// Execute query and receive table metadata and table row values using async iterator.
async function iterateRows() {
  console.log('*** IterateRows ***');
  for await (const { values, tableMeta } of queryApi.iterateRows(fluxQuery)) {
    // the following line creates an object for each row
    const o = tableMeta.toObject(values);
    // console.log(JSON.stringify(o, null, 2))
    console.log(
      `${o._time} ${o._measurement} in '${o.location}' (${o.example}): ${o._field}=${o._value}`
    );

    // alternatively, you can get only a specific column value without
    // the need to create an object for every row
    // console.log(tableMeta.get(row, '_time'))
  }
  console.log('\nIterateRows SUCCESS');
}
// 이거는 일단 await 써야할 듯?
// iterateRows().catch((error) => console.error('IterateRows ERROR', error));

// Execute query and collect result rows in a Promise.
// Use with caution, it copies the whole stream of results into memory.
async function collectRows() {
  console.log('\n*** CollectRows ***');
  const data = await queryApi.collectRows(
    fluxQuery //, you can also specify a row mapper as a second argument
  );
  data.forEach((x) => console.log(JSON.stringify(x)));
  console.log('\nCollect ROWS SUCCESS');
}
// 모든 스트림을 메모리에 복사한다?
// collectRows().catch((error) => console.error('CollectRows ERROR', error));

// Execute query and return the whole result as a string.
// Use with caution, it copies the whole stream of results into memory.
async function queryRaw() {
  const result = await queryApi.queryRaw(fluxQuery);
  console.log(result);
  console.log('\nQueryRaw SUCCESS');
}
// queryRaw().catch((error) => console.error('QueryRaw ERROR', error));

// Execute query and receive result CSV lines in an observer
function queryLines() {
  queryApi.queryLines(fluxQuery, {
    next: (line) => {
      console.log(line);
    },
    error: (error) => {
      console.error(error);
      console.log('\nQueryLines ERROR');
    },
    complete: () => {
      console.log('\nQueryLines SUCCESS');
    },
  });
}
// 위에랑 뭔 차이지?
// queryLines();

// Execute query and receive result csv lines using async iterable
async function iterateLines() {
  for await (const line of queryApi.iterateLines(fluxQuery)) {
    console.log(line);
  }
  console.log('\nIterateLines SUCCESS');
}
// iterateLines().catch((error) => console.error('\nIterateLines ERROR', error));
