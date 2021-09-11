import assert from 'assert';
import { describe } from 'mocha';
import { Profile } from '../src/classes/Profile';
import { IPerformanceEnty } from '../src/interfaces';
import { perf6 } from '../src/perf6';
import sleep from './common/sleep';

describe('decorator', () => {
    describe('should work on sync methods', () => {
        let a: number;
        let b: number;
        let entries: IPerformanceEnty[];

        before(() => {
            class Test {
                private div = 2;
                @Profile
                fn(a: number) { return a / this.div; }
            }

            a = new Test().fn(2);
            b = new Test().fn(4);

            entries = perf6.popEntries();
        });

        it('should have Test.fn name', () => assert.equal(entries[0].name, 'Test.fn'));
        it('should have 2 entries', () => assert.equal(entries.length, 2));
        it('should a = 1', () => assert.equal(a, 1));
        it('should b = 2', () => assert.equal(b, 2));
    });
    describe('should work on async methods', async () => {
        let a: number;
        let b: number;
        let entries: IPerformanceEnty[];

        before(async () => {
            class Test {
                private div = 2;
                @Profile
                async fn(a: number) { await sleep(60); return a / this.div; }
            }

            a = await new Test().fn(2);
            b = await new Test().fn(4);
            entries = perf6.popEntries();
        });


        it('should have Test.fn name', () => assert.equal(entries[0].name, 'Test.fn'));
        it('should have duration >= 50', () => assert(entries[0].durationMs >= 50));
        it('should have 2 entries', () => assert.equal(entries.length, 2));
        it('should a = 1', () => assert.equal(a, 1));
        it('should b = 2', () => assert.equal(b, 2));
    });
    describe('should work on classes', () => {
        let a: number;
        let b: number;
        let c: number;
        let entries: IPerformanceEnty[];

        @Profile
        class Test {
            private div = 1;
            constructor() { this.div = 2 }
            fnSync(a: number) { return a / this.div; }
            async fn(a: number) { await sleep(60); return a / this.div; }
        }

        before(async () => {
            a = new Test().fnSync(4);
            b = await new Test().fn(2);
            c = await new Test().fn(4);
            entries = perf6.popEntries();
        })

        it('should have Test.fnSync name', () => assert.equal(entries[0].name, 'Test.fnSync'));
        it('should have Test.fn name', () => assert.equal(entries[1].name, 'Test.fn'));
        it('should have Test.fn name', () => assert.equal(entries[2].name, 'Test.fn'));
        it('should have duration < 50', () => assert(entries[0].durationMs < 50));
        it('should have duration >= 50', () => assert(entries[1].durationMs >= 50));
        it('should have duration >= 50', () => assert(entries[2].durationMs >= 50));
        it('should have 2 entries', () => assert.equal(entries.length, 3));
        it('should a = 2', () => assert.equal(a, 2));
        it('should b = 1', () => assert.equal(b, 1));
        it('should c = 2', () => assert.equal(c, 2));
    });
});