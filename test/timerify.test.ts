import assert from 'assert';
import { IPerformanceEnty, perf6, timerify } from '../src/perf6';
import sleep from './common/sleep';

describe('timerify', () => {
    let a: number;
    let b: number;
    let entries: IPerformanceEnty[];

    function fnSync(a: number) { return a / 2; }
    async function fn(a: number) { await sleep(60); return a / 2; }

    const fnSyncWrapped = timerify(fnSync);
    const fnWrapped = timerify(fn);

    before(async () => {
        const session = perf6.start();
        a = fnSyncWrapped(2);
        b = await fnWrapped(4);
        entries = session.getEntries();
        perf6.stop();
    });

    it('should have fnSync name', () => assert.equal(entries[0].name, 'fnSync'));
    it('should have fn name', () => assert.equal(entries[1].name, 'fn'));
    it('should have duration < 50', () => assert(entries[0].durationMs < 50));
    it('should have duration >= 50', () => assert(entries[1].durationMs >= 50));
    it('should have 2 entries', () => assert.equal(entries.length, 2));
    it('should a = 1', () => assert.equal(a, 1));
    it('should b = 2', () => assert.equal(b, 2));
});