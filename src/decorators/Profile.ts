import { timerify } from '../perf6';

type Newable = any;

export function Profile(
    Class: Newable,
    methodName?: string,
    descriptor?: PropertyDescriptor
) {
    let wrapped: any;

    if (descriptor === undefined) {
        wrapped = wrapClass(Class);
    } else {
        wrapped = wrapMethodOrAccessor(Class, methodName as string, descriptor);
    }

    return wrapped;
};

function wrapClass(Class: Newable) {
    // Wrap instance members
    timerifyObject(Class.name, Class.prototype);

    // Wrap constructor
    const wrapped = timerifyConstructor(Class);

    // Wrap static members
    timerifyObject(Class.name, Class, wrapped);

    return wrapped;
}

function wrapMethodOrAccessor(
    Class: Newable,
    methodName: string,
    descriptor: PropertyDescriptor
) {
    const className = Class.constructor.name;
    timerifyDescriptor(descriptor, `${className}.${methodName}`)
    return descriptor;
}

function timerifyConstructor(Class: Newable) {
    return timerify((...args: any) => new Class(args), `${Class.name}.constructor`);
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