import { perf6 } from './perf6';

export function timerify<T extends (...args: any[]) => any>(fn: T, name?: string): T {
    return function (this: any, ...args: Parameters<T>): ReturnType<T> {
        if (!perf6.isCollecting) {
            return fn.apply(this, args);
        }

        const startTime = performance.now();

        const result = fn.apply(this, args);

        if (result instanceof Promise) {
            result.finally(measure);
        } else {
            measure();
        }

        return result;

        function measure() {
            const durationMs = performance.now() - startTime;
            perf6.addEntry({
                durationMs,
                name: name || fn.name,
                errored: false,
                startTime
            });
        }
    } as T;
}