import { SessionPage } from '@admin/pages';
import { ISession } from '@admin/interfaces';
import * as os from 'node:os';

/**
 * Admin dashboard panel page
 */
export class DashboardPage extends SessionPage {
  engineVersion: string;

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

  pgDumpVersion: string;

  imageMagickVersion: string;

  zipVersion: string;

  dependencies: Record<string, string>;

  devDependencies: Record<string, string>;

  constructor(
    engineVersion: string,
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
    pgDumpVersion: string,
    imageMagickVersion: string,
    zipVersion: string,
    dependencies: Record<string, string>,
    devDependencies: Record<string, string>
  ) {
    super(session);
    this.engineVersion = engineVersion;
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
    this.pgDumpVersion = pgDumpVersion;
    this.imageMagickVersion = imageMagickVersion;
    this.zipVersion = zipVersion;
    this.dependencies = dependencies;
    this.devDependencies = devDependencies;
  }
}
