'use strict'

const socket = io.connect('')

// Setup 
$('#game').hide()
$('#after_finding').hide()
$('#after_matched').hide()
$('#end_game').hide()
let player, yourTurn

// Save the latest move to highlight
let currX, currY

// Audio file
let audio = new Audio('../XO_sound.mp3')
let error = new Audio('../err.mp3')

// Check if can play that move
let check = new Array(15)
for (let i = 0; i < 15 ; i++)
{
    check[i] = [1, 1, 1, 1, 1, 1, 1, 1, 1]
}

// Function to send user data to server (username)
function sendData()
{
    let username = $("#name").val();
    console.log("let username = ",username, 'id is', socket.id);
    socket.emit('sendUsernameXO', username);
    
    // Hide
    $('#before_finding').hide()

    // Show before_matched (loaders)
    $('#after_finding').show();
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

// Function when confirm to outButton
function outRoom()
{
    console.log('In function outButton');
    socket.emit('outRoom');
    console.log("Redirecting...");
    window.location.href = "index.html";
}

// Rematch
function rematch()
{
    console.log('Sending rematch request');
    socket.emit('rematchXO');
    $('#rematch').html('Waiting for response..');
}

/*
 *    =============== Make choice =============
 */

 function XOChoice(y, x)
 {
    if(check[y][x] == 1 && yourTurn)
    {
        // 'Demark' the one being marked
        $(`#square${currY}${currX}`).css('color', 'black')

        // Save this choice
        currX = x
        currY = y

        // Show my choice
        socket.emit('XOChoice', y, x, player)
        check[y][x] = 0
        $(`#square${y}${x}`).html(player)
        $(`#square${y}${x}`).css('color', 'red')

        // Disable yourTurn
        yourTurn = 0
        $('#whose_turn').html('Their turn')

        // Play audio
        audio.play()
    }
    else error.play()
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
        $('#after_finding').hide();
        // Check if ready then show the game
        $('#after_matched').show();
        $('#username_vs').html(player1 + " vs " + player2);
        $('#username_vs2').html(player1 + " vs " + player2);
    });

    // Receive event 'both ready' and 'not ready'
    socket.on('both ready', () => {
        console.log("Let's go");
        // Show the game hide ready button

        // Chat
        // $('#you_send').show();
        // $('#opponent_send').show();

        $('#before_ready').hide();
        $('#game').show();
    });

    socket.on('not ready', () => {
        console.log("Not yet!!");
        $('#notifyReady').html("Opponent is not ready...");
    });
    
    socket.on('decide_player', (data) => { 
        console.log('You are', data)

        player = data

        // Decide who goes first
        if(data === 'X') {
            yourTurn = 1
            $('#whose_turn').html('Your turn, you are X')
        }
        else {
            yourTurn = 0
            $('#whose_turn').html('Their turn, you are O')
        }
    })

    /*
     * ================= Game ===============
     */

     socket.on('showChoice',(y, x, plyer) => {
        console.log('Received', y, x, plyer)

        // Change the previously marked back
        currY && $(`#square${currY}${currX}`).css('color', 'black')

        // Disable new move
        check[y][x] = 0

        // Show new move
        $(`#square${y}${x}`).html(plyer)
        $(`#square${y}${x}`).css('color', 'red')

        // Play audio
        audio.play()

        // Save new move
        currX = x
        currY = y
     })

     socket.on('changeTurn', () => {
         // Change turn
         yourTurn = 1
         console.log('Its your turn')
         $('#whose_turn').html('Your turn')
     })

     // Someone wins
     socket.on('has_winner', (winner) => {
        console.log('Match ended, winner is', winner)
        // If i win
        if(winner === player) {
            $('#whose_turn').html('You win!!!')
            $('#whose_turn').css('color', 'green')
        }
        else {
            $('#whose_turn').html('You win!!!')
            $('#whose_turn').css('color', 'red')
        }
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

            // reset game
            $('#end_game').hide()
            for (var y = 0; y < 9; y++)
            {
                for(var x = 0; x < 9; x++)
                {
                    $(`#square${y}${x}`).html('')
                    check[y][x] = 1
                }
            }
            if(player === "X")
            {
                player = "O"
                yourTurn = 0
                $('#whose_turn').html('Their turn, you are O')
            }
            else 
            {
                player = "X"
                yourTurn = 1
                $('#whose_turn').html('Your turn, you are X')
            }

            // $('#game').show();

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

    // When enemy outRoom
    socket.on('beOuted', () => {
        console.log('Im beOuted')

        // Before ready is for outing when is not ready
        $('#before_ready').hide()
        $('#game').hide()

        // Ending
        $('#end_game').show()
        $('#end_message').html('Opponent gives up!!!')
    })

    // When other disconnect
    socket.on('breakMatch', () => {
        console.log('Other has disconnected')

        // Before ready is for outing when is not ready
        $('#before_ready').hide()
        $('#game').hide()

        // Ending
        $('#end_game').show()
        $('#end_message').html('Opponent has disconnected!!!')
    })
})

