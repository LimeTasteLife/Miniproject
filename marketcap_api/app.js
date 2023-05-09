const axios = require('axios');
const json2csv = require('json2csv').parse;
const fs = require('fs');

const api_key = '47c0ef90-470c-4a97-8ba6-2de570e3d418';

const coinIds = {
  BTC: 1,
  ETH: 1027,
  COSMOS: 3794,
  JUNO: 14299,
  CRO: 3635,
  RUNE: 4157,
  KAVA: 4846,
  OSMO: 12220,
  INJ: 7226,
  FET: 3773,
  BAND: 4679,
  KDA: 5647,
  MED: 2303
}

const fetchOHLCVData = async (id, symbol) => {
  const url = `https://pro-api.coinmarketcap.com/v2/cryptocurrency/ohlcv/historical?id=${id}&time_start=2023-01-17&convert=USD&count=5000&time_period=hourly&interval=1h`;

  const headers = {
    'X-CMC_PRO_API_KEY': api_key,
  };

  try {
    const response = await axios.get(url, { headers });
    const data = Object.values(response.data.data.quotes);
    return data;
  } catch (error) {
    console.log(`Error fetching ${symbol}: ${error}`);
    return null;
  }
};

const main = async () => {
  const historicalData = {};

  for (const [symbol, id] of Object.entries(coinIds)) {
    const data = await fetchOHLCVData(id, symbol);
    if (data) {
      historicalData[symbol] = data;
    }
  }

  for (const [symbol, data] of Object.entries(historicalData)) {
    const csvDataUSD = [];

    for (const item of data) {
      const rowUSD = {
        time_open: item.time_open,
        time_close: item.time_close,
        open: item.quote.USD.open,
        high: item.quote.USD.high,
        low: item.quote.USD.low,
        close: item.quote.USD.close,
        volume: item.quote.USD.volume,
        market_cap: item.quote.USD.market_cap,
      };
      csvDataUSD.push(rowUSD);
    }

    const fields = ['time_open', 'time_close', 'open', 'high', 'low', 'close', 'volume', 'market_cap'];
    const csvUSD = json2csv(csvDataUSD, { fields });
    fs.writeFileSync(`./${symbol}_USD(1h_3month).csv`, csvUSD);
  }

  console.log('All CSV files have been successfully created.');
  };
  
  main();
