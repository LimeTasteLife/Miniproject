const axios = require('axios');
const json2csv = require('json2csv').parse;
const fs = require('fs');
const csvtojson = require('csvtojson');
const moment = require('moment-timezone');

const APIKEY = 'c0ilZZonHd-TE4lIaF9EobhIibTsXg';
const ADDRESS = 'https://www.reddit.com/r/cosmosnetwork/new.json';

let data = [];

for (let i = 0; i < 20; i++) {
  setTimeout(() => {
    axios.get(`${ADDRESS}?limit=100&after=${data.length > 0 ? data[data.length - 1].name : ''}`)
      .then(async (response) => {
        const fields = ['title', 'author', 'created_kst', 'body', 'score', 'comments'];
        const newData = response.data.data.children.map(async (child) => {
          const commentsResponse = await axios.get(`https://www.reddit.com${child.data.permalink}.json`);
          const commentsData = commentsResponse.data[1].data.children.map(commentChild => commentChild.data.body);
          return {
            ...child.data,
            created_kst: moment.unix(child.data.created_utc).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss'),
            body: child.data.selftext,
            comments: JSON.stringify(commentsData)
          };
        });
        const dataArray = await Promise.all(newData);
        data = data.concat(dataArray);
        try {
          const csv = json2csv(data, { fields, header: false });
          const csvExists = fs.existsSync('reddit_data.csv');
          if (csvExists) {
            const existingData = fs.readFileSync('reddit_data.csv');
            const existingArray = await csvtojson().fromString(existingData.toString());
            const newDataArray = [];
            for (const newData of dataArray) {
              const existingIndex = existingArray.findIndex(existingData => existingData.title === newData.title);
              if (existingIndex !== -1) {
                existingArray[existingIndex] = newData;
              } else {
                newDataArray.push(newData);
              }
            }
            const finalDataArray = existingArray.concat(newDataArray);
            const finalCsv = json2csv(finalDataArray, { fields });
            fs.writeFileSync('reddit_data2.csv2', finalCsv);
          } else {
            fs.writeFileSync('reddit_data2.csv2', csv);
          }
          console.log('CSV 파일 작성 완료');
        } catch (error) {
          console.error('CSV 파일 작성 중 에러 발생:', error);
        }
      })
      .catch((error) => {
        console.error('Reddit API 호출 중 에러 발생:', error);
      });
  }, i * 60000);
}
