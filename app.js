var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('chat.db');
var insertData;
app.use(express.static(__dirname + '/public'));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));

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
    var msgArray=[]
    db.serialize(function() {
      var createStr="CREATE TABLE if not exists "+channel+" (name TEXT,message TEXT)";
      db.run(createStr);
    });
    db.all("SELECT * FROM "+channel, function(err, row) {
        console.log(row);
        socket.join(data.channel);
        var initialData={
          'name':data.name,
          'msgArray':row,
          'notification':"Welcome "+data.name+" !!"
        }
        socket.emit('notification',initialData);
        socket.broadcast.to(data.channel).emit('notification',data.name+' connected');
    });
  });
  socket.on('msg',function(data){
   msgObj={
      'name':data.name,
      'message':data.message
    }
  db.serialize(function() {
        var insertStr="INSERT INTO  "+channel+" (name,message) VALUES ('"+msgObj.name+"','"+msgObj.message+"')";
        console.log(insertStr);
        db.run(insertStr);
    });
    socket.broadcast.to(channel).emit('msg', msgObj);
    msgObj={};
  })
  socket.on('disconnect',function(){
    var userDetails={
      'name':user,
      'msgArray':undefined,
      'notification':""+user+" has left !!"
    }
    socket.broadcast.to(channel).emit('notification',userDetails)
  })
})
http.listen(process.env.PORT || 3000, function(){
  console.log('listening on', http.address().port);
});
