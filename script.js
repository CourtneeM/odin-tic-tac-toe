const createPlayer = (name, marker) => ({ name, marker });

const gameBoard = (() => {
  let board = ['', '', '',
               '', '', '',
               '', '', ''];

  const placeMarker = (index, marker) => {
    board[index] = marker;
  }

  const resetBoard = () => {
    for (let i = 0; i < board.length; i++) {
      board[i] = '';
    }
  }

  return { board, placeMarker, resetBoard };
})();

const displayController = (() => {
  const playerDetailsContainer = document.querySelector('#player-details-container');
  const gameBoardContainer = document.querySelector('#game-board-container');
  const resultsContainer = document.querySelector('#results-container');
  const gameControlsContainer = document.querySelector('#game-controls-container');
  let playerDetailsDiv;

  const generateBoard = () => {
    gameBoard.board.forEach(square => {
      const boardSquare = document.createElement('div');

      boardSquare.classList.add('board-square');
      boardSquare.textContent = square;
      boardSquare.addEventListener('click', e => {
        let index = Array.from(e.target.parentNode.children).indexOf(e.target);
        playGame.takeTurn(index);
      });

      gameBoardContainer.appendChild(boardSquare);
    });
  }

  const updateBoard = (index, marker) => {
    Array.from(gameBoardContainer.children)[index].textContent = marker;
  }

  const clearBoard = () => {
    Array.from(gameBoardContainer.children).forEach(square => square.textContent = '');
    clearWinner();
  }

  const clearWinner = () => {
    resultsContainer.style.display = 'none';
  }

  const disableBoard = () => {
    gameBoardContainer.style['pointer-events'] = 'none';
  }

  const enableBoard = () => {
    gameBoardContainer.style['pointer-events'] = 'auto';
  }

  const playerNameInput = player => {
    const playerInput = document.createElement('input');
    playerInput.setAttribute('type', 'text');
    playerInput.id = `${player.marker.toLowerCase()}-input`;
    
    if (player.name === 'Computer') {
      playerInput.value = 'Computer';
    }

    return playerInput;
  }

  const generatePlayersContainer = players => {
    let div = document.querySelector('#player-details') || document.createElement('div');
    div.id = 'player-details';

    for (let player of players) {
      let p = document.createElement('p');
      p.textContent = `Player ${player.marker}:`;
      div.appendChild(p);
      div.appendChild(playerNameInput(player));
    }

    if (document.querySelector('#player-details')) return;

    playerDetailsContainer.appendChild(div);
    playerDetailsDiv = document.querySelector('#player-details');
  }

  const getPlayerName = player => {
    if (player.name) return;
    
    let playerInput = document.querySelector(`#${player.marker.toLowerCase()}-input`);
    return playerInput.value;
  }

  const displayPlayerNames = players => {
    const playerDetailsDivChildren = Array.from(playerDetailsDiv.children);
    playerDetailsDivChildren.forEach((child, i) => {
      if (child.tagName === 'INPUT') {
        let p = document.createElement('p');
        p.textContent = players[0].name;

        playerDetailsDivChildren.splice(i, 1, p);
        players.shift();
      }

    });

    while (playerDetailsDiv.firstChild) {
      playerDetailsDiv.removeChild(playerDetailsDiv.firstChild);
    }

    playerDetailsDivChildren.forEach(child => playerDetailsDiv.appendChild(child));
  }

  const isComputerPlayer = () => {
    return document.querySelector('input[type="radio"]:checked').value === '1 player';
  }

  const winner = player => {
    let p = resultsContainer.firstChild ? resultsContainer.firstChild : document.createElement('p');

    if (player) {
      p.textContent = `${player.name} is the winner!`;
    } else {
      p.textContent = "It's a tie!";
    }
    
    if (!resultsContainer.firstChild) {
      resultsContainer.appendChild(p);
    }

    resultsContainer.style.display = 'flex';
  }

  const gameControls = gameOver => {
    let button;

    if (!gameOver) {
      let div = document.createElement('div');
      button = document.createElement('button');
      button.textContent = 'Start Game';
      button.classList.add('controls-btn');
      div.appendChild(button);
      gameControlsContainer.appendChild(div);
    }

    if (gameOver) {
      button = document.querySelector('.controls-btn');
      button.textContent = 'Reset Game';
      button.style.display = 'block';
    }

    button.addEventListener('click', () => {
      if (!gameOver) {
        if (playGame.startGame() === false) return;
      }
      if (gameOver) playGame.resetGame();
      button.style.display = 'none';
    });
  }

  const generateNumberOfPlayersControls = (players, computerPlayer) => {
    const div = document.createElement('div');
    const radio1Player = document.createElement('input');
    const label1Player = document.createElement('label');
    const radio2Players = document.createElement('input');
    const label2Players = document.createElement('label');

    div.id = "num-players-container";

    radio1Player.setAttribute('type', 'radio');
    radio1Player.setAttribute('id', '1-player');
    radio1Player.setAttribute('name', 'num-players');
    radio1Player.setAttribute('value', '1 player');
    radio1Player.addEventListener('click', () => {
      while (playerDetailsDiv.firstChild) {
        playerDetailsDiv.removeChild(playerDetailsDiv.firstChild);
      }
      players[1].name = 'Computer';
      generatePlayersContainer(players);
      computerPlayer = true;
    });
    
    radio2Players.setAttribute('type', 'radio');
    radio2Players.setAttribute('id', '2-players');
    radio2Players.setAttribute('name', 'num-players');
    radio2Players.setAttribute('value', '2 players');
    radio2Players.checked = true;
    radio2Players.addEventListener('click', () => {
      while (playerDetailsDiv.firstChild) {
        playerDetailsDiv.removeChild(playerDetailsDiv.firstChild);
      }
      players.forEach(player => player.name = '');
      generatePlayersContainer(players);
      computerPlayer = false;
    });

    label1Player.setAttribute('for', '1-player');
    label1Player.textContent = '1 Player';
    label2Players.setAttribute('for', '2-players');
    label2Players.textContent = '2 Players';

    [radio1Player, label1Player, radio2Players, label2Players].forEach(element => div.appendChild(element));
    playerDetailsContainer.appendChild(div);
  }

  const disableNumberOfPlayersControls = () => {
    const numPlayersContainer = document.querySelector('#num-players-container');
    numPlayersContainer.style['pointer-events'] = 'none';
    numPlayersContainer.style.color = '#777';
  }

  const initialize = (players, computerPlayer) => {
    generateNumberOfPlayersControls(players, computerPlayer);
    generatePlayersContainer(players);
    generateBoard();
    gameControls();
    disableBoard();
  }

  return { initialize, updateBoard, clearBoard, disableBoard, enableBoard, 
           getPlayerName, displayPlayerNames, isComputerPlayer, winner, gameControls, 
           disableNumberOfPlayersControls };
})();

const playGame = (() => {
  let player1 = createPlayer('', 'X');
  let player2 = createPlayer('', 'O');
  let currentPlayer = player1;
  let gameOver = false;
  let computerPlayer = false;

  const startGame = () => {
    player1.name = player1.name || displayController.getPlayerName(player1);
    player2.name = player2.name || displayController.getPlayerName(player2);

    if (!player1.name || !player2.name) return false;

    computerPlayer = displayController.isComputerPlayer();

    displayController.displayPlayerNames([player1, player2]);
    displayController.enableBoard();
    displayController.disableNumberOfPlayersControls();
  }

  const takeTurn = index => {
    if (gameBoard.board[index]) return;

    if (currentPlayer === player2 && computerPlayer) {
      index = computerAI.takeTurn();
    }

    gameBoard.placeMarker(index, currentPlayer.marker);
    displayController.updateBoard(index, currentPlayer.marker);
    checkForWin();

    if (gameOver) return;

    switchPlayer();
  }

  const switchPlayer = () => {
    currentPlayer = currentPlayer === player1 ? player2 : player1;

    if (currentPlayer === player2 && computerPlayer) {
      takeTurn();
    }
  }

  const checkForWin = () => {
    const winPositions = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];

    winPositions.forEach(group => {
      if (group.every(position => gameBoard.board[position] === player1.marker)) {
        return endGame(player1);
      } else if (group.every(position => gameBoard.board[position] === player2.marker)) {
        return endGame(player2);
      }
    });

    if (gameBoard.board.every(square => square) && gameOver === false) {
      endGame();
    }
  }

  const endGame = player => {
    displayController.disableBoard();
    gameOver = true;

    displayController.winner(player);
    displayController.gameControls(gameOver);
  }

  const resetGame = () => {
    currentPlayer = player1;
    gameOver = false;
    gameBoard.resetBoard();
    displayController.clearBoard();
    displayController.enableBoard();
  }

  displayController.initialize([player1, player2]);

  return { startGame, takeTurn, resetGame };
  
})();

const computerAI = (() => {
  const takeTurn = () => {
    const winPositions = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];

    let move;

    // Offense Move
    move = strategicMove(winPositions, 'O');
    if (move || move === 0) return move;

    // Defense Move
    move = strategicMove(winPositions, 'X');
    if (move || move === 0) return move;
    
    return defaultMove();
  }

  const strategicMove = (winPositions, playerMarker) => {
    let availableSpots = winPositions.filter(positionArr => {
      if (positionArr.every(position => gameBoard.board[position])) return false;

      let count = 0;
      positionArr.forEach(position => {
        if (gameBoard.board[position] === playerMarker) {
          count += 1;
        }
      });
      if (count === 2) return true;
    });

    if (availableSpots.length > 0) {
      return availableSpots[Math.floor(Math.random() * availableSpots.length)].filter(index => !gameBoard.board[index])[0];
    }
  }

  const defaultMove = () => {
    let availableSpots = [];

    gameBoard.board.forEach((square, i) => {
      if (!square) availableSpots.push(i);
    });

    // console.log('---default move---');
    return availableSpots[Math.floor(Math.random() * availableSpots.length)];
  }

  /*
             ------ Smarter Offense ------
      If the computer is about to win, pick the next win spot, if available
  */

  return { takeTurn }
  
})();
