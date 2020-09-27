import { join } from 'path';
import { load as parse } from 'cheerio';

import GameLength from './../entities/game-length';
import * as cache from './../helpers/cache';
import * as https from './../helpers/https';

const gameIdRegex = /id=(\d*)/i;

export async function getGameLength(url: string): Promise<GameLength> {
  const gameId = getGameId(url);
  if (!gameId)
    return Promise.reject(`Unable to read 'howlongtobeat.com' game id from '${url}'.`);

  const cacheKey = join('how-long', `${gameId}.html`);

  let html = await cache.get(cacheKey) as string;
  if (!html) {
    html = await https.get(url) as string;
    cache.put(cacheKey, html);
  }

  const $ = parse(html);
  const timeEntries = $('.game_times li');

  let main, mainExtra, complete;
  for (let index = 0; index < timeEntries.length; index++) {
    const entry = timeEntries[index];

    const typeNode = entry.children.find(n => n.name === 'h5');
    const type = typeNode!.children[0].nodeValue;

    const timeNode = entry.children.find(n => n.name === 'div');
    const time = parseTime(timeNode!.children[0].nodeValue);

    if (type.startsWith('Main Story') || type.startsWith('Single-Player') || type.startsWith('Solo')) {
      main = time;
    } else if (type.startsWith('Main + Extra') || type.startsWith('Co-Op')) {
      mainExtra = time;
    } else if (type.startsWith('Completionist')  || type.startsWith('Vs.')) {
      complete = time;
    }
  }

  return { main, mainExtra, complete };
}

function getGameId(url: string) {
  const matches = url.match(gameIdRegex);
  return matches !== null ? matches[1] : undefined;
}

function parseTime(time: string): number {
  time = time.trim();

  if (time === '--')
    return 0;

  if (time.includes('Mins'))
    return 1.0;

  const halfHour = '½';
  if (time.includes(halfHour)) {
    return 0.5 + parseInt(time.substring(0, time.indexOf(halfHour)));
  }

  return parseInt(time);
}
