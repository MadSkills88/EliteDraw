var express = require('express'),
   app = express(),
   http = require('http'),
   socketIo = require('socket.io');

// start webserver on port 8080
var server = http.createServer(app);
var io = socketIo.listen(server);
server.listen(process.env.OPENSHIFT_NODEJS_PORT || 8080, process.env.OPENSHIFT_NODEJS_IP, function() {
    console.log('%s: Node server started on %s:%d ...',
                Date(Date.now() ), process.env.OPENSHIFT_NODEJS_IP, process.env.OPENSHIFT_NODEJS_PORT || 8080);
});
// add directory with our static files
app.use(express.static(__dirname + '/public'));
console.log("Server running on http://awesome-anthonybao.rhcloud.com/");

// array of all lines drawn
var line_history = [];
var people = 0;
//var image_data;
// event-handler for new incoming connections
io.on('connection', function(socket) {
   people++;
   socket.on('disconnect', function() {
      people--;
   });

   socket.emit('introduce', {
      people: people
   });
   for (var i in line_history) {
      socket.emit('draw_line', {
         line: line_history[i]
      });
   }

   // add handler for message type "draw_line".
   socket.on('draw_line', function(data) {
      // add received line to history
      line_history.push(data.line);
      // send line to all clients
      io.emit('draw_line', {
         line: data.line
      });
   });

   // add handler for message type "clear".
   socket.on('clear', function() {
      line_history = [];
      io.emit('clear');
   });
});
