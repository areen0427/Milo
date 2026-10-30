import { describe, it, expect } from 'vitest';
import { promises as fs } from 'node:fs';
import path from 'node:path';

describe('legacy npm distribution retirement', () => {
  it('keeps the inherited runtime and launcher private without registering commands', async () => {
    const root = path.resolve(__dirname, '..', '..', '..');
    for (const manifest of ['package.json', 'packages/aiden-os/package.json']) {
      const pkg = JSON.parse(await fs.readFile(path.join(root, manifest), 'utf8'));
      expect(pkg.private).toBe(true);
      expect(pkg.bin).toBeUndefined();
    }
    const pkg = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8'));
    expect(pkg.scripts['publish:stable']).toBeUndefined();
    expect(pkg.scripts['publish:beta']).toBeUndefined();
  });
});
