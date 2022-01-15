
// reactive
let currentTarget = null;

class Dep {
    constructor(value) {
        this.value = value;
        this._subscribers = new Set();
    }

    depend() {
        if (currentTarget !== null) {
            this._subscribers.add(currentTarget);
        }
    }

    notify() {
        for (let subscriber of this._subscribers) {
            subscriber();
        }
    }
}

let targetMap = new WeakMap();

function getDep(target, key) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Dep();
        depsMap.set(key, dep);
    }
    return dep;
}

export function reactive(raw) {
    return new Proxy(raw, {
        get(target, key, receiver) {
            const dep = getDep(target, key);
            dep.depend();
            return Reflect.get(target, key, receiver);
        },
        set(target, key, value, receiver) {
            const dep = getDep(target, key);
            const result = Reflect.set(target, key, value, receiver);
            dep.notify();
            return result;
        }
    })
}

export function watchEffect(effect) {
    currentTarget = effect;
    effect();
    currentTarget = null;
}