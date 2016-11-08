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
      console.log(createStr);
      db.run(createStr);
    });
      db.each("SELECT * FROM "+channel, function(err, row) {
        msgArray.push(row);
      console.log(row);
      });

    socket.join(data.channel);
    var initialData={
      'name':data.name,
      'msgArray':msgArray
    }
    console.log(msgArray);
    socket.emit('notification',initialData);
    socket.broadcast.to(data.channel).emit('notification',data.name+' connected');
  });
  socket.on('msg',function(data){
   msgObj={
      'name':user,
      'message':data
    }

    // db.run("INSERT into "+channel+"(NAME,MES SAGE) VALUES (name1,msg)");

      db.serialize(function() {
        var insertStr="INSERT INTO  "+channel+" (name,message) VALUES ('"+msgObj.name+"','"+msgObj.message+"')";
        console.log(insertStr);
        db.run(insertStr);
        console.log("=====================================");
        db.each("SELECT * FROM "+channel, function(err, row) {
          // console.log("DDDDDD");
          console.log(row);
      });
    });
    // db.each("SELECT * from "+channel,function(err,rows){
    //   console.log("HDHVDB");
    //   console.log(rows);
    // });
    socket.broadcast.to(channel).emit('msg', msgObj);
    msgObj={};
  })
  socket.on('disconnect',function(){
    socket.broadcast.to(channel).emit('notification',user+' has left')
  })
})
http.listen(process.env.PORT || 3000, function(){
  console.log('listening on', http.address().port);
});
