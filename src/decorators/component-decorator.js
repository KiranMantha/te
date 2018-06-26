const Component = (options) => {
    return (target) => {
        window.customElements.define(options.selector, target);
    }
}

export default Component;