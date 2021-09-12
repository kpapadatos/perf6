import { IPerformanceEnty } from '../interfaces';

export class Session {
    public end?: number;
    private store: IPerformanceEnty[] = [];
    constructor(public start: number) { }
    public addEntry(entry: IPerformanceEnty) {
        this.store.push(entry);
    }
    public getEntries() {
        return this.store;
    }
}