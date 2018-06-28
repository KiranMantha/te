import createVDom from './vdom/toVdom';
import { changed, createElement, updateElement } from './vdom/diff';

function getVDom(template) {
  let node = (new DOMParser()).parseFromString(template, 'application/xml').children[0];
  return node;
}

export default class LiteteComponent extends HTMLElement {
    constructor() {
        super();
        this._initTree = this._root = this._newTree = null;
        this.isLiteComponent = true;
        this.props = {};
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

    setProps(o) {
        this.props = Object.assign({}, this.props, o);
        this._updateListener();
    }

    _updateListener() {
        this._newTree = this._render();
        updateElement(this, this, this._newTree, this._initTree);
        this._initTree = this._newTree;
    }

    _render() {
        let template = this.render();
        let node = getVDom(template);
        let vdom = createVDom(node);
        console.log(vdom);
        console.log(this);
        return vdom;
    }

    //Fires when custom component loaded in DOM
    connectedCallback() {
        if (this.render) {
            this._initTree = this._render();
            updateElement(this, this, this._initTree);
        }
    }

    //Fires whenever an attribute is added, removed or updated
    attributeChangedCallback(attrName, oldVal, newVal) {
        this._updateListener();
    }

    //Fires when custom component is unloaded from DOM
    disconnectedCallback() {
        if (this.unmount) {
            this.unmount();
        }
    }
}