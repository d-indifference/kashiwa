import { SessionPage } from '@admin/pages';
import { ISession } from '@admin/interfaces';
import * as os from 'node:os';

/**
 * Admin dashboard panel page
 */
export class DashboardPage extends SessionPage {
  totalBoards: number;

  totalComments: number;

  diskSpaceUsed: number;

  uptime: number;

  cpus: os.CpuInfo[];

  memory: {
    total: number;
    inUsage: number;
    free: number;
  };

  port: number | undefined;

  debugPort: number;

  host: string;

  processVersions: Record<string, string | undefined>;

  postgresVersion: string;

  imageMagickVersion: string;

  dependencies: Record<string, string>;

  devDependencies: Record<string, string>;

  constructor(
    session: ISession,
    totalBoards: number,
    totalComments: number,
    diskSpaceUsed: number,
    uptime: number,
    cpus: os.CpuInfo[],
    memory: {
      total: number;
      free: number;
    },
    port: number | undefined,
    debugPort: number,
    host: string,
    processVersions: Record<string, string | undefined>,
    postgresVersion: string,
    imageMagickVersion: string,
    dependencies: Record<string, string>,
    devDependencies: Record<string, string>
  ) {
    super(session);
    this.totalBoards = totalBoards;
    this.totalComments = totalComments;
    this.diskSpaceUsed = diskSpaceUsed;
    this.uptime = uptime;
    this.cpus = cpus;
    this.memory = { total: memory.total, free: memory.free, inUsage: memory.total - memory.free };
    this.port = port;
    this.debugPort = debugPort;
    this.host = host;
    this.processVersions = processVersions;
    this.postgresVersion = postgresVersion;
    this.imageMagickVersion = imageMagickVersion;
    this.dependencies = dependencies;
    this.devDependencies = devDependencies;
  }
}
