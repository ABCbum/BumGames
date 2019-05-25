var socket = io.connect("https://bumgames.herokuapp.com");

// Hide loader game before_matched 
// contains loaders and cancel button
$('#before_matched').hide();
$('#you_send').hide();
$('#opponent_send').hide();
$('#after_send').hide();
$('#end_game').hide();

// Count rounds
var round = 0;
var tran_thua = 0;
var tran_thang = 0;
var tran_hoa = 0;

// Countdown change the clock a little bit : add an additional
// second to make ensure changes in last seconds
function run_clock(time) 
{
    var timeleft = time;
    console.log('Round',round,'Thang',tran_thang,'Thua',tran_thua,'Hoa',tran_hoa);
    function update_clock()
    {
        if (timeleft == -1) document.getElementById("clock").innerHTML = 0;
        else document.getElementById("clock").innerHTML = timeleft;
        timeleft -= 1;
        if(timeleft < 0){
          if(timeleft == -2)
          {
            clearInterval(downloadTimer);
            socket.emit('select', round, choice, socket.id);
            socket.emit('checkResult', round);
          }
        }
      }
    var downloadTimer = setInterval(update_clock, 1000);    
}

// Function to send user data to server (username)
function sendData()
{
    let username = $("#name").val();
    console.log("let username = ",username);
    console.log(socket.id);
    socket.emit('sendUsernameRPSS', username);
    // Hide
    $('#sendButton').hide();
    $('#name').hide();
    $('#header').hide();
    // Show
    $('#before_matched').show();
};
// Cancel finding match
function cancel()
{
    // Send event
    socket.emit('cancel_finding_RPSS');
    location.reload();
}
// Send choice part
var choice = "Rock";
var changeable = 1;

// Function to change choice and giveEnemyHint event to server
function selectRock() 
{
    console.log('Choosing Rock');
    choice = 'Rock';
    // If changeable then html the showChoice
    if(changeable) {
        $('#showChoice').html(choice);
    }
    socket.emit('giveEnemyHint', choice);
}

// Function to change choice and giveEnemyHint event to server
function selectPaper() 
{
    console.log('Choosing Paper');
    choice = 'Paper';
    if(changeable) {
        $('#showChoice').html(choice);
    }
    socket.emit('giveEnemyHint', choice);
}

// Function to change choice and giveEnemyHint event to server
function selectScissors() 
{
    console.log('Choosing Scissors');
    choice = 'Scissors';
    if(changeable) {
        $('#showChoice').html(choice);
    }
    socket.emit('giveEnemyHint', choice);
}

// Send emochat gifs why, what, scared, happy
function emochat_why()
{
    console.log('Sending why');
    socket.emit('emochat_why');
    $('#you_gif').attr('src' , 'why.gif');
}
function emochat_what()
{
    console.log('Sending what');
    socket.emit('emochat_what');
    $('#you_gif').attr('src' , 'what.gif');
}
function emochat_scared()
{
    console.log('Sending scared');
    socket.emit('emochat_scared');
    $('#you_gif').attr('src' , 'scared.gif');
}
function emochat_happy()
{
    console.log('Sending happy');
    socket.emit('emochat_happy');
    $('#you_gif').attr('src' , 'happy.gif');
}

// Function when confirm to outButton
function outRoom()
{
    console.log('In function outButton');
    socket.emit('outRoom',);
    console.log("Redirecting...");
    window.location.href = "index.html";
}

// Rematch
function rematch()
{
    console.log('Sending rematch request');
    socket.emit('rematch');
    $('#rematch').html('Waiting for response..');
}

// Back
function back()
{

}

// Notify that the player is ready
function ready()
{
    console.log("I'm ready");
    socket.emit('readyRPS', socket.id);
}

socket.on('connect', function(){
    console.log(socket.id);

    // Receive event when "matching_done" from server
    socket.on('matching_done', (player1, player2) => {
        console.log("Matching btw ", player1, "and", player2, "is done!");

        // Hide loaders
        $('#before_matched').hide();

        // Check if ready then show the game
        $('#after_send').show();        
        $('#game').hide();
        $('#username_vs').html(player1 + " vs " + player2);

    });

    // Receive event 'both ready' and 'not ready'
    socket.on('both ready', () => {
        console.log("Let's go");
        // Show the game hide ready button
        $('#game').show();
        $('#you_send').show();
        $('#opponent_send').show();
        run_clock(5);
        $('#before_ready').hide();
    });

    socket.on('not ready', () => {
        console.log("Not yet!!");
        $('#notifyReady').html("Opponent is not ready...");
    });

    // showEChoice - to receive enemy's choice data here is E's Choice
    socket.on('showEChoice', (data) => {
        console.log("E's choice is",data);
        $('#showEChoice').html(data);
    });

    // Receive opponents emochat
    socket.on('emochat_what', () => {
        $('#opponent_gif').attr('src' , 'what.gif');
    });
    socket.on('emochat_why', () => {
        $('#opponent_gif').attr('src' , 'why.gif');
    });
    socket.on('emochat_happy', () => {
        $('#opponent_gif').attr('src' , 'happy.gif');
    });
    socket.on('emochat_scared', () => {
        $('#opponent_gif').attr('src' , 'scared.gif');
    });

    // Receive "select" event sent from server
    socket.on('select', (choice, player) => {
        console.log("Received");
        console.log(player,'chose',choice);
    }); 

    // Get round result from 'result' event server send '0' if draw
    // Things to do : add round, update tran_thua, tran_thang, tran_hoa, 
    // reset choice = "Rock" .Also check if win, lose or draw.
    socket.on('result', (winner, loser, roundServer) => {
        // Draw round
        if(winner == '0')
        {
            console.log("Draw round",round);
            tran_hoa += 1;
            $('#point_' + roundServer).css('background-color' , 'blue');
            //$('#point_' + roundServer).html('X');
            let difference = tran_thang - tran_thua;
            console.log('Thang - thua',difference);
            // If win and last match draw
            if(round == 4 && difference > 0)
            {
                console.log('I win this match');
                socket.emit('win_match_RPS');
                return;
            }
            // If win early (if difference > rounds_left)
            if(difference > (4 - round)) 
            {
                console.log('Win early');
                socket.emit('win_match_RPS');
                return;
            }
            // If lose early
            if(difference < 0 && (-difference > (4 - round)))
            {
                console.log('Lose early');
                socket.emit('lose_match_RPS');
                return;
            }
            // If lose last match draw
            if(round == 4 && difference < 0)
            {
                console.log('I lost the match');
                socket.emit('lose_match_RPS');
                return;
            }
            if(tran_hoa == 5 || ((difference == 0) && round == 4)) socket.emit('draw_match_RPS');
            else {
                round += 1;
                run_clock(6);
            }
        }
        // Win or lose round
        else 
        {
            if(winner == socket.id) 
            {
                console.log('I won round',round);
                tran_thang += 1;
                $('#point_' + roundServer).css('background-color' ,'green');
                let difference = tran_thang - tran_thua;
                console.log('Thang - thua',difference);

                // If draw and last match win
                if((difference == 0 && round == 4)) 
                {
                    socket.emit('draw_match_RPS');
                    return;
                }

                // If win early (if difference > rounds_left)
                if(difference > (4 - round)) 
                {
                    console.log('Win early');
                    socket.emit('win_match_RPS');
                    return;
                }
                
                // If win 3 rounds
                if(tran_thang == 3 || ((difference > 0) && round == 4)) socket.emit('win_match_RPS');
                else {
                    round += 1;
                    run_clock(6);
                }
            }
            else
            {
                console.log('I lost round',round);
                tran_thua += 1;
                $('#point_' + roundServer).css('background-color' ,'red');
                let difference = tran_thang - tran_thua;
                console.log('thang - thua',difference);

                // If draw and last match lose
                if(difference == 0 && round == 4) 
                {
                    socket.emit('draw_match_RPS');
                    return;
                }

                // If lose early
                if(difference < 0 && (-difference > (4 - round)))
                {
                    console.log('Lose early');
                    socket.emit('lose_match_RPS');
                    return;
                }

                // If lose 3 rounds
                if(tran_thua == 3 || ((difference < 0) && round == 4)) socket.emit('lose_match_RPS');
                else {
                    round += 1;
                    run_clock(6);
                }    
            }
        }
    });

    // What to do when match has result
    // Win match
    socket.on('win_match_RPS', () => {
        console.log('You won the match');
        // Show the you win in win_end
        $('#after_send').hide();
        $('#end_game').show();
        $('#draw_end').hide();
        $('#lose_end').hide();
        $('#quit_end').hide();
    });

    // Lose match
    socket.on('lose_match_RPS', () => {
        console.log('You lost the match');
        // Show the you lose in lose_end
        $('#after_send').hide();
        $('#end_game').show();
        $('#draw_end').hide();
        $('#win_end').hide();
        $('#quit_end').hide();
    })

    // Draw match
    socket.on('draw_match_RPS', () => {
        console.log('This match is draw');
        // Show the draw in draw_end
        $('#after_send').hide();
        $('#end_game').show();
        $('#lose_end').hide();
        $('#win_end').hide();
        $('#quit_end').hide();
    });

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
            $('#end_game').hide();
            for(var i = 0; i < 5; i++)
            {
                console.log('#point_' + i,typeof('#point_' + i));
                $('#point_' + i).css('background-color' , 'white');
            } 
            $('#after_send').show();
            // Run game again
            run_clock(6);
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

    // Receive event when "breakMatch" from server
    socket.on('breakMatch', () => {
        console.log('This match is broken');
        // Show the you win + play again board
        $('#after_send').hide();
        $('#end_game').show();
        $('#rematch').hide();
        $('#draw_end').hide();
        $('#lose_end').hide();
        $('#win_end').hide();
    });

    // Receive event when beOuted
    socket.on('beOuted', () =>{
        console.log("I'm beOuted :<");
        socket.emit('beOuted',);

        // Show the you win + play again board
        $('#after_send').hide();
        $('#end_game').show();
        $('#rematch').hide();
        $('#draw_end').hide();
        $('#lose_end').hide();
        $('#win_end').hide();
    });
});