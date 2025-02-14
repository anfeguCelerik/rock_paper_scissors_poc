// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract RockPaperScissors {
    enum Choice { NONE, ROCK, PAPER, SCISSORS }
    enum GameResult { PENDING, WIN, LOSE, DRAW }

    struct Game {
        address player;
        uint256 bet;
        Choice playerChoice;
        Choice houseChoice;
        GameResult result;
        bool settled;
    }

    mapping(address => Game[]) public playerGames;
    
    event GameStarted(address indexed player, uint256 bet);
    event GameEnded(address indexed player, GameResult result, uint256 payout);

    // Función para jugar
    function play(Choice _playerChoice) external payable {
        require(msg.value > 0, "Bet amount must be greater than 0");
        require(_playerChoice == Choice.ROCK || _playerChoice == Choice.PAPER || _playerChoice == Choice.SCISSORS, "Invalid choice");

        // Generar la elección de la casa (usando un número pseudo-aleatorio simple)
        Choice houseChoice = Choice(uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, block.number))) % 3 + 1);
        
        // Determinar el resultado
        GameResult result = determineWinner(_playerChoice, houseChoice);
        
        // Crear el juego
        Game memory newGame = Game({
            player: msg.sender,
            bet: msg.value,
            playerChoice: _playerChoice,
            houseChoice: houseChoice,
            result: result,
            settled: false
        });
        
        playerGames[msg.sender].push(newGame);
        
        emit GameStarted(msg.sender, msg.value);
        
        // Pagar si el jugador ganó
        if (result == GameResult.WIN) {
            uint256 payout = msg.value * 2;
            payable(msg.sender).transfer(payout);
            emit GameEnded(msg.sender, result, payout);
        } else if (result == GameResult.DRAW) {
            // Devolver la apuesta en caso de empate
            payable(msg.sender).transfer(msg.value);
            emit GameEnded(msg.sender, result, msg.value);
        } else {
            emit GameEnded(msg.sender, result, 0);
        }
    }
    
    function determineWinner(Choice playerChoice, Choice houseChoice) private pure returns (GameResult) {
        if (playerChoice == houseChoice) {
            return GameResult.DRAW;
        }
        
        if (
            (playerChoice == Choice.ROCK && houseChoice == Choice.SCISSORS) ||
            (playerChoice == Choice.PAPER && houseChoice == Choice.ROCK) ||
            (playerChoice == Choice.SCISSORS && houseChoice == Choice.PAPER)
        ) {
            return GameResult.WIN;
        }
        
        return GameResult.LOSE;
    }
    
    // Función para obtener los juegos de un jugador
    function getPlayerGames(address player) external view returns (Game[] memory) {
        return playerGames[player];
    }
    
    // Función para recibir ETH
    receive() external payable {}
}
