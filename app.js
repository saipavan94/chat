var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.use(express.static(__dirname + '/public'));

app.get('/',function(req,res){
    res.sendfile('index.html');
});

io.on('connection',function(socket){
  var user="";
  var channel="";
  var msgObj={};
  socket.on('connectUser',function(data){
    user=data.name;
    channel=data.channel;
    console.log(data);
    socket.join(data.channel);
    socket.emit('notification','welcome '+data.name+' !!');
    socket.broadcast.to(data.channel).emit('notification',data.name+' connected');
  });
  socket.on('msg',function(data){
   msgObj={
      'name':user,
      'message':data
    }
    socket.broadcast.to(channel).emit('msg', msgObj);
    msgObj={};
  })
  socket.on('disconnect',function(){
    socket.broadcast.to(channel).emit('notification',user+' has left')
    console.log("user disconnected");
  })
})
http.listen(8000,function(){
  console.log('listening to port 8000');
})
