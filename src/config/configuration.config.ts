import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';

const YAML_CONFIG_FILENAME: string = 'configuration.yml';

const getConfigFileName = (): string => process.env.KASHIWA_CONFIGURATION_FILE ?? YAML_CONFIG_FILENAME;

const applicationConfig = () => {
  const configFileName = getConfigFileName();
  return yaml.load(readFileSync(join(process.cwd(), configFileName), 'utf8')) as Record<string, unknown>;
};

export default applicationConfig;
