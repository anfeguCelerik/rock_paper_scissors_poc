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
    event GameEnded(
        address indexed player,
        uint8 playerChoice,
        uint8 houseChoice,
        uint8 result,
        uint256 payout
    );

    // Constructor para recibir fondos iniciales
    constructor() payable {}

    // Función para jugar
    function play(uint256 _playerChoice) external payable {
        require(msg.value > 0, "Bet amount must be greater than 0");
        require(_playerChoice >= 1 && _playerChoice <= 3, "Invalid choice");
        require(address(this).balance >= msg.value * 2, "Contract has insufficient funds");

        // Convertir el número a Choice
        Choice playerChoice = Choice(_playerChoice);
        
        // Generar la elección de la casa (usando un número pseudo-aleatorio simple)
        Choice houseChoice = Choice(uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, block.number))) % 3 + 1);
        
        // Determinar el resultado
        GameResult result = determineWinner(playerChoice, houseChoice);
        
        // Crear el juego
        Game memory newGame = Game({
            player: msg.sender,
            bet: msg.value,
            playerChoice: playerChoice,
            houseChoice: houseChoice,
            result: result,
            settled: false
        });
        
        playerGames[msg.sender].push(newGame);
        
        emit GameStarted(msg.sender, msg.value);
        
        uint256 payout = 0;

        // Pagar si el jugador ganó o empató
        if (result == GameResult.WIN) {
            payout = msg.value * 2;
            (bool success, ) = payable(msg.sender).call{value: payout}("");
            require(success, "Failed to send payout");
        } else if (result == GameResult.DRAW) {
            payout = msg.value;
            (bool success, ) = payable(msg.sender).call{value: payout}("");
            require(success, "Failed to send payout");
        }

        // Emitir el resultado del juego
        emit GameEnded(
            msg.sender,
            uint8(playerChoice),
            uint8(houseChoice),
            uint8(result),
            payout
        );
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

    // Función para obtener el balance del contrato
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
