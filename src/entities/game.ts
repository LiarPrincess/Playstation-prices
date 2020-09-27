import GamePrice from './game-price';
import GameLength from './game-length';

export default interface Game {
  readonly name: string;
  readonly size: number;
  readonly releaseDate: Date;

  readonly genres: string[];
  readonly platforms: string[];

  readonly price: GamePrice;
  readonly length: GameLength;
}
