function playerFactory(name) {
    let wins = 0;
    return {
        getName: () => name,
        getWins: () => wins,
        addWin: () => ++wins,
        sayName: () =>
            console.log(`My name is: ${name} and i won ${wins} times`),
    };
}

const gameBoard = (() => {

    function initTile(idx, bord) {
        const tile = document.createElement("div");
        tile.textContent = "";
        tile.classList.add("tile");
        tile.dataset.tile = idx;
        bord.append(tile);
    }

    function init() {
        const bord = document.createElement("div");
        bord.id = "gameboard";
        document.body.append(bord);
        for (let idx = 0; idx < 9; idx++) {
            initTile(idx, bord);
        }
    }

    function drawWin(indices) {
        for (const idx of indices) {
            const tile = document.querySelector(`[data-tile="${idx}"]`);
            tile.classList.add("tile-win");
        }
    }

    return { init, drawWin };
})();

const stateEnum = {
    start: 0,
    addPlayer: 1,
    inGame: 2,
    endGame: 3,
    exit: 4,
};

const gameFlow = (() => {
    let state = 0;
    let players = [];
    let currentPlayer = 1;
    let boardState = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    let icons = { 1: "X", 2: "O" };

    function start() {
        state = 0;
        update();
    }

    function clearBody() {
        document.body.replaceChildren();
    }

    function update() {
        if (state === stateEnum.start) {
            console.log("State-0: Start Screen", state);
            document.body.addEventListener("click", handleStart);
            drawStart();
        }
        if (state === stateEnum.addPlayer) {
            console.log("State-1: Add Player Screen", state);
            document.body.removeEventListener("click", handleStart);
            drawAddPlayer();
            if (players.length >= 2) {
                document.body.removeEventListener("click", handleAddPlayer);
                clearBody();
            }
        }
        if (state === stateEnum.inGame) {
            players.forEach((p) => p.sayName());
            console.log("State-2: Game is running", state);
            document.body.removeEventListener("click", handleAgain);
            renderScoreboard();
            gameBoard.init();
            document.body.addEventListener("click", handleGameClick);
        }
        if (state === stateEnum.endGame) {
            document.body.removeEventListener("click", handleGameClick);
            console.log("State-3: Game is done", state);

            const playAgain = document.createElement("div");
            playAgain.textContent = "Another Round ?";
            playAgain.id = "again-button";
            document.body.append(playAgain);
            document.body.addEventListener("click", handleAgain);
        }
    }

    function drawStart() {
        const title = document.createElement("h1");
        title.textContent = "Tic Tac Toe";
        document.body.append(title);

        const onePlayer = document.createElement("div");
        onePlayer.classList.add("mode");
        onePlayer.textContent = "1 P";
        onePlayer.dataset.numPlayers = 1;

        const twoPlayers = document.createElement("div");
        twoPlayers.classList.add("mode");
        twoPlayers.textContent = "2 P";
        twoPlayers.dataset.numPlayers = 2;

        const startScreen = document.createElement("div");
        startScreen.id = "startScreen";
        startScreen.append(onePlayer);
        startScreen.append(twoPlayers);
        document.body.append(startScreen);
    }

    function handleStart(e) {
        if (!e.target.hasAttribute("data-num-players")) {
            return;
        }
        if (e.target.getAttribute("data-num-players") == 1) {
            players.push(playerFactory("Mr Roboto"));
        }
        state += 1;
        clearBody();
        update();
    }

    function drawAddPlayer() {
        const inputLabel = document.createElement("label");
        inputLabel.for = "playerName";
        inputLabel.textContent = `Enter a name for player ${
            players.length + 1
        }:`;

        const input = document.createElement("input");
        input.name = "playerName";
        input.type = "text";
        input.addEventListener("keydown", handleAddPlayer);

        const addPlayer = document.createElement("div");
        addPlayer.id = "addPlayer";
        addPlayer.append(inputLabel);
        addPlayer.append(input);
        document.body.append(addPlayer);
    }

    function handleAddPlayer(e) {
        if (e.keyCode != 13) {
            return;
        }
        let newPlayer = playerFactory(this.value);
        players.push(newPlayer);
        if (players.length === 2) {
            state += 1;
        }
        clearBody();
        update();
    }

    function renderScoreboard() {
        const p1 = document.createElement("div");
        p1.classList.add("score");
        p1.textContent = `${players[0].getName()}: ${players[0].getWins()}`;
        const p2 = document.createElement("div");
        p2.classList.add("score");
        p2.textContent = `${players[1].getName()}: ${players[1].getWins()}`;

        const scoreboard = document.createElement("div");
        scoreboard.id = "scoreboard";
        scoreboard.append(p1);
        scoreboard.append(p2);
        document.body.append(scoreboard);
    }

    function updateScoreboard() {
        const scoreboard = document.getElementById("scoreboard");
        scoreboard.firstChild.textContent = `${players[0].getName()}: ${players[0].getWins()}`;
        scoreboard.lastChild.textContent = `${players[1].getName()}: ${players[1].getWins()}`;
    }

    function handleGameClick(e) {
        if (!e.target.hasAttribute("data-tile")) {
            return;
        }
        if (e.target.textContent != "") {
            return;
        }
        boardState[e.target.getAttribute("data-tile")] = currentPlayer;
        e.target.textContent = icons[currentPlayer];
        if (detectWin(currentPlayer)) {
            boardState = [0, 0, 0, 0, 0, 0, 0, 0, 0];
            state += 1;
            updateScoreboard();
            update();
        }
        if (detectTie()) {
            boardState = [0, 0, 0, 0, 0, 0, 0, 0, 0];
            state += 1;
            update();
        }
        currentPlayer = { 1: 2, 2: 1 }[currentPlayer];
    }

    function isWon(boardState, indices) {
        const [i1, i2, i3] = indices;
        if (boardState[i1] === 0) return false;
        return (
            boardState[i1] === boardState[i2] &&
            boardState[i2] === boardState[i3]
        );
    }

    function detectWin(player) {
        const winChecks = [
            // horizontals
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            // verticals
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            // diagonals
            [0, 4, 8],
            [2, 4, 6],
        ];
        for (let i = 0; i < winChecks.length; i++) {
            if (isWon(boardState, winChecks[i])) {
                gameBoard.drawWin(winChecks[i]);
                players[player - 1].addWin();
                return true;
            }
        }
    }

    function detectTie() {
        // naive
        if (boardState.findIndex((i) => i === 0) === -1) {
            console.log(`Game is a Tie!`);
            return true;
        }
        // early detection...
    }

    function handleAgain(e) {
        if (e.target.id !== "again-button") {
            return;
        }
        state = 2;
        clearBody();
        update();
    }

    return { start };
})();

gameFlow.start();
