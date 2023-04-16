const axios = require('axios');
const json2csv = require('json2csv').parse;
const fs = require('fs');
const csvtojson = require('csvtojson');
const moment = require('moment-timezone');

const APIKEY = 'c0ilZZonHd-TE4lIaF9EobhIibTsXg';
const ADDRESS = 'https://www.reddit.com/r/cosmosnetwork/new.json?limit=100';

let data = [];

setInterval(() => {
    axios.get(ADDRESS)
    .then(async (response) => {
      const fields = ['title', 'author', 'create_kst','body', 'score', 'comments'];
      const data = response.data.data.children.map(async (child) => {
        const commentsResponse = await axios.get(`https://www.reddit.com${child.data.permalink}.json`);
        const commentsData = commentsResponse.data[1].data.children.map(commentChild => commentChild.data.body);
        const postResponse = await axios.get(`https://www.reddit.com${child.data.permalink}.json`);
        const postData = postResponse.data[0].data.children[0].data;
        const createKst = moment.utc(postData.created_utc * 1000).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
        return { ...child.data, comments: JSON.stringify(commentsData), body: postData.selftext, create_kst: createKst };
      });
      const dataArray = await Promise.all(data);
      try {
        const csv = json2csv(dataArray, { fields, header: false });
        const csvExists = fs.existsSync('reddit_data.csv');
        if (csvExists) {
            const existingData = fs.readFileSync('reddit_data.csv');
            const existingArray = await csvtojson().fromString(existingData.toString()); // csv 파일 내용을 읽어와 배열로 변환
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
            fs.writeFileSync('reddit_data1.csv', finalCsv);
          } else {
            fs.writeFileSync('reddit_data1.csv', csv);
          }
        console.log('CSV 파일 작성 완료');
      } catch (error) {
        console.error('CSV 파일 작성 중 에러 발생:', error);
      }
    })
    .catch((error) => {
      console.error('Reddit API 호출 중 에러 발생:', error);
    });
  }, 60000);
