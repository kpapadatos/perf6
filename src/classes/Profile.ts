import { perf6 } from '../perf6';

export function Profile(
    constructor: any,
    methodName?: string,
    def?: TypedPropertyDescriptor<any>
) {
    if (methodName === undefined) {
        for (const propertyName of Object.getOwnPropertyNames(constructor.prototype)) {
            const value = constructor.prototype[propertyName];

            if (typeof value === 'function') {
                constructor.prototype[propertyName] = function (...args: any[]) {
                    return Profile(constructor, propertyName, { value }).value.apply(this, args);
                }
            }
        }

        return constructor;
    }

    return {
        value(...args: any[]) {
            const startTime = performance.now();

            const className = constructor.name || constructor.constructor.name;

            const result = def?.value.apply(this, args);

            if (result instanceof Promise) {
                result.finally(measure);
            } else {
                measure();
            }

            return result;

            function measure() {
                const durationMs = performance.now() - startTime;
                const name = `${className}.${methodName}`;

                perf6.addEntry({ durationMs, name, errored: false, startTime });
            }
        }
    } as any;
};