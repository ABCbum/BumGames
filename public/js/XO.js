'use strict'

const socket = io.connect('http://localhost:3000')

// Setup 
$('.board').hide()
$('#before_matched').hide()
$('#after_send').hide()
$('#end_game').hide()
let player, yourTurn

// Check if can play that move
let check = new Array(9)
for (let i = 0; i < 9 ; i++)
{
    check[i] = [1, 1, 1, 1, 1, 1, 1, 1, 1]
}
console.log(check);

// Function to send user data to server (username)
function sendData()
{
    let username = $("#name").val();
    console.log("let username = ",username, 'id is', socket.id);
    socket.emit('sendUsernameXO', username);
    
    // Hide
    $('#sendButton').hide();
    $('#name').hide();
    $('#header').hide();

    // Show before_matched (loaders)
    $('#before_matched').show();
};

// Cancel finding match
function cancel()
{
    // Send event
    socket.emit('cancel_finding_XO');
    location.reload();
}

// Notify that the player is ready
function ready()
{
    console.log("I'm ready");
    socket.emit('readyRPS', socket.id);
}

/*
 *    =============== Make choice =============
 */

 function XOChoice(y, x)
 {
    if(check[y][x] == 1 && yourTurn)
    {
        socket.emit('XOChoice', y, x, player)
        check[y][x] = 0
        $(`#square${y}${x}`).html(player)
        // Disable yourTurn
        yourTurn = 0
    }
    else console.log('Not your turn')
 }


socket.on('connect', () => {
    console.log(socket.id);


    /*
     * =============== Matching, Ready ===============
     */ 

    // Receive event when "matching_done" from server
    socket.on('matching_done', (player1, player2) => {
        console.log("Matching btw ", player1, "and", player2, "is done!");

        // Hide loaders
        $('#before_matched').hide();
        // Check if ready then show the game
        $('#after_send').show();
        // $('#username_vs').html(player1 + " vs " + player2);

    });

    // Receive event 'both ready' and 'not ready'
    socket.on('both ready', () => {
        console.log("Let's go");
        // Show the game hide ready button

        // Chat
        // $('#you_send').show();
        // $('#opponent_send').show();

        $('#before_ready').hide();
        $('.board').show();
    });

    socket.on('not ready', () => {
        console.log("Not yet!!");
        $('#notifyReady').html("Opponent is not ready...");
    });
    
    socket.on('decide_player', (data) => { 
        console.log('You are', data)

        player = data

        // Decide who goes first
        if(data === 'X') {yourTurn = 1}
        else {yourTurn = 0}
        console.log(yourTurn)
    })

    /*
     * ================= Game ===============
     */

     socket.on('changeTurn', (y, x, plyer) => {
         console.log('Received', y, x, plyer)
         // Disable that move
         check[y][x] = 0
         // Show enemy choice
         $(`#square${y}${x}`).html(plyer)
         // Change turn
         yourTurn = 1
     })


    /*
     * =============== Rematches ===============
     */


    // Rematch data = 1 is yes 0 is no
    socket.on('rematch',(yes) => {
        if(yes)
        {
            // Inform user
            $('#rematch').html('Request accepted');
            // Reset Point/vars
            round = 0;
            tran_hoa = 0;
            tran_thang = 0;
            tran_thua = 0;
            choice = 'Rock';
            // Reset interface (hide, show and change color)
            // $('#end_game').hide();
            $('#after_send').show();

            // Start game 
            $('.board').show();

            // Change rematch html back
            $('#rematch').html('Rematch?');
        }
        else console.log('Not rematch yet');
    });

    // Receive when opponent send rematch request
    socket.on('want_rematch', () => {
        console.log('Other wants rematch');
        $('#rematch').html('Opponent wants rematch!!');
    });
})

