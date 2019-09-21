const request = require('request');
const chatMessageUrl = "https://www.googleapis.com/youtube/v3/liveChat/messages"
const openSocket = require('socket.io-client');


module.exports = class YoutubeServer {
  constructor(config){
    this.socket = openSocket(`http://${config.host}:${config.port}`);
    this.VIDEO = ""
    this.API_KEY = ""
    this.stop = false
    this.timer = null
    let self = this
    this.socket.on('front-node-youtube-comment', ( payload) => {
        if(payload.action === "start"){
          console.log('start');
          self.VIDEO = `https://www.googleapis.com/youtube/v3/videos?id=%VIDEO_ID%&key=${payload.api_key}&part=liveStreamingDetails,snippet`
          self.API_KEY = payload.api_key
          self.run(payload.idVideo)
        } else if(payload.action === "stop"){
          console.log("stop");
          self.stop = true;
        }
    })
  }

  run(idVideo){
    let self = this
    return new Promise((resolve, reject) =>{
      self.stop = false
      self.getLiveChatId(idVideo, (liveChatId) => {
        if(liveChatId){
          self.requestChatMessages('', liveChatId)
        }
      })
    })
  }
  
  requestChatMessages(nextPageToken, liveChatId){
    const props = {
      liveChatId: liveChatId,
      part: 'snippet,id,authorDetails',
      key: this.API_KEY,
      maxResults: 200,
      pageToken: nextPageToken
    }
    let self = this
    request(chatMessageUrl, {
      qs: props
    }, (err, res, body) => {
      let data = JSON.parse(body)
      data.items.forEach(msg => {
        self.processMessage(msg)
      })
      self.timer = setTimeout(() => {
        if(!self.stop){
          self.requestChatMessages(data.nextPageToken, liveChatId)
        } else {
          clearTimeout(self.timer)
          self.timer = null
        }
      }, data.pollingIntervalMillis)
    })
  }
  
  getLiveChatId(videoId, callback){
    const url = this.VIDEO.replace('%VIDEO_ID%', videoId)
    // console.log('url live', url);
    console.log(url)
    request(url, (err, res, body) => {
      let data = JSON.parse(body)
      if(!data.error) {
        callback(data.items[0].liveStreamingDetails.activeLiveChatId)
      }
    })
  }
  
  processMessage(msg){
    const userMessage = msg.snippet.displayMessage
    const userMessagePublished = new Date(msg.snippet.publishedAt)
    const userId = msg.authorDetails.channelId
    const img = msg.authorDetails.profileImageUrl
    const name = msg.authorDetails.displayName
    this.socket.emit('back', {type: "back-youtube-comment", content: {
      action: "new-comment" ,
      comment: {
        message: userMessage,
        created: userMessagePublished,
        avatar: img,
        name: name
      }
    }});
  }
}


