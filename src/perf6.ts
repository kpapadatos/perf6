import { performance } from 'perf_hooks';
import { Session } from './classes/Session';
import { IPerf6Options, IPerformanceEnty } from './interfaces';

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
}

export const perf6 = new Perf6();
export * from './decorators/Profile';
export * from './classes/Session';
export * from './timerify';
export * from './interfaces';
