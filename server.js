const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

server.listen(process.env.PORT || 3000);
// Serve static files
app.use("/", express.static('public'))

// Notify the listeing port
function notify()
{
    var host = server.address().address;
    var port = server.address().port;
    console.log("Host is ",host, "Listening on port ",port);
}

// Objects store user data
var loneUser ={};
var RPSSloneUser = {};
var allUser ={};

function reset_loneUser() {
    // Reset loneUser
    console.log("Reset loneUser");
    loneUser={};
}

io.on('connection', function(socket) {
    console.log("New socket id is ",socket.id);

    // Save this socket in allUser
    allUser[socket.id] = socket;

    // Update number of sockets every 2 seconds
    socket.on('socketsNum', function(){
        console.log("Updating");
        socket.emit('socketsNum', Object.keys(allUser).length);
    });

    // When user disconnect
    socket.on('disconnect', function(){
        // If is being matched then out match
        if(allUser[socket.id].partner) {
            console.log('This socket is matched breaking match');
            io.in(socket.id).emit('breakMatch',);
        }
        delete allUser[socket.id];
        console.log(socket.id, "Is deleted");       
    });

    // Receive username from client input and match
    socket.on('sendUsername', (data) => {
        console.log("Username is",data, "from socket",socket.id);

        // Save this username in allUser by socket.id
        allUser[socket.id].username = data;

        // If no one is alone then be alone
        if(!loneUser.id) 
        {
            console.log("No one is alone so make",data, "a loneUser");
            
            // Update loneUser 
            loneUser.username = data;
            loneUser.id = socket.id;
            console.log("loneUser is", loneUser);
            console.log("Number of sockets connected",Object.keys(allUser).length + '\n');
        }

        // If someone is alone then match
        else 
        {
            console.log("Someone is here i'll match ",data,"with",loneUser.username);

            // Update partner in allUser and  
            allUser[socket.id].partner = allUser[loneUser.id];
            allUser[loneUser.id].partner = allUser[socket.id];

            // Initialize array choice inside object
            allUser[socket.id].choice = [];
            allUser[socket.id].partner.choice = [];

            // Join in one room 
            socket.join(loneUser.id, () => { 
                console.log("Changing room");
                console.log(socket.id, "now in room",allUser[socket.id].rooms);

            });
            allUser[loneUser.id].join(socket.id, () => {
                console.log("loneUser joining");
                console.log("loneUser now in room",allUser[loneUser.id].rooms);
                // Both matching process is done 
                io.in(socket.id).emit('matching_done',loneUser.username,allUser[socket.id].username);
                reset_loneUser();
            })
            console.log("Number of sockets connected",Object.keys(allUser).length + '\n');
        } 

    });

    // If cancel_finding_RPS
    socket.on('cancel_finding_RPS', () => {
        console.log('Canceling, delete from loneUser');
        loneUser = {};
    });

    // If cancel_finding_RPSS
    socket.on('cancel_finding_RPSS', () => {
        console.log('Canceling, delete from loneUser');
        RPSSloneUser = {};
    });
    
    // Receive username from client input and match a RPSS game
    socket.on('sendUsernameRPSS', (data) => {
        console.log("Username is",data, "from socket",socket.id);

        // Save this username in allUser by socket.id
        allUser[socket.id].username = data;

        // If no one is alone then be alone
        if(!RPSSloneUser.id) 
        {
            console.log("No one is alone so make",data, "a RPSSloneUser");
            
            // Update loneUser 
            RPSSloneUser.username = data;
            RPSSloneUser.id = socket.id;
            console.log("RPSSloneUser is", RPSSloneUser);
            console.log("Number of sockets connected",Object.keys(allUser).length + '\n');
        }

        // If someone is alone then match
        else 
        {
            console.log("Someone is here i'll match ",data,"with",RPSSloneUser.username);

            // Update partner in allUser and  
            allUser[socket.id].partner = allUser[RPSSloneUser.id];
            allUser[RPSSloneUser.id].partner = allUser[socket.id];

            // Initialize array choice inside object
            allUser[socket.id].choice = [];
            allUser[socket.id].partner.choice = [];

            // Join in one room 
            socket.join(RPSSloneUser.id, () => { 
                console.log("Changing room");
                console.log(socket.id, "now in room",allUser[socket.id].rooms);

            });
            allUser[RPSSloneUser.id].join(socket.id, () => {
                console.log("RPSSloneUser joining");
                console.log("RPSSloneUser now in room",allUser[RPSSloneUser.id].rooms);
                // Both matching process is done 
                io.in(socket.id).emit('matching_done',RPSSloneUser.username,allUser[socket.id].username);
                console.log('Reset RPSSloneUser');
                RPSSloneUser = {};
            })
            console.log("Number of sockets connected",Object.keys(allUser).length + '\n');
        } 

    });

    // Check if both player is ready RPS id is socket.id
    // It can be used for both RPS and RPSS
    socket.on('readyRPS', (id) => {
        console.log('Player',allUser[id].username,'is ready');
        allUser[id].readyRPS = 1;
        // If the other is ready
        if(allUser[id].partner.readyRPS) 
        {
            console.log('The other is ready');
            io.to(id).emit('both ready');
        }
        else socket.emit('not ready');
    });

    // In RPSS game, inform partner about socket's choice
    socket.on('giveEnemyHint', (choice) => {
        console.log('Giving my choice');
        socket.broadcast.to(socket.id).emit('showEChoice', choice);
    });

    // emochat
    socket.on('emochat_why', () => {
        console.log('Received emochat');
        socket.broadcast.to(socket.id).emit('emochat_why');
    });
    socket.on('emochat_what', () => {
        console.log('Received emochat');
        socket.broadcast.to(socket.id).emit('emochat_what');
    });
    socket.on('emochat_happy', () => {
        console.log('Received emochat');
        socket.broadcast.to(socket.id).emit('emochat_happy');
    });
    socket.on('emochat_scared', () => {
        console.log('Received emochat');
        socket.broadcast.to(socket.id).emit('emochat_scared');
    });

    // Handle event from clients player here is socket.id
    socket.on('select',(round, choice, player) => {
        // Send to all clients in room including sender
        console.log('Received', choice, "from", allUser[player].username);
        allUser[socket.id].choice[round] = choice;
        io.in(socket.id).emit('select', choice, allUser[player].username);
    });

    // Check result from two player
    socket.on('checkResult', (round) => {
        // var Choices in round
        let socketChoice = allUser[socket.id].choice[round];
        let partnerChoice = allUser[socket.id].partner.choice[round];

        console.log('Round', round);
        console.log(allUser[socket.id].username, "chose", socketChoice, allUser[socket.id].partner.username, "chose", partnerChoice);

        // Params order : winner, loser, round
        // socket win
        if( socketChoice == 'Rock' && partnerChoice == 'Scissors') io.to(socket.id).emit('result', socket.id, allUser[socket.id].partner.id, round);
        if( socketChoice == 'Scissors' && partnerChoice == 'Paper') io.to(socket.id).emit('result', socket.id, allUser[socket.id].partner.id,round);
        if( socketChoice == 'Paper' && partnerChoice == 'Rock') io.to(socket.id).emit('result', socket.id, allUser[socket.id].partner.id, round);
        // Draw
        if( socketChoice == 'Rock' && partnerChoice == 'Rock') io.to(socket.id).emit('result', '0', '0', round);
        if( socketChoice == 'Paper' && partnerChoice == 'Paper') io.to(socket.id).emit('result','0', '0', round);
        if( socketChoice == 'Scissors' && partnerChoice == 'Scissors') io.to(socket.id).emit('result','0', '0', round);
        // socket lose
        if( socketChoice == 'Rock' && partnerChoice == 'Paper') io.to(socket.id).emit('result', allUser[socket.id].partner.id, socket.id, round);
        if( socketChoice == 'Paper' && partnerChoice == 'Scissors') io.to(socket.id).emit('result', allUser[socket.id].partner.id, socket.id, round);
        if( socketChoice == 'Scissors' && partnerChoice == 'Rock') io.to(socket.id).emit('result', allUser[socket.id].partner.id, socket.id, round);
    });

    // Win match
    socket.on('win_match_RPS', () => {
        socket.emit('win_match_RPS',);
    });

    // Lose match
     socket.on('lose_match_RPS', () => {
        socket.emit('lose_match_RPS',);
    });

    // Draw match
    socket.on('draw_match_RPS', () => {
        socket.emit('draw_match_RPS',);
    });

    // Rematch?
    socket.on('rematch', () => {
        // Check partner's rematch val
        socket.rematch = 1;
        console.log('In allUser', allUser[socket.id].rematch);
        // Rematch = yes
        if(allUser[socket.id].partner.rematch) 
        {
            io.to(socket.id).emit('rematch', 1);
            allUser[socket.id].choice = [];
            allUser[socket.id].partner.choice = [];
        }
        // Rematch = no
        else 
        {
            // Not rematch yet
            socket.emit('rematch', 0);
            // Inform partner
            allUser[socket.id].partner.emit('want_rematch',);
        }
    });
    // Handle event outRoom
    socket.on('outRoom', () =>{
        // Notify the other user
        console.log("Sending notification to the other user");
        socket.broadcast.to(socket.id).emit('beOuted',);

        // Outting socket leave partner's room
        socket.leave(allUser[socket.id].partner.id, () => {
            console.log("Socket left room");
        });
        // Help the beOuted
        allUser[socket.id].partner.leave(socket.id, () => {
            console.log("Partner left room");
        });
    });

});     