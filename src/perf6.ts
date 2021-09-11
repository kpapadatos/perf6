import { IPerf6Options, IPerformanceEnty } from './interfaces';

class Perf6 {
    private options = {} as IPerf6Options;
    private isCollecting = false;
    private store = [] as IPerformanceEnty[];
    public addEntry(entry: IPerformanceEnty) {
        if (this.isCollecting) {
            this.store.push(entry);
        }
    }
    public popEntries() {
        return this.store.splice(0);
    }
    public start(options?: IPerf6Options) {
        this.isCollecting = true;

        if (options) {
            Object.assign(this.options, options);
        }
    }
    public stop() {
        this.isCollecting = false;
    }
}

export const perf6 = new Perf6();
export * from './classes/Profile';
export * from './interfaces';
