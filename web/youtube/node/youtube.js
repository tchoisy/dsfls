const request = require('request');
const API_KEY = "AIzaSyAX5uEvyUx06bA2PjeEOaIVdBQyUIHNdlE"
const chatMessageUrl = "https://www.googleapis.com/youtube/v3/liveChat/messages"
const VIDEO = "https://www.googleapis.com/youtube/v3/videos?id=%VIDEO_ID%&key="+API_KEY+"&part=liveStreamingDetails,snippet"
const openSocket = require('socket.io-client');
const  socket = openSocket('http://localhost:7777');

let timer = null;
let stop= false;
let questions = []
let tplQuestion = {
  numero: null,
  points: 0,
  bonneReponse: "",
  dateStart: null,
  dateEnd: null,
  users: {}
}
let currentQuestion = Object.assign({}, tplQuestion)

socket.on('front-node-youtube-comment', ( payload) => {
    if(payload.action === "start"){
      console.log('start');
      run(payload.idVideo)
    } else if(payload.action === "stop"){
      console.log("stop");
      stop = true;
    }
})

const run = (idVideo) =>{
  return new Promise((resolve, reject) =>{
    stop = false
    getLiveChatId(idVideo, (liveChatId) => {
      if(liveChatId){
        requestChatMessages('', liveChatId)
      }
    })
  })
}

const requestChatMessages = (nextPageToken, liveChatId) => {
  const props = {
    liveChatId: liveChatId,
    part: 'snippet,id,authorDetails',
    key: API_KEY,
    maxResults: 200,
    pageToken: nextPageToken
  }

  request(chatMessageUrl, {
    qs: props
  }, (err, res, body) => {
    let data = JSON.parse(body)
    data.items.forEach(msg => {
      processMessage(msg)
    })
    timer = setTimeout(() => {
      if(!stop){
        requestChatMessages(data.nextPageToken, liveChatId)
      } else {
        clearTimeout(timer)
        timer = null
      }
    }, data.pollingIntervalMillis)
  })
}

const getLiveChatId = (videoId, callback) => {
  const url = VIDEO.replace('%VIDEO_ID%', videoId)
  // console.log('url live', url);
  request(url, (err, res, body) => {
    let data = JSON.parse(body)
    callback(data.items[0].liveStreamingDetails.activeLiveChatId)
  })
}

const processMessage = (msg) => {
  const userMessage = msg.snippet.displayMessage
  const userMessagePublished = new Date(msg.snippet.publishedAt)
  const userId = msg.authorDetails.channelId
  const img = msg.authorDetails.profileImageUrl
  const name = msg.authorDetails.displayName
  socket.emit('back', {type: "back-youtube-comment", content: {
    action: "new-comment" ,
    comment: {
      message: userMessage,
      created: userMessagePublished,
      avatar: img,
      name: name
    }
  }});
}
