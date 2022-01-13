// patch
function createElement(tag, props, children) {
    return {
        tag,
        props,
        children,
    };
}
const h = createElement;

function mount(vdom, container) {
    const el = vdom.el = document.createElement(vdom.tag);
    // props
    if (vdom.props) {
        for (let prop in vdom.props) {
            // ignore eventListeners
            if (prop.startsWith('on')) {
                el.addEventListener(prop.slice(2).toLowerCase(), vdom.props[prop]);
            } else {
                el.setAttribute(prop, vdom.props[prop]);
            }
        }
    }
    // children
    const children = vdom.children;
    if (typeof children === 'string') {
        el.innerText = children;
    } else if (Array.isArray(children)) {
        children.forEach(child => {
            mount(child, el);
        });
    }
    container.appendChild(el);
}

function patch(vDom1, vDom2) {
    let el = vDom2.el = vDom1.el;
    if (vDom1.tag === vDom2.tag) {
        // props changed
        // 1. update
        // 2. remove
        for (let newProp in vDom2.props) {
            el.setAttribute(newProp, vDom2.props[newProp]);
        }
        for (let oldProp in vDom1.props) {
            if (!oldProp in vDom2.props) {
                el.removeAttribute(oldProp);
            }
        }
        // children changed
        // branch1: children is array
        // 1. oldChildren is array, diff
        // 2. oldChildren is text, set textContent empty, mount newChildren
        // branch2: new children is text
        //  set textContent
        if (Array.isArray(vDom2.children)) {
            if (Array.isArray(vDom1.children)) {
                //  1. diff
                //  2. children length not equal, add or remove
                let minLength = Math.min(vDom1.children.length, vDom2.children.length);
                for (let i = 0; i < minLength; i++) {
                    patch(vDom1.children[i], vDom2.children[i]);
                }
                if (vDom2.children.length > vDom1.children.length) {
                    vDom2.children.slice(vDom1.children.length).forEach(vnode => {
                        mount(vnode, el);
                    });
                }
                if (vDom2.children.length < vDom1.children.length) {
                    vDom1.children.slice(vDom2.children.length).forEach(vnode => {
                        el.removeChild(vnode.el);
                    });
                }
            } else {
                el.textContent = '';
                vDom2.children.forEach(vnode => {
                    mount(vnode, el);
                });
            }
        } else {
            if (vDom2.children !== vDom1.children) {
                el.textContent = vDom2.children;
            }
        }
    } else {
        mount(vDom2, document.createElement('div'));
        vDom1.el.replaceWith(vDom2.el);
    }
}

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

function reactive(raw) {
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

function watchEffect(effect) {
    currentTarget = effect;
    effect();
    currentTarget = null;
}

// App
function createApp(component, container) {
    let isMounted = false;
    let prevVDom = null;
    watchEffect(() => {
        if (!isMounted) {
            prevVDom = component.render();
            mount(prevVDom, container);
            isMounted = true;
        } else {
            let currentVDom = component.render();
            patch(prevVDom, currentVDom);
            prevVDom = currentVDom;
        }
    });
}

const component = {
    data: reactive({
        count: 0,
    }),
    render() {
        return h('div', { onClick: () => { this.data.count++; } }, '' + this.data.count);
    }
};
createApp(component, document.getElementById('app'));