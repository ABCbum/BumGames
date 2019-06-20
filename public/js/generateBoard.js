const board = $('.board')

// Make board i is 
// 
for (var y = 0; y < 9; y++)
{
    for(var x = 0; x < 9; x++)
    {
        board.append(`<button class="square" id="square${y}${x}" onclick="XOChoice(${y},${x})"></button>`)
    }
}

