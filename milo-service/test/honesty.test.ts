import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkAnswer, annotate } from '../src/honesty.ts';

test('flags claimed actions the trace does not support', () => {
  const none: Array<{ name: string; status: string }> = [];
  assert.equal(checkAnswer('I have created the file owner.txt with the name.', none)[0].tool, 'file_write');
  assert.equal(checkAnswer('The file owner.txt has been created successfully.', [{ name: 'file_write', status: 'failed' }])[0].tool, 'file_write');
  assert.equal(checkAnswer('I ran the build command and it passed.', none)[0].tool, 'shell_run');
  assert.equal(checkAnswer('I fetched the page and its title is Example.', none)[0].tool, 'web_fetch');
  assert.match(annotate('Done.', checkAnswer('I wrote the file.', none)), /Milo check: the answer says a file was written/);
});

test('does not flag supported, negated or conditional statements', () => {
  assert.deepEqual(checkAnswer('I created the file owner.txt.', [{ name: 'file_write', status: 'succeeded' }]), []);
  assert.deepEqual(checkAnswer('I could not create the file because no folder is granted.', []), []);
  assert.deepEqual(checkAnswer('Once you grant network access I will fetch the page.', []), []);
  assert.deepEqual(checkAnswer('The deadline is Friday, November 14.', []), []);
  assert.equal(annotate('Fine.', []), 'Fine.');
});

test('catches common phrasings of file, delete, command and page claims', () => {
  const none: Array<{ name: string; status: string }> = [];
  const tools = (text: string) => checkAnswer(text, none).map(f => f.tool);
  for (const text of ['I saved the file.', 'Saved the file to ~/notes.txt.', 'I added the note to log.txt.', 'Created a.txt with the content.', 'I made a file named a.txt.']) assert.deepEqual(tools(text), ['file_write'], text);
  for (const text of ['I deleted the file.', 'I removed old.txt.']) assert.deepEqual(tools(text), ['shell_run'], text);
  for (const text of ['I ran `ls` and it listed 3 files.', "I've run the tests and they pass.", 'Ran the command successfully.']) assert.deepEqual(tools(text), ['shell_run'], text);
  for (const text of ['I looked at the web page and it says X.', 'I checked the website.', 'I opened the page.']) assert.deepEqual(tools(text), ['web_fetch'], text);
  assert.deepEqual(tools('I ran into a problem and ran out of time.'), []);
});

test('negated claims are ignored, but a hedge does not cancel a claim in another clause', () => {
  const none: Array<{ name: string; status: string }> = [];
  for (const text of ['No file was created.', 'Nothing was written.', "I haven't saved the file.", 'The file was not created.']) assert.deepEqual(checkAnswer(text, none), [], text);
  assert.equal(checkAnswer("I couldn't read the page, but I saved notes.txt.", none)[0].tool, 'file_write');
  assert.equal(checkAnswer('I have created the file, though you should review it.', none).length, 1);
});

test('a file write alone cannot support a deletion claim', () => {
  assert.deepEqual(checkAnswer('I deleted old.txt.', [{ name: 'shell_run', status: 'succeeded' }]), []);
  assert.equal(checkAnswer('I deleted old.txt.', [{ name: 'shell_run', status: 'failed' }]).length, 1);
  assert.equal(checkAnswer('I deleted old.txt.', [{ name: 'file_write', status: 'succeeded' }]).length, 1);
});
