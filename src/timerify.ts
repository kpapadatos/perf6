import { perf6 } from './perf6';

type AnyFunction = (...args: any) => any;
type AnyFunctionArgs = any;

export function timerify<T extends AnyFunction>(fn: T, fnName?: string): T {
    return function (this: Object, ...args: Parameters<T>): ReturnType<T> {
        return invoke(fn, this, args, fnName || fn.name);
    } as T;
}

function invoke(fn: AnyFunction, instance: Object, args: AnyFunctionArgs, fnName: string) {
    if (perf6.isCollecting) {
        return time(fn, instance, args, fnName);
    } else {
        return fn.apply(instance, args);
    }
}

function time(fn: AnyFunction, instance: Object, args: AnyFunctionArgs, fnName: string) {
    const startTime = performance.now();

    const result = fn.apply(instance, args);

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
            name: fnName,
            errored: false,
            startTime
        });
    }
}