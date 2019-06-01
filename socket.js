const io = require('socket.io')();

const defaultConfig = {
  port: 7777
}

module.exports = class Socket{
  constructor(conf){
    const config = {...defaultConfig, ...conf}
    this.port = config.port
  }

  run(){
    io.on('connection', (client) => {
        console.log('New connection');
      client.on('back', (data) => {
        console.log("back", data);
          const emitName = `front-${data.type}`
          const res = client.broadcast.emit(emitName, data.content);
      });
    });
    
    io.listen(this.port);
    console.log('Socket listening on port ', this.port);

  }
}
