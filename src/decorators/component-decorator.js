const Component = (options) => {
    return (target) => {
        window.customElements.define(options.selector, target);
    }
}

const readonly = (target, key, descriptor) => {
    descriptor.writable = false;
    return descriptor;
}

export { Component, readonly };