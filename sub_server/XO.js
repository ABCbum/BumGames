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
    while((board[y][x] == board[y][x-1]) && x >= 1)
    {
        count++ 
        x--
    }
    x = xRoot
    while((board[y][x] == board[y][x-1]) && x < 8)
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
    while((board[y][x] == board[y-1][x]) && y >= 1)
    {
        count++ 
        y--
    }
    y = yRoot
    while((board[y][x] == board[y+1][x]) && y < 8)
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
    while((board[y][x] == board[y-1][x-1]) && y >= 1 && x >= 1)
    {
        count++ 
        y--
        x--
    }
    y = yRoot
    x = xRoot
    while((board[y][x] == board[y+1][x+1]) && y < 8 && x < 8)
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
    while((board[y][x] == board[y-1][x+1]) && y >= 1 && x < 8)
    {
        count++ 
        y--
        x++
    }
    y = yRoot
    x = xRoot
    while((board[y][x] == board[y+1][x-1]) && y < 8 && x >= 1)
    {
        count++ 
        y--
        x++
    }
    if (count >= 5) return 1
    else {
        count = 1
        console.log('Not diagonal')
    }

    console.log('No win')
    return 0
}