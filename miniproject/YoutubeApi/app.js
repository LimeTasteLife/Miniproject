const express = require('express');
const path = require('path');
const axios = require('axios');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds = require('./custom-tine-377517-bf470de263b8.json');


const doc = new GoogleSpreadsheet("1l1DIoRJmKOeqUFPC4kdSXwDik1hVDAM5yilkN4LqUTo");
const YOUTUBE_API_KEY = 'AIzaSyAElt4WvF2lfO7IyH3AfpoawEDLkwCgu5w';

async function connectWithSheet() {
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();
    console.log(doc.title, '연결 완료!');
    const sheet = doc.sheetsByIndex[0];

    const rows = await sheet.getRows();
    for (let el of rows ) {
        console.log(el.name,'차례입니다!');
        if(!el.channelId){
            if(!el.name){
                return 0;
            }
            try {
                await axios({
                    method: 'get',
                    url: `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=3&q=${el.name}&type=video&key=${YOUTUBE_API_KEY}`
                })
                .then((response) => {
                    el.channelId = response.data.items[0].snippet.channelId
                })
                await el.save();
            } catch (err) {
                console.error(err);
            }
        }
        
        try {
            let channelId = el.channelId ;
            let views = 0;
            let likes = 0;
            let comments = 0;
            let subscribers = 0;
            await axios({
                method: 'get',
                url: `https://www.googleapis.com/youtube/v3/search?part=id&maxResults=10&channelId=${el.channelId}&type=video&order=date&key=${YOUTUBE_API_KEY}`
            })
            .then(async (response) => {
                if(!response){
                    console.log('ㅇ[ㅔ러!');
                    return false;
                }
                await axios({
                    method: 'get',
                    url: `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`
                })
                .then((res) => {
                    subscribers = Number(res.data.items[0].statistics.subscriberCount);
                }).catch((error) => console.error(error));
                response.data.items.forEach( async (el) =>{    
                    await axios({
                        method:'get',
                        url: `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${el.id.videoId}&key=${YOUTUBE_API_KEY}`
                    })
                    .then((res) => {
                        if(!res) {
                            console.log("에러! pass!")
                            return false;
                        }
                        views += Number(res.data.items[0].statistics.viewCount);
                        likes += Number(res.data.items[0].statistics.likeCount);
                        comments += Number(res.data.items[0].statistics.commentCount);
                    })
                    .catch((error) => console.error(error));
                })
            })
            await el.save();
            el.subscribers = subscribers;
            console.log(el.name,'subscriber done!',el.subscribers);
            el.views = parseInt(views/10);
            console.log(el.name,'views done!',el.views);
            el.likes = parseInt(likes/10);
            console.log(el.name,'likes done!',el.likes);
            el.comments = parseInt(comments/10);
            console.log(el.name,'comments done!',el.comments);
            await el.save();
            console.log(el.name,'save done!');
            
        } catch (err) {
            console.error(err);
        } 
    }
    return 0;
}

connectWithSheet();






