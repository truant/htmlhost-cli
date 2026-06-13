export interface ParsedArgs {
  positional: string[];
  options: { site?: string; project?: string };
}

const VALUE_OPTIONS = ['site', 'project'] as const;

export function parseArgs(args: string[]): ParsedArgs {
  const positional: string[] = [];
  const options: ParsedArgs['options'] = {};
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const flag = VALUE_OPTIONS.find((name) => arg === `--${name}` || arg.startsWith(`--${name}=`));
    if (flag) {
      if (arg === `--${flag}`) {
        const value = args[index + 1];
        if (!value) throw new Error(`Missing value for --${flag}`);
        options[flag] = value;
        index += 1;
      } else {
        options[flag] = arg.slice(`--${flag}=`.length);
      }
      continue;
    }
    if (arg.startsWith('--')) throw new Error(`Unknown option: ${arg}`);
    positional.push(arg);
  }
  return { positional, options };
}
