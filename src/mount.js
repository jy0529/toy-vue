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
        for(let prop in vdom.props) {
            // ignore eventListeners
            el.setAttribute(prop, vdom.props[prop]);
        }
    }
    // children
    const children = vdom.children;
    if (typeof children === 'string') {
        el.innerText = children;        
    } else if (Array.isArray(children)){
        children.forEach(child => {
            mount(child, el);
        });
    }
    container.appendChild(el);
}

let vDom = h('div', null, [h('span', { class: 'red' }, 'hello vue')]);
mount(vDom, document.getElementById('app'));

function patch(vDom1, vDom2) {
   // ...
}