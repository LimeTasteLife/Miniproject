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
//console.log(token);

const client = new InfluxDB({ url, token });
const writeApi = client.getWriteApi(org, bucket);
writeApi.useDefaultTags({ version: 'test2' });

const infoAttributes = [
  'price',
  'cap',
  'capRank',
  'fullyDilutedValuation',
  'totalVolume',
  'high24h',
  'low24h',
  'change24h',
  'changeRatio24H',
  'capChange24h',
  'capChangeRatio24H',
  'supplyCirculating',
  'supplyTotal',
  'supplyMax',
  'ath',
  'athDate',
  'atl',
  'atlDate',
  'priceChangePercentage1H',
  'priceChangePercentage24H',
  'priceChangePercentage7d',
  'priceChangePercentage14d',
  'priceChangePercentage30D',
  'priceChangePercentage1Y',
];

for (const item of chainName) {
  const inputFilePath = `./chain-info.${item}.json`;
  const writeFunction = async () => {
    try {
      const stream = fs.createReadStream(inputFilePath, { encoding: 'utf8' });
      const jsonStream = JSONStream.parse('list.*');

      jsonStream.on('data', (data) => {
        const result = {};
        const { chain, apr, inflation, txs, tps, updatedAt } = data;
        const { block, tokens, validators } = data;
        const values = data.market.values;
        const valuesBTC = data.market.valuesBTC;

        for (let i = 0; i < 24; i++) {
          if (values[i] == null) values[i] = -1;
        }

        const date = new Date(updatedAt);
        const timestampNow = moment(date).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');

        const point1 = new Point('testChainInfo')
          .timestamp(new Date(timestampNow))
          .tag('chainName', chain)
          .floatField('apr', apr)
          .floatField('blockTime', block.time)
          .floatField('blockHeight', block.height)
          .floatField('inflation', inflation)
          .intField('bondedTokens', tokens.bonded)
          .intField('supplyTokens', tokens.supply)
          .intField('communityTokens', tokens.community)
          .intField('activeValidators', validators.active)
          .intField('jailedValidators', validators.jailed)
          .intField('totalValidators', validators.total)
          .intField('txs', txs)
          .floatField('tps', tps);

        const point2 = new Point('testChainMarket')
          .timestamp(new Date(timestampNow))
          .tag('chainName', chain)
          .floatField('price', values[0])
          .floatField('cap', values[1])
          .intField('capRank', values[2])
          .intField('totalVolume', values[4])
          .floatField('high24h', values[5])
          .floatField('low24h', values[6])
          .floatField('change24h', values[7])
          .floatField('changeRatio24H', values[8])
          .intField('capChange24h', values[9])
          .floatField('capChangeRatio24H', values[10])
          .floatField('supplyCirculating', values[11])
          .floatField('ath', values[14])
          .stringField('athDate', values[15])
          .floatField('atl', values[16])
          .stringField('atlDate', values[17])
          .floatField('priceChangePercentage1H', values[18])
          .floatField('priceChangePercentage24H', values[19])
          .floatField('priceChangePercentage7d', values[20])
          .floatField('priceChangePercentage14d', values[21])
          .floatField('priceChangePercentage30D', values[22])
          .floatField('priceChangePercentage1Y', values[23]);

        if (valuesBTC) {
          for (let i = 0; i < 24; i++) {
            if (valuesBTC[i] == null) valuesBTC[i] = -1;
          }

          const point3 = new Point('testChainMarketBTC')
            .timestamp(new Date(timestampNow))
            .tag('chainName', chain)
            .floatField('price', valuesBTC[0])
            .intField('cap', valuesBTC[1])
            .intField('capRank', valuesBTC[2])
            .intField('totalVolume', valuesBTC[4])
            .floatField('high24h', valuesBTC[5])
            .floatField('low24h', valuesBTC[6])
            .floatField('change24h', valuesBTC[7])
            .floatField('changeRatio24H', valuesBTC[8])
            .intField('capChange24h', valuesBTC[9])
            .floatField('capChangeRatio24H', valuesBTC[10])
            .floatField('supplyCirculating', valuesBTC[11])
            .floatField('ath', valuesBTC[14])
            .stringField('athDate', valuesBTC[15])
            .floatField('atl', valuesBTC[16])
            .stringField('atlDate', valuesBTC[17])
            .floatField('priceChangePercentage1H', valuesBTC[18])
            .floatField('priceChangePercentage24H', valuesBTC[19])
            .floatField('priceChangePercentage7d', valuesBTC[20])
            .floatField('priceChangePercentage14d', valuesBTC[21])
            .floatField('priceChangePercentage30D', valuesBTC[22])
            .floatField('priceChangePercentage1Y', valuesBTC[23]);

          writeApi.writePoint(point3);
        }

        writeApi.writePoint(point1);
        writeApi.writePoint(point2);

        console.log('Success on ', timestampNow, item);
      });
      // end of jsonStream
      stream.pipe(jsonStream);
      /*
      writeApi.close().then(() => {
        console.log(`${item} WRITE FINISHED`);
      });
      */
    } catch (error) {
      console.error(error);
    }
  };
  writeFunction();
}
