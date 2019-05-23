const socket = io.connect("localhost:3000");

//Emit every 2 seconds for testing
var getSocketsNum = setInterval(function(){
    socket.emit('socketsNum',);
},2000);

socket.on('connect', function(){
    console.log(socket.id);

    // Get number of sockets connected send every 2 seconds
    socket.on('socketsNum', (data) => {
        console.log("Number of sockets:",data);
        $('#socketsNum').html(data);
    });

});