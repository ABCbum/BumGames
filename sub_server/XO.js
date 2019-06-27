/* 
*  ================ XO Game Logic ==============
*
*   Check around board[y][x]
*
*/ 

module.exports = exports = (board, y, x) => {
    // console.log(board)

    // save the root 
    let yRoot = y
    let xRoot = x
    let count = 1

    // Horizontal
    while(x >= 1 && (board[y][x] == board[y][x-1]) )
    {
        count++ 
        x--
    }
    x = xRoot
    while(x < 14 && (board[y][x] == board[y][x+1]))
    {
        count++ 
        x++
    }
    if (count >= 5) return 1
    else {
        console.log('Not horizontal')
        count = 1
    }

    y = yRoot
    x = xRoot

    // Vertical
    while(y >= 1 && (board[y][x] == board[y-1][x]))
    {
        count++ 
        y--
    }
    y = yRoot
    while(y < 14 && (board[y][x] == board[y+1][x]))
    {
        count++ 
        y++
    }
    if (count >= 5) return 1
    else 
    {
        console.log('Not vertical')
        count = 1
    }

    y = yRoot
    x = xRoot

    // Main Diagonal
    while(y >= 1 && x >= 1 && (board[y][x] == board[y-1][x-1]))
    {
        count++ 
        y--
        x--
    }
    y = yRoot
    x = xRoot
    while(y < 14 && x < 14 && (board[y][x] == board[y+1][x+1]))
    {
        count++ 
        y++
        x++
    }
    if (count >= 5) return 1
    else {
        count = 1
        console.log('Not main diagonal')
    }

    y = yRoot
    x = xRoot

    // The other diagonal
    while(y >= 1 && x < 14 && (board[y][x] == board[y-1][x+1]))
    {
        count++ 
        y--
        x++
    }
    y = yRoot
    x = xRoot
    while(y < 14 && x >= 1 && (board[y][x] == board[y+1][x-1]))
    {
        count++ 
        y++
        x--
    }
    if (count >= 5) return 1
    else {
        count = 1
        console.log('Not diagonal')
    }

    console.log('No win')
    return 0
}