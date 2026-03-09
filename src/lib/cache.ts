import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), 'data', 'cache');

/**
 * Generates a unique cache key based on the generation prompts.
 */
export function generateCacheKey(ambientPrompt: string, musicPrompt: string, languagePhrase: string): string {
  const normalized = `${ambientPrompt}|${musicPrompt}|${languagePhrase}`.toLowerCase().trim();
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * Checks if the cache contains the generated audio and metadata for the given key.
 * If so, returns them.
 */
export async function readFromCache(key: string): Promise<{ ambientBuf: Buffer; musicBuf: Buffer; languageBuf: Buffer; metadata: any } | null> {
  const dir = path.join(CACHE_DIR, key);

  try {
    const [ambientBuf, musicBuf, languageBuf, metadataStr] = await Promise.all([
      fs.readFile(path.join(dir, 'ambient.mp3')),
      fs.readFile(path.join(dir, 'music.mp3')),
      fs.readFile(path.join(dir, 'language.mp3')),
      fs.readFile(path.join(dir, 'metadata.json'), 'utf-8'),
    ]);
    return {
      ambientBuf,
      musicBuf,
      languageBuf,
      metadata: JSON.parse(metadataStr),
    };
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      return null; // Cache miss
    }
    console.error(`Error reading from cache for key ${key}:`, err);
    return null;
  }
}

export async function getRandomFromCache(): Promise<{ ambientBuf: Buffer; musicBuf: Buffer; languageBuf: Buffer; metadata: any } | null> {
  try {
    const entries = await fs.readdir(CACHE_DIR, { withFileTypes: true });
    const directories = entries.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);
    
    if (directories.length === 0) {
      return null;
    }
    
    const randomKey = directories[Math.floor(Math.random() * directories.length)];
    return await readFromCache(randomKey);
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      return null;
    }
    console.error('Error reading random from cache dir:', err);
    return null;
  }
}

/**
 * Writes the generated audio buffers and metadata to the cache directory.
 */
export async function writeToCache(key: string, ambientBuf: Buffer, musicBuf: Buffer, languageBuf: Buffer, metadata: any): Promise<void> {
  const dir = path.join(CACHE_DIR, key);

  try {
    await fs.mkdir(dir, { recursive: true });
    await Promise.all([
      fs.writeFile(path.join(dir, 'ambient.mp3'), ambientBuf),
      fs.writeFile(path.join(dir, 'music.mp3'), musicBuf),
      fs.writeFile(path.join(dir, 'language.mp3'), languageBuf),
      fs.writeFile(path.join(dir, 'metadata.json'), JSON.stringify(metadata, null, 2)),
    ]);
  } catch (err) {
    console.error(`Error writing to cache for key ${key}:`, err);
  }
}
