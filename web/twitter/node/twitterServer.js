const Twitter = require('twitter');
const openSocket = require('socket.io-client');

module.exports = class TwitterServer{
  constructor(config){
    this.socket = openSocket(`http://${config.host}:${config.port}`);

    let self = this
    this.socket.on('launch-twitter', function(data){
      self.run(data)
    })
  }

  run(data){
    this.client = new Twitter({
      consumer_key: data.consumer_key,
      consumer_secret: data.consumer_secret,
      access_token_key: data.access_token_key,
      access_token_secret: data.access_token_secret
    });
    let self = this
    this.client.stream('statuses/filter', {track: data.hashtag},  function(stream) {
      stream.on('data', function(tweet) {
        self.socket.emit('back', {type: "back-twitter", content: {
          action: "new-tweet" ,
          tweet: tweet
        }});
      });
    
      stream.on('error', function(error) {});
    });
  }

}
