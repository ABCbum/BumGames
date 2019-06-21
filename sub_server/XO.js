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
    let count = 0

    // Horizontal
    while((board[y][x] == board[y][x-1]) && x >= 0)
    {
        count++ 
        x--
    }
    x = xRoot
    while((board[y][x] == board[y][x-1]) && x < 9)
    {
        count++ 
        x++
    }
    if (count >= 5) return 1
    else {
        console.log('Not horizontal')
        count = 0
    }

    y = yRoot
    x = xRoot

    // Vertical
    while((board[y][x] == board[y-1][x]) && y >= 0)
    {
        count++ 
        y--
    }
    y = yRoot
    while((board[y][x] == board[y+1][x]) && y < 9)
    {
        count++ 
        y++
    }
    if (count >= 5) return 1
    else 
    {
        console.log('Not vertical')
        count = 0
    }

    y = yRoot
    x = xRoot

    // Main Diagonal
    while((board[y][x] == board[y-1][x-1]) && y >= 0 && x >= 0)
    {
        count++ 
        y--
        x--
    }
    y = yRoot
    x = xRoot
    while((board[y][x] == board[y+1][x+1]) && y < 9 && x < 9)
    {
        count++ 
        y++
        x++
    }
    if (count >= 5) return 1
    else {
        count = 0
        console.log('Not main diagonal')
    }

    y = yRoot
    x = xRoot

    // The other diagonal
    while((board[y][x] == board[y-1][x+1]) && y >= 0 && x < 9)
    {
        count++ 
        y--
        x++
    }
    y = yRoot
    x = xRoot
    while((board[y][x] == board[y+1][x-1]) && y < 9 && x >= 0)
    {
        count++ 
        y--
        x++
    }
    if (count >= 5) return 1
    else {
        count = 0
        console.log('Not diagonal')
    }

    y = yRoot
    x = xRoot

    console.log('No win')
    return 0
}