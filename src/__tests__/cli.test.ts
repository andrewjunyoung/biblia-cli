import { execSync } from 'child_process';
import { join } from 'path';
import { getVerse } from '../index';

const CLI_PATH = join(__dirname, '../../dist/index.js');

describe('CLI Integration Tests', () => {
  beforeAll(() => {
    // Build the project before running tests
    execSync('npm run build', { cwd: join(__dirname, '../..'), stdio: 'inherit' });
  });

  describe('get-verse command', () => {
    it('should successfully fetch John 3:16 with all expected fields', async () => {
      const results = await getVerse('John 3:16');

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);

      const verse = results[0];
      expect(typeof verse.verse).toBe('string');
      expect(verse.verse.length).toBeGreaterThan(0);

      expect(verse.original).toBeTruthy();
      expect(typeof verse.original).toBe('string');
      expect(verse.original!.length).toBeGreaterThan(0);

      expect(verse.transcription).toBeTruthy();
      expect(typeof verse.transcription).toBe('string');
      expect(verse.transcription!.length).toBeGreaterThan(0);

      expect(typeof verse.translation).toBe('string');
      expect(verse.translation.length).toBeGreaterThan(0);

      expect(verse.strongs).toBeDefined();
      expect(Array.isArray(verse.strongs.codes)).toBe(true);
      expect(Array.isArray(verse.strongs.roots)).toBe(true);
      expect(Array.isArray(verse.strongs.translations)).toBe(true);

      const arrayLength = verse.strongs.codes.length;
      expect(arrayLength).toBeGreaterThan(0);
      expect(verse.strongs.roots.length).toBe(arrayLength);
      expect(verse.strongs.translations.length).toBe(arrayLength);

      verse.strongs.codes.forEach((code: string) => {
        expect(typeof code).toBe('string');
        expect(code.length).toBeGreaterThan(0);
      });

      verse.strongs.roots.forEach((root: string) => {
        expect(typeof root).toBe('string');
        expect(root.length).toBeGreaterThan(0);
      });

      verse.strongs.translations.forEach((translation: string) => {
        expect(typeof translation).toBe('string');
        expect(translation.length).toBeGreaterThan(0);
      });
    });
  });

  describe('get-strongs command', () => {
    it('should successfully fetch Greek Strong\'s G0024', () => {
      const result = execSync(`node ${CLI_PATH} get-strongs G0024`, {
        encoding: 'utf8',
        cwd: join(__dirname, '../..'),
      });

      expect(result).toBeTruthy();
    });

    it('should successfully fetch Hebrew Strong\'s H1234', () => {
      const result = execSync(`node ${CLI_PATH} get-strongs H1234`, {
        encoding: 'utf8',
        cwd: join(__dirname, '../..'),
      });

      expect(result).toBeTruthy();
    });
  });
});
