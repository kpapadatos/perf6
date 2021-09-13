import assert from 'assert';
import { describe } from 'mocha';
import { resolve } from 'path';
import { IPerformanceEnty } from '../src/interfaces';
import { perf6, Profile } from '../src/perf6';
import sleep from './common/sleep';

describe('decorator', () => {
    describe('should work on sync methods', () => {
        let a: number;
        let b: number;
        let entries: IPerformanceEnty[];

        before(() => {
            const session = perf6.start();

            class Test {
                private div = 2;
                @Profile
                fn(a: number) { return a / this.div; }
            }

            a = new Test().fn(2);
            b = new Test().fn(4);

            entries = session.getEntries();
            perf6.stop();
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
            const session = perf6.start();

            class Test {
                private div = 2;
                @Profile
                async fn(a: number) { await sleep(60); return a / this.div; }
            }

            a = await new Test().fn(2);
            b = await new Test().fn(4);

            entries = session.getEntries();
            perf6.stop();
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
        let d: number;
        let entries: IPerformanceEnty[];
        let instance: Test;

        @Profile
        class Test {
            public static _pubas: number;
            public static _privas: number;
            public static get pubag() { return 1; }
            public static set pubas(val: number) { Test._pubas = val; }
            private static set privas(val: number) { Test._privas = val; }
            private static get privag() { return 1; }
            public static pubp = 1;
            private static privp = 1;
            public static pubm() { return 1 / Test.privp; };
            private static privm() { return 1; };
            constructor() { this.div = 2 }
            public get pubg() { return this.div; }
            public set pubs(val: number) { this._pubs = val; }
            public _privs?: number;
            public _pubs?: number;
            private div = 1;
            private get privg() { return this.div; }
            private set privs(val: number) { this._privs = val; }
            fnSync(a: number) { return a / this.div; }
            async fn(a: number) { await sleep(60); return a / this.div; }
        }

        before(async () => {
            const session = perf6.start();
            instance = new Test();

            a = instance.fnSync(4);
            b = await instance.fn(2);
            c = await instance.fn(4);
            d = Test.pubm();

            Test.pubas = 2;
            Test['privas'] = 2;

            // Invoke getters
            instance.pubg;
            instance['privg'];

            instance.pubs = 2;
            instance['privs'] = 2;

            entries = session.getEntries();

            perf6.stop();
        });

        it('should have Test.constructor name', () => assert.equal(entries[0].name, 'Test.constructor'));
        it('should have Test.fnSync name', () => assert.equal(entries[1].name, 'Test.fnSync'));
        it('should have Test.fn name', () => assert.equal(entries[2].name, 'Test.fn'));
        it('should have Test.fn name', () => assert.equal(entries[3].name, 'Test.fn'));
        it('should have duration < 50', () => assert(entries[0].durationMs < 50));
        it('should have duration < 50', () => assert(entries[1].durationMs < 50));
        it('should have duration >= 50', () => assert(entries[2].durationMs >= 50));
        it('should have duration >= 50', () => assert(entries[3].durationMs >= 50));
        it('should have 11 entries', () => assert.equal(entries.length, 11));
        it('should a = 2', () => assert.equal(a, 2));
        it('should b = 1', () => assert.equal(b, 1));
        it('should c = 2', () => assert.equal(c, 2));
        it('should d = 1', () => assert.equal(d, 1));
        it('should preserve public static properties', () => assert.equal(Test.pubp, 1));
        it('should preserve private static properties', () => assert.equal(Test['privp'], 1));
        it('should preserve public static methods', () => assert.equal(Test.pubm(), 1));
        it('should preserve private static methods', () => assert.equal(Test['privm'](), 1));
        it('should preserve public static getters', () => assert.equal(Test.pubag, 1));
        it('should preserve private static getters', () => assert.equal(Test['privag'], 1));
        it('should preserve public static setters', () => assert.equal(Test._pubas, 2));
        it('should preserve private static setters', () => assert.equal(Test._privas, 2));
        it('should preserve public getters', () => assert.equal(instance.pubg, instance['div']));
        it('should preserve private getters', () => assert.equal(instance['privg'], instance['div']));
        it('should preserve public setters', () => assert.equal(instance._pubs, 2));
        it('should preserve private setters', () => assert.equal(instance._privs, 2));
    });
    describe('should work on instance accessors', () => {
        let a: number;
        let b: number;
        let c: number;
        let d: number;
        let entries: IPerformanceEnty[];
        let instance: Test;

        class Test {
            @Profile
            public get pubg() { return this.div; }
            @Profile
            public set pubs(val: number) { this._pubs = val; }
            public _privs?: number;
            public _pubs?: number;
            private div = 1;
            @Profile
            private get privg() { return this.div; }
            @Profile
            private set privs(val: number) { this._privs = val; }
        }

        before(async () => {
            const session = perf6.start();
            instance = new Test();

            // Invoke getters
            instance.pubg;
            instance['privg'];

            instance.pubs = 2;
            instance['privs'] = 2;

            entries = session.getEntries();
            perf6.stop();
        });

        it('should preserve public getters', () => assert.equal(instance.pubg, instance['div']));
        it('should preserve private getters', () => assert.equal(instance['privg'], instance['div']));
        it('should preserve public setters', () => assert.equal(instance._pubs, 2));
        it('should preserve private setters', () => assert.equal(instance._privs, 2));
    });
});