import Game from 'entities/game';
import { getGameLength } from './api/how-long-to-beat';
import { getGame as getPSStoreGame } from './api/ps-store';
import { getLowestPrice } from './api/ps-prices';

export async function getGame(psStoreUrl: string, psPricesUrl: string, howLongUrl: string): Promise<Game> {
  const game = await getPSStoreGame(psStoreUrl);
  const length = await getGameLength(howLongUrl);
  const lowestPrice = await getLowestPrice(psPricesUrl);
  const price = game.price;

  return {
    name: game.name,
    size: game.size,
    releaseDate: game.releaseDate,

    genres: game.genres,
    platforms: game.platforms,

    price: {
      current: price.current,
      regular: price.strikethrough === 'None' ? price.current : price.strikethrough,
      lowest: lowestPrice,
      endDate: price.endDate,
    },
    length,
  };
}
