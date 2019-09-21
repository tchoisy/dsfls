const express = require("express");
const path = require("path");
const os = require('os');
const app     = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/web'));

const defaultConfig = {
  port: 80,
  socketHost: 'localhost',
  socketPort: '7777'
}

module.exports = class Server{
  constructor(conf){
    const config = {...defaultConfig, ...conf}
    this.port = config.port
    this.socketHost = config.socketHost
    this.socketPort = config.socketPort
  }

  run(){
    const self = this
    app.get('/css/:cssFile', function(request, res, next) {
      const cssFile = request.params.cssFile;
      const file = path.join(__dirname+'/web/css/'+cssFile)
      res.sendFile(file);
    });
    app.get('/image/:img', function(request, res, next) {
      const img = request.params.img;
      const file = path.join(__dirname+'/web/image/'+img)
      res.sendFile(file);
    });
    app.get('/media/:media', function(request, res, next) {
      const media = request.params.media;
      const file = path.join(__dirname+'/web/media/'+media)
      res.sendFile(file);
    });
    app.get('/js/:js', function(request, res, next) {
      const js = request.params.js;
      const file = path.join(__dirname+'/web/js/'+js)
      res.sendFile(file);
    });

    app.get('/local/:view', function(request, res, next) {
      const view = request.params.view;
      const homedir = os.homedir();
      const file = path.join(homedir+'/dsfls/view/'+view)
      // res.sendFile(file);
      res.render(file, {
        config: {
          host: self.socketHost,
          port: self.socketPort
        }
      })
    });

    app.get('/:view([^/]+/[^/]+)', function(request, res, next) {
      const view = request.params.view;
      res.render(view, {
        config: {
          host: self.socketHost,
          port: self.socketPort
        }
      });
    });

    
    app.listen(this.port, () => { console.log(`Server listening on port ${this.port}`)});
  }
}
