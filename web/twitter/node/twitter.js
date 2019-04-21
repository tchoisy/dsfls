const Twitter = require('twitter');
const TWITTER_CONSUMER_KEY = "0etEoOnhbEKizNCNKewVQVZ1K"
const TWITTER_CONSUMER_SECRET = "HxYMAbWFW99sSOVEp9ua6b8byryJZdZCge5CAOpFCYJofC4Bsc"
const TWITTER_ACCESS_TOKEN_KEY = "1055531155884306432-s1Bvv1K31fGjCD0bkDebIwhSflpq6i"
const TWITTER_ACCESS_TOKEN_SECRET = "KfRYwNdMoJCSZk1tLrLcqvhXUo0wyrkJRl5iRRC0hGYIL"
const client = new Twitter({
  consumer_key: TWITTER_CONSUMER_KEY,
  consumer_secret: TWITTER_CONSUMER_SECRET,
  access_token_key: TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: TWITTER_ACCESS_TOKEN_SECRET
});

const openSocket = require('socket.io-client');
const  socket = openSocket('http://192.168.6.10:7777');


// client.get('search/tweets', {q: '#MilanBetis'}, function(error, tweets, response) {
//    console.log(tweets);
// });
/**
 * Stream statuses filtered by keyword
 * number of tweets per second depends on topic popularity
 **/
client.stream('statuses/filter', {track: '#brunchworking'},  function(stream) {
  stream.on('data', function(tweet) {
    socket.emit('back', {type: "back-twitter", content: {
      action: "new-tweet" ,
      tweet: tweet
    }});
    // console.log(tweet);
  });

  stream.on('error', function(error) {
    // console.log(error);
  });
});
