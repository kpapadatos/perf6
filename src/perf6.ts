import { IPerformanceEnty } from './interfaces';

class Perf6 {
    private store = [] as IPerformanceEnty[];
    public addEntry(entry: IPerformanceEnty) {
        this.store.push(entry);
    }
    public popEntries() {
        return this.store.splice(0);
    }
}

export const perf6 = new Perf6();
export * from './classes/Profile';
export * from './interfaces';
