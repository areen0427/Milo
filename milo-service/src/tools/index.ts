// The reviewed built-in tool set. Add a tool by defining it beside these and registering it here,
// with tests under milo-service/test/.
import { registerTool, listTools } from './registry.ts';
import { fileList, fileRead, fileWrite } from './files.ts';
import { webFetch } from './web.ts';
import { shellRun } from './shell.ts';
import { memoryAdd, memorySearch } from './memoryTools.ts';
import { skillList, skillRead } from './skills.ts';

export function registerBuiltinTools(): void {
  if (listTools().length) return;
  for (const tool of [fileRead, fileList, fileWrite, webFetch, shellRun, memoryAdd, memorySearch, skillList, skillRead]) registerTool(tool);
}
