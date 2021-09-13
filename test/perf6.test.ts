import assert from 'assert';
import { existsSync, unlinkSync } from 'fs';
import { resolve } from 'path';
import { perf6 } from '../src/perf6';

describe('perf6', () => {
    it('should error when start() and already started', () => {
        let errored = false;

        perf6.start();

        try {
            perf6.start();
        } catch {
            errored = true;
        }

        assert(errored);

        perf6.stop();
    });
    it('should error when stop() and already stopped', () => {
        let errored = false;

        try {
            perf6.stop();
        } catch {
            errored = true;
        }

        assert(errored);
    });
    it('should ignore addEntry() when not collecting', () => {
        const session = perf6.start();
        perf6.stop();
        assert.equal(session.getEntries().length, 0);
        perf6.addEntry({ durationMs: 0, errored: false, name: '', startTime: 0 });
        assert.equal(session.getEntries().length, 0);
    });
    it('should generate html without throwing', async () => {
        const session = perf6.start();
        perf6.addEntry({ durationMs: 0, errored: false, name: '', startTime: 0 });
        assert.equal(session.getEntries().length, 1);
        perf6.stop();
        const htmlFileDir = resolve(__dirname, '..')
        const htmlFilePath = resolve(htmlFileDir, 'perf6.html');
        await perf6.generateHtmlReport(htmlFileDir);
        assert(existsSync(htmlFilePath));
        unlinkSync(htmlFilePath);
    });
});