var createElement = require('virtual-dom/create-element');
import { patch, diff, h } from 'virtual-dom';
import createVDom from './toVdom';

function getVDom(template) {
  let node = (new DOMParser()).parseFromString(template, 'application/xml').children[0];
  return node;
}

export default class LiteteComponent extends HTMLElement {
    template;
    constructor() {
        super();
        this._initTree = this._root = this._newTree = null;
    }

    setState(o, cb) {
        if(typeof o === 'object') {
            this.state = Object.assign({}, this.state, o);
        } else if(typeof o === 'function') {
            let _o = o(this.state);
            this.state = Object.assign({}, this.state, _o);
        }
        this._updateListener();
        if(cb) cb();
    }

    _updateListener() {
        this._newTree = this._render();
        let patches = diff(this._initTree, this._newTree);
        this._root = patch(this._root, patches);
        this._initTree = this._newTree;
    }

    _render() {
        let template = this.render();
        let node = getVDom(template);
        let vdom = createVDom(node);
        console.log(vdom);
        console.log(this.state);
        return h(vdom.type, vdom.props, [...vdom.children]);
    }

    //Fires when custom component loaded in DOM
    connectedCallback() {
        if (this.render) {
            this._initTree = this._render();
            this._root = createElement(this._initTree);
            this.appendChild(this._root);
        }
    }

    //Fires whenever an attribute is added, removed or updated
    attributeChangedCallback(attrName, oldVal, newVal) {

    }

    //Fires when custom component is unloaded from DOM
    disconnectedCallback() {
        if (this.unmount) {
            this.unmount();
        }
    }
}