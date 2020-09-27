import { join } from 'path';

import * as cache from './../helpers/cache';
import * as https from './../helpers/https';

const hasPlus = true;

export interface PSStoreGame {
  readonly name: string;
  readonly size: number;
  readonly genres: [string];
  readonly platforms: [string];
  readonly releaseDate: Date;
  readonly price: PSStorePrice;
}

export interface PSStorePrice {
  readonly current: number;
  readonly strikethrough: number | 'None';
  readonly endDate?: Date;
}

export async function getGame(url: string): Promise<PSStoreGame> {
  // todo: handle errors? regex maybe?
  const gameId = url.substring(url.lastIndexOf('/') + 1);
  const cacheKey = join('ps-store', `${gameId}.json`);

  let data = await cache.get(cacheKey) as string;
  if (!data) {
    data = await https.get(`https://store.playstation.com/valkyrie-api/en/PL/999/resolve/${gameId}`) as string;
    cache.put(cacheKey, data);
  }

  const gameEntries = JSON.parse(data).included as any[];
  const entry = gameEntries.find(g => g.id === gameId);

  if (!entry)
    return Promise.reject(`Unable to find correct entry in PS Store response for: '${url}'`);

  const game = entry.attributes;

  const releaseDateSplit = game['release-date'].split('T')[0].split('-');
  const releaseDate = new Date(releaseDateSplit[0], releaseDateSplit[1] - 1, releaseDateSplit[2]);

  const payables = game.skus as any[];
  const prices = (payables.find(s => s.name === 'Full Game') || payables[0]).prices;
  const price = hasPlus ? prices['plus-user'] : prices['non-plus-user'];
  const priceEndDate = price.availability['end-date'];

  return {
    name: game.name.trim(),
    size: game['file-size'].value,
    genres: game.genres,
    platforms: game.platforms,
    releaseDate,
    price: {
      current: price['actual-price'].value / 100.0,
      strikethrough: price['strikethrough-price'] ? price['strikethrough-price'].value / 100.0 : 'None',
      endDate: priceEndDate ? new Date(priceEndDate) : undefined,
    },
  };
}
