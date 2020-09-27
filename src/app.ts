import { promises as fs } from 'fs';

import Game from 'entities/game';
import * as cache from './helpers/cache';
import { getGame as getSwitchGame } from './nintendo-switch';
import { getGame as getPlaystationGame } from './sony-playstation';

(async () => {
  try {
    // await cache.clear();

    const inputFilePath = './input.txt';
    const inputFileContent = await fs.readFile(inputFilePath, 'utf8');

    for (const line of inputFileContent.split('\n')) {
      const game = await getGame(line);
      if (game)
        print(game);
    }
  } catch (e) {
    console.error(e.stack);
    process.exitCode = 1;
  }
})();

async function getGame(line: string): Promise<Game | undefined> {
  if (!line)
    return undefined;

  const [url1, url2, howLongUrl] = line.split('\t');
  if (line.includes('store.playstation.com'))
    return await getPlaystationGame(url1, url2, howLongUrl);

  if (line.includes('savecoins.app'))
    return await getSwitchGame(url1, howLongUrl);

  // throw new Error(`Unable to find parser for: '${line}`);
  return undefined;
}

function print(game: Game): void {
  const genres = game.genres.join(', ');
  const platforms = game.platforms.join(', ');
  const releaseYear = game.releaseDate.getFullYear();

  const price = game.price;
  const discountedPrice = price.current !== price.regular ? price.current : '';
  const normalPrice = price.regular;
  const lowestPrice = price.lowest;
  const discountEnd = price.endDate ? toString(price.endDate) : '';

  const lengthMain = game.length.main || '';
  const lengthMainExtra = game.length.mainExtra || '';
  const lengthComplete = game.length.complete || '';

  let line = '';
  line += `${game.name}\t${platforms}\t${releaseYear}\t`;
  line += `${discountedPrice}\t${normalPrice}\t${lowestPrice}\t${discountEnd}\t`;
  line += `${lengthMain}\t${lengthMainExtra}\t${lengthComplete}`;
  // line += `${genres}`;
  console.log(line);
}

function toString(date: Date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${year}-${month < 10 ? '0' : ''}${month}-${day}`;
}
