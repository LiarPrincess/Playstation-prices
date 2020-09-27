import { join } from 'path';
import { load as parse } from 'cheerio';

import * as cache from './../helpers/cache';
import * as https from './../helpers/https';

const gameIdRegex = /game\/(\d*)\//i;

export async function getLowestPrice(url: string): Promise<number | 'Free'> {
  const gameId = getGameId(url);
  if (!gameId)
    return Promise.reject(`Unable to read 'PSPrices.com' game id from '${url}'.`);

  const cacheKey = join('ps-prices', `${gameId}.html`);

  let html = await cache.get(cacheKey) as string;
  if (!html) {
    html = await https.get(url) as string;
    cache.put(cacheKey, html);
  }

  const $ = parse(html);
  const prices = $('#price_history')[0].children[3];
  const psPlusPrice = prices.children[3].firstChild.nodeValue; // fml

  const notDigitsOrDot = /[^\d,\.]/g;
  const price = psPlusPrice.replace(notDigitsOrDot, '');
  return price ? parseFloat(price) : 'Free';
}

function getGameId(url: string) {
  const matches = url.match(gameIdRegex);
  return matches !== null ? matches[1] : undefined;
}
