import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import * as readline from 'readline';

const CONFIG_DIR = join(homedir(), '.biblia');
const CONFIG_FILE = join(CONFIG_DIR, 'config');

interface Configuration {
  [key: string]: string;
}

export function getConfigurationPath(): string {
  return CONFIG_FILE;
}

export function ensureConfigurationDir(): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

export function readConfiguration(): Configuration {
  ensureConfigurationDir();

  if (!existsSync(CONFIG_FILE)) {
    return {};
  }

  const content = readFileSync(CONFIG_FILE, 'utf8');
  const configuration: Configuration = {};

  content.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        configuration[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  return configuration;
}

export function writeConfiguration(configuration: Configuration): void {
  ensureConfigurationDir();

  const lines = Object.entries(configuration).map(([key, value]) => `${key}=${value}`);
  writeFileSync(CONFIG_FILE, lines.join('\n') + '\n', 'utf8');
}

export function getConfigurationValue(key: string): string | undefined {
  const configuration = readConfiguration();
  return configuration[key];
}

export function setConfigurationValue(key: string, value: string): void {
  const configuration = readConfiguration();
  configuration[key] = value;
  writeConfiguration(configuration);
}

function prompt(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

export async function interactiveConfigure(): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const configuration = readConfiguration();
  const configKeys = ['api_key', 'default_bible_id'];

  console.log('Interactive Configuration');
  console.log('========================\n');
  console.log('Press Enter to keep current value or type new value.\n');

  for (const key of configKeys) {
    const currentValue = configuration[key];
    const displayValue = currentValue ? currentValue : '(not set)';

    const answer = await prompt(rl, `${key} [${displayValue}]: `);

    if (answer.trim()) {
      configuration[key] = answer.trim();
    }
  }

  rl.close();

  writeConfiguration(configuration);
  console.log('\nConfiguration saved!');
}
