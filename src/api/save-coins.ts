import { join } from 'path';

import * as cache from './../helpers/cache';
import * as https from './../helpers/https';

const locale = 'en';
const country = 'PL';
const currency = 'PLN';

const gameNameRegex = /https:\/\/savecoins.app\/game\/(.*)/;

export interface SaveCoinsGame {
  readonly name: string;
  readonly size: number;
  readonly releaseDate: Date;
  readonly genres: [string];
  readonly platforms: [string];
  readonly price: SaveCoinsPrice;
}

export interface SaveCoinsPrice {
  readonly current: number;
  readonly regularPrice: number;
  readonly hasDiscount: boolean;
}

export async function getGame(url: string): Promise<SaveCoinsGame> {
  const gameName = getGameName(url);
  if (!gameName)
    return Promise.reject(`Unable to read 'savecoins.app' game name from '${url}'.`);

  const gameJSON = await getGameData(gameName);
  const game = JSON.parse(gameJSON).data;

  const pricesJSON = await getPriceData(gameName);
  const prices = JSON.parse(pricesJSON).digital as any[];
  const price = prices.map(p => p.priceInfo).find(p => p.country.code === country);

  if (!price)
    return Promise.reject(`Unable to find 'savecoins.app' price for '${url}'.`);

  const releaseDateSplit = game.releaseDate.split('-');
  const releaseDate = new Date(releaseDateSplit[0], releaseDateSplit[1] - 1, releaseDateSplit[2]);

  return {
    name: game.title,
    size: game.size / (1024 * 1024 * 1024),
    genres: game.categories,
    platforms: [game.platform],
    releaseDate,
    price: {
      current: price.rawCurrentPrice,
      regularPrice: price.regularPrice.rawRegularPrice,
      hasDiscount: price.hasDiscount
    }
  };
}

function getGameName(url: string) {
  const matches = url.match(gameNameRegex);
  return matches !== null ? matches[1] : undefined;
}

async function getGameData(gameName: string): Promise<string> {
  const cacheKey = join('save-coins', `${gameName}.json`);

  let data = await cache.get(cacheKey) as string;
  if (!data) {
    const url = `https://api-savecoins.nznweb.com.br/v1/games/${gameName}?currency=${currency}&locale=${locale}`;
    data = await https.get(url) as string;
    cache.put(cacheKey, data);
  }

  return data;
}

async function getPriceData(gameName: string): Promise<string> {
  const cacheKey = join('save-coins', `${gameName}-prices.json`);

  let data = await cache.get(cacheKey) as string;
  if (!data) {
    const url = `https://api-savecoins.nznweb.com.br/v1/games/${gameName}/prices?currency=${currency}&locale=${locale}`;
    data = await https.get(url) as string;
    cache.put(cacheKey, data);
  }

  return data;
}
