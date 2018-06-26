import VDOM from './vdom';
//import { h } from 'virtual-dom';

const createVDom = (...args) => {
  let vdom = new VDOM();
  let node = args[0];
  let children = args[1];

  if (node.attributes.length > 0) {
    for (let attr of node.attributes) {
      vdom.props[attr.name] = attr.value;
    }
  } else {
    vdom.props = node.props || {};
  }

  vdom.type = node.nodeName || node.localName;

  /*
    Node.ELEMENT_NODE	1	An Element node such as <p> or <div>.
    Node.TEXT_NODE	3	The actual Text of Element or Attr.
    Node.PROCESSING_INSTRUCTION_NODE	7	
    A ProcessingInstruction of an XML document such as <?xml-stylesheet ... ?> declaration.
    Node.COMMENT_NODE	8	A Comment node.
    Node.DOCUMENT_NODE	9	A Document node.
    Node.DOCUMENT_TYPE_NODE	10	A DocumentType node e.g. <!DOCTYPE html> for HTML5 documents.
    Node.DOCUMENT_FRAGMENT_NODE	11	A DocumentFragment node.
  */

  //list out all childnodes
  if (children && children.length > 0) {
    vdom.children = children;
  } else if (node.hasChildNodes()) {
    let nodes = node.childNodes;
    for (let cnode of nodes) {
      if (cnode.nodeType === 3) {
        if (cnode.nodeValue.trim()) vdom.children.push(cnode.nodeValue);
      } else if (cnode.nodeType === 1) {
        let cnodeVDOM = createVDom(cnode);
        //vdom.children.push(h(cnodeVDOM.type, cnodeVDOM.props, [...cnodeVDOM.children]));
        vdom.children.push(cnodeVDOM);
      }
    }
  };
  //vdom.props.children = vdom.children;
  return vdom;
}

export default createVDom;