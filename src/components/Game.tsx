import { useState, useEffect } from 'react';
import { useAccount, useChainId, useBalance, useWriteContract, useTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { localChain } from '../config/web3';
import contractAddress from '../contracts/contract-address.json';
import '../styles/Game.css';

type Choice = 'ROCK' | 'PAPER' | 'SCISSORS';
type GameResult = 'WIN' | 'LOSE' | 'DRAW' | null;
type GameHistory = Array<{ result: GameResult; amount: number }>;

const HAND_IMAGES = {
  ROCK: "✊",
  PAPER: "✋",
  SCISSORS: "✌️"
};

const BETS = [0.1, 0.2, 0.3, 0.5, 0.8, 1] as const;

// ABI simplificado para la función play y el evento GameEnded
const contractABI = [
  {
    name: 'play',
    type: 'function',
    stateMutability: 'payable',
    inputs: [{ name: 'choice', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'GameEnded',
    type: 'event',
    inputs: [
      { name: 'player', type: 'address', indexed: true },
      { name: 'playerChoice', type: 'uint8', indexed: false },
      { name: 'houseChoice', type: 'uint8', indexed: false },
      { name: 'result', type: 'uint8', indexed: false },
      { name: 'payout', type: 'uint256', indexed: false }
    ],
  }
] as const;

const Game = () => {
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [computerChoice, setComputerChoice] = useState<Choice | null>(null);
  const [selectedBet, setSelectedBet] = useState<number>(0.1);
  const [gameHistory, setGameHistory] = useState<GameHistory>([]);
  const [result, setResult] = useState<GameResult>(null);
  const [isWaiting, setIsWaiting] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);

  // Wagmi hooks
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: balance, refetch: refetchBalance } = useBalance({
    address: address,
  });

  const isLocalNetwork = chainId === localChain.id;
  const tokenSymbol = isLocalNetwork ? 'ETH' : 'WLD';

  // Contract interaction
  const { writeContractAsync } = useWriteContract();
  const { isLoading: isTransactionPending } = useTransaction({
    hash: txHash,
  });

  const { isSuccess: isTransactionSuccess, data: transactionReceipt } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Refrescar el balance cada 2 segundos mientras hay una transacción pendiente
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTransactionPending) {
      interval = setInterval(() => {
        refetchBalance();
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTransactionPending, refetchBalance]);

  // Procesar el resultado cuando la transacción se completa
  useEffect(() => {
    if (isTransactionSuccess && transactionReceipt && playerChoice) {
      // Buscar el evento GameEnded en los logs
      const gameEndedLog = transactionReceipt.logs.find(log => 
        log.topics[0] === '0xa730a3f66e84212c1a3c6e523277e256a5a71338f2a07b2edd31da04a6c6dc3b' // keccak256("GameEnded(address,uint8,uint8,uint8,uint256)")
      );

      if (gameEndedLog && gameEndedLog.data) {
        // Decodificar los datos del evento
        const data = gameEndedLog.data.slice(2); // Remover 0x
        //const playerChoiceData = parseInt(data.slice(0, 64), 16);
        const houseChoice = parseInt(data.slice(64, 128), 16);
        const gameResult = parseInt(data.slice(128, 192), 16);

        // Convertir el número de la elección de la casa a Choice
        const choices: Choice[] = ['ROCK', 'PAPER', 'SCISSORS'];
        const newComputerChoice = choices[houseChoice - 1];
        setComputerChoice(newComputerChoice);

        // Convertir el número del resultado a GameResult
        const results: (GameResult)[] = [null, 'WIN', 'LOSE', 'DRAW'];
        const newResult = results[gameResult];
        setResult(newResult);

        // Actualizar el historial
        setGameHistory(prev => {
          const newHistory = [...prev, { result: newResult, amount: selectedBet }];
          if (newHistory.length > 3) newHistory.shift();
          return newHistory;
        });

        // Refrescar el balance una última vez
        refetchBalance();

        setIsWaiting(false);
        setTxHash(undefined);
      }
    }
  }, [isTransactionSuccess, transactionReceipt, playerChoice, selectedBet, refetchBalance]);

  const getChoiceNumber = (choice: Choice): bigint => {
    switch (choice) {
      case 'ROCK': return BigInt(1);
      case 'PAPER': return BigInt(2);
      case 'SCISSORS': return BigInt(3);
      default: return BigInt(1);
    }
  };

  const hasEnoughBalance = () => {
    if (!balance) return false;
    return parseFloat(balance.formatted) >= selectedBet;
  };

  const play = async () => {
    if (!playerChoice || !isConnected || !hasEnoughBalance()) return;
    
    setIsWaiting(true);
    
    try {
      // Llamar al contrato
      const hash = await writeContractAsync({
        address: contractAddress.RockPaperScissors as `0x${string}`,
        abi: contractABI,
        functionName: 'play',
        args: [getChoiceNumber(playerChoice)],
        value: parseEther(selectedBet.toString()),
        gas: BigInt(300000), // Aumentar el límite de gas
      });

      setTxHash(hash);
    } catch (error) {
      console.error('Error playing game:', error);
      setIsWaiting(false);
      setTxHash(undefined);
    }
  };

  const getPlayButtonText = () => {
    if (!isConnected) return 'Connect Wallet to Play';
    if (!hasEnoughBalance()) return `Insufficient ${tokenSymbol} Balance`;
    if (isTransactionPending) return 'Confirming...';
    return 'PLAY!';
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <div className="history">
          <span>LAST {gameHistory.length}</span>
          {[...Array(3)].map((_, i) => (
            <span key={i} className="history-item">
              {gameHistory[i]?.result === 'WIN' ? '👤' : '⚪'}
            </span>
          ))}
        </div>
        {balance && (
          <div className="balance-display">
            {parseFloat(balance.formatted).toFixed(4)} {tokenSymbol}
          </div>
        )}
      </div>

      {isWaiting ? (
        <div className="waiting-message">
          {isTransactionPending ? 'Confirming transaction...' : 'Opponent is choosing...'}
        </div>
      ) : computerChoice ? (
        <div className="result-screen">
          <div className="choices-display">
            <div className="choice-result">
              <div className="player">
                <span className="hand-emoji">{HAND_IMAGES[playerChoice!]}</span>
                <span>You</span>
              </div>
              <div className="vs">VS</div>
              <div className="computer">
                <span className="hand-emoji">{HAND_IMAGES[computerChoice]}</span>
                <span>Opponent</span>
              </div>
            </div>
          </div>
          {result && (
            <>
              <div className={`result-message ${result.toLowerCase()}`}>
                {result === 'WIN' ? (
                  <>
                    YOU WIN!
                    <div className="winning-amount">+{selectedBet} {tokenSymbol}</div>
                  </>
                ) : result === 'LOSE' ? (
                  <>
                    YOU LOSE!
                    <div className="losing-amount">-{selectedBet} {tokenSymbol}</div>
                  </>
                ) : (
                  'DRAW!'
                )}
              </div>
              <button className="play-again" onClick={() => {
                setResult(null);
                setComputerChoice(null);
                setPlayerChoice(null);
                setTxHash(undefined);
              }}>
                PLAY AGAIN!
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="game-controls">
          <div className="choices">
            {(['ROCK', 'PAPER', 'SCISSORS'] as Choice[]).map((choice) => (
              <button
                key={choice}
                onClick={() => setPlayerChoice(choice)}
                className={playerChoice === choice ? 'selected' : ''}
                disabled={!isConnected || isTransactionPending}
              >
                <span className="hand-emoji">{HAND_IMAGES[choice]}</span>
                <span className="choice-text">{choice}</span>
              </button>
            ))}
          </div>
          <div className="bet-amounts">
            {BETS.map((bet: number) => (
              <button
                key={bet}
                className={selectedBet === bet ? 'selected' : ''}
                onClick={() => setSelectedBet(bet)}
                disabled={isTransactionPending}
              >
                {bet} {tokenSymbol}
              </button>
            ))}
          </div>
          <button 
            className="play-button" 
            onClick={play}
            disabled={!playerChoice || !isConnected || !hasEnoughBalance() || isTransactionPending}
          >
            {getPlayButtonText()}
          </button>
        </div>
      )}
    </div>
  );
};

export default Game;
