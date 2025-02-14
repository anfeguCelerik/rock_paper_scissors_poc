export interface RockPaperScissorsContract {
  address: string;
  abi: any[];
}

export enum Choice {
  NONE = 0,
  ROCK = 1,
  PAPER = 2,
  SCISSORS = 3
}

export enum GameResult {
  PENDING = 0,
  WIN = 1,
  LOSE = 2,
  DRAW = 3
}

export interface Game {
  player: string;
  bet: bigint;
  playerChoice: Choice;
  houseChoice: Choice;
  result: GameResult;
  settled: boolean;
}

export interface GameStartedEvent {
  player: string;
  bet: bigint;
}

export interface GameEndedEvent {
  player: string;
  result: GameResult;
  payout: bigint;
}

// Tipos para las respuestas de la blockchain
export type TransactionResponse = {
  wait: () => Promise<TransactionReceipt>;
};

export type TransactionReceipt = {
  status: number;
  events?: Array<{
    event: string;
    args: any[];
  }>;
};

// Tipos para los errores
export class ContractError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'ContractError';
  }
}
