import Game from 'entities/game';
import { getGameLength } from './api/how-long-to-beat';
import { getGame as getSaveCoinsGame } from './api/save-coins';

export async function getGame(saveCoinsUrl: string, howLongUrl: string): Promise<Game> {
  const game = await getSaveCoinsGame(saveCoinsUrl);
  const length = await getGameLength(howLongUrl);

  return {
    name: game.name,
    size: game.size,
    releaseDate: game.releaseDate,

    genres: game.genres,
    platforms: ['Switch'],

    price: {
      current: game.price.current,
      regular: game.price.regularPrice,
      lowest: 0.0,
      endDate: undefined,
    },
    length,
  };
}
