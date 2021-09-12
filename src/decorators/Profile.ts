import { timerify } from '../perf6';

export function Profile(
    constructor: any,
    methodName?: string,
    descriptor?: PropertyDescriptor
) {
    let wrapped: any;

    if (descriptor === undefined) {
        wrapped = wrapClass(constructor);
    } else {
        wrapped = wrapMethod(constructor, methodName as string, descriptor);
    }

    return wrapped;
};

function wrapClass(constructor: any) {
    const className = constructor.name;

    // Wrap instance members
    timerifyObject(className, constructor.prototype);

    // Wrap constructor
    const wrapped = timerifyConstructor(constructor);

    // Wrap static members
    timerifyObject(className, constructor, wrapped);

    return wrapped;
}

function wrapMethod(
    constructor: any,
    methodName: string,
    descriptor: PropertyDescriptor
) {
    const className = constructor.constructor.name;
    timerifyDescriptor(descriptor, `${className}.${methodName}`)
    return descriptor;
}

function timerifyConstructor(constructor: any) {
    return timerify((...args: any[]) => new constructor(args), `${constructor.name}.constructor`);
}

function timerifyObject(name: string, sourceObj: Object, targetObj = sourceObj) {
    for (const propertyName of Object.getOwnPropertyNames(sourceObj)) {
        const descriptor = Object.getOwnPropertyDescriptor(sourceObj, propertyName)!;
        timerifyDescriptor(descriptor, `${name}.${propertyName}`)
        Object.defineProperty(targetObj, propertyName, descriptor);
    }
}

function timerifyDescriptor(descriptor: PropertyDescriptor, propertyName: string) {
    if (typeof descriptor.value === 'function') {
        descriptor.value = timerify(descriptor.value, propertyName);
    }

    if (descriptor.get) {
        descriptor.get = timerify(descriptor.get, `${propertyName}.get`);
    }

    if (descriptor.set) {
        descriptor.set = timerify(descriptor.set, `${propertyName}.set`);
    }
}