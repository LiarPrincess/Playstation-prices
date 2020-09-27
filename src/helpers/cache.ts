import { promises as fs, PathLike } from 'fs';
import { join, dirname } from 'path';

const encoding = 'utf8';
const cacheDir = join(process.cwd(), 'cache');
const createFilePath = (key: string) => join(cacheDir, key);

export async function get(key: string) {
  try {
    const filePath = createFilePath(key);
    return await fs.readFile(filePath, encoding);
  } catch (error) {
    return undefined;
  }
}

export async function put(key: string, data: any) {
  const filePath = createFilePath(key);

  const dir = dirname(filePath);
  await fs.mkdir(dir, { recursive: true });

  await fs.writeFile(filePath, data, encoding);
}

export async function clear() {
  removeFilesRec(cacheDir);
}

/**
 * Remove files in all of the subdirectories leaving dir tree untouched
 */
async function removeFilesRec(dirPath: string) {
  const entries = await fs.readdir(dirPath);
  for (const entry of entries) {
    const path = join(dirPath, entry);
    const stats = await fs.lstat(path);

    if (stats.isFile()) {
      await fs.unlink(path);
    }
    else if (stats.isDirectory()) {
      await removeFilesRec(path);
    }
  }
}
