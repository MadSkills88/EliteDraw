var s = document.createElement('script');
s.type = 'text/javascript';
s.async = true;
s.src = 'js/jquery-1.11.3.min.js';
(document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(s);


var canvas, context, width, height;
var socket;
var mouse;
var clearbutton, drawbutton, drawclicked;
var color;
var lineWidth;
document.addEventListener("DOMContentLoaded", function() {
   defineDOMElements();
   configDOMHandlers();
   serverComm();
});

function defineDOMElements() {
   mouse = {
      click: false,
      move: false,
      pos: {
         x: 0,
         y: 0
      },
      pos_prev: false
   };
   // get canvas element and create context
   canvas = document.getElementById('drawing');
   context = canvas.getContext('2d');
   width = window.innerWidth;
   height = window.innerHeight;
   socket = io.connect();

   // set canvas to full browser width/height
   canvas.width = width;
   canvas.height = height;

   //buttons
   clearbutton = document.getElementById('clearbutton');
   drawbutton = document.getElementById('drawbutton');
   drawclicked = false;

   color = "black";
   lineWidth = 20;
   context.lineWidth = 20;
   context.lineJoin = "round";
   context.lineCap = "round";
}

function configDOMHandlers() {
   // register mouse event handlers
   canvas.onmousedown = function(e) {
      mouse.click = true;
   };
   canvas.onmouseup = function(e) {
      mouse.click = false;
   };
   canvas.onmousemove = function(e) {
      // normalize mouse position to range 0.0 - 1.0
      mouse.pos.x = e.clientX / width;
      mouse.pos.y = e.clientY / height;
      mouse.move = true;
   };

   // attach actions to buttons
   clearbutton.onclick = clearCanvas;
   drawbutton.onclick = doodle;
}

function serverComm()  {
   $('#loadingscreen').fadeOut('slow',function(){$('#loadingscreen').addClass('hidden')});
   socket.emit('introduce');
   // when a new person joins, introduce their presence
   socket.on('introduce', function(data) {
      $('#counter').css('display','block','visibility','visible','opacity','1');
      $('#counter').stop( true, true ).fadeIn();
      $('#counter').html('There are ' + data.people + ' people here');
      $('#counter').fadeOut(4000,function(){$('#counter').css('display','none','visibility','hidden')});
   });

   // draw line received from server
   socket.on('draw_line', function(data) {
      var line = data.line;
      context.beginPath();
      context.strokeStyle = line[2];
      context.lineWidth = line[3];
      context.moveTo(line[0].x * width, line[0].y * height);
      context.lineTo(line[1].x * width, line[1].y * height);
      context.stroke();
   });

   // clear canvas
   socket.on('clear', function() {
      alert('Someone has cleared the canvas');
      context.clearRect(0, 0, canvas.width, canvas.height);
   });
}

function doodle() {
   if (drawclicked) {
      canvas.style.cursor = "default";
      if (drawbutton.classList.contains("activeoption")) {
         drawbutton.classList.remove("activeoption");
      }
      drawclicked = false;
      clearInterval(this._interval);
   }
   else {
      canvas.style.cursor = "crosshair";
      drawbutton.classList.add("activeoption");
      drawclicked = true;
      clearInterval(this._interval);
      // set loop interval
      this._interval = setInterval(mainLoop, 20);
   }
}

// main loop, running every 50ms
function mainLoop() {
   // check if the user is drawing
   if (mouse.click && mouse.move && mouse.pos_prev) {
      // send line to to the server
      socket.emit('draw_line', {
         line: [mouse.pos, mouse.pos_prev, color, lineWidth]
      });
      mouse.move = false;
   }
   mouse.pos_prev = {
      x: mouse.pos.x,
      y: mouse.pos.y
   };
}

//clears canvas when the clear button is clicked
function clearCanvas() {
   socket.emit('clear');
}

// changes the color
function changeColor() {
  color = $('#line_color').val();
  $('#color_icon').css('color',color);
}
function changeWidth() {
   lineWidth= $('#line_width').val();
   if ($('#line_width').val() > 10) {
      $('#width_icon').addClass('fa-2x');
   }
   else if ($('#line_width').val() <=10) {
      $('#width_icon').removeClass('fa-2x');
   }

}