import registry from '../registry';

const Component = (options) => {
    return (target) => {
        registry.registerComponent(options.selector, target);
        window.customElements.define(options.selector, target);
    }
}

const readonly = (target, key, descriptor) => {
    descriptor.writable = false;
    return descriptor;
}

export { Component, readonly };