import { performance } from 'perf_hooks';
import { Session } from './classes/Session';
import { IPerf6Options, IPerformanceEnty } from './interfaces';
import { promises as fs, writeFileSync } from 'fs';
import { resolve } from 'path';

class Perf6 {
    public isCollecting = false;
    private options = {} as IPerf6Options;
    private session = new Session(0);
    public addEntry(entry: IPerformanceEnty) {
        if (this.isCollecting) {
            this.session.addEntry(entry);
        }
    }
    public start(options?: IPerf6Options) {
        if (!this.isCollecting) {
            this.isCollecting = true;
            this.session = new Session(performance.now());

            Object.assign(this.options, options);

            return this.session;
        } else {
            throw new Error('start() was called but collection had already started.')
        }
    }
    public stop() {
        if (this.isCollecting) {
            this.isCollecting = false;
            this.session.end = performance.now();
        } else {
            throw new Error('stop() was called but collection was already stopped.');
        }
    }
    public async generateHtmlReport(dir: string) {
        const index = {} as {
            [fnName: string]: {
                count: number;
                totalDurationMs: number;
            }
        }

        for (const entry of this.session.getEntries()) {
            const indexEntry = index[entry.name] || (index[entry.name] = { count: 0, totalDurationMs: 0 });

            indexEntry.count++;
            indexEntry.totalDurationMs += entry.durationMs;
        }

        await fs.writeFile(resolve(dir, 'perf6.html'), `
            <html>
                <head>
                </head>
                <body>
${Object.entries(index).map(([fnName, info]) => `<div><b>${fnName}:</b> ${JSON.stringify(info)}</div>`).join('\n')}
                </body>
            </html>
        `);
    }
}

export const perf6 = new Perf6();
export * from './decorators/Profile';
export * from './classes/Session';
export * from './timerify';
export * from './interfaces';
