import get from '../get';
import registry from '../registry';

//regex
let forRegex = /^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+track\s+by\s+([\s\S]+?))?\s*$/,
    isExpression = /{{(.+?)}}/g,
    isEvent = /^on(Click|Submit|Input|Change)/,
    isFuncWithArgs = /\(\s*([^)]+?)\s*\)/,
    getFuncName = /^\s*[A-Za-z][A-Za-z0-9_]*([^\(]*)/i;


//Props
function setProp($target, name, value) {
    if($target.props) {
        $target.props[name] = value;
    } else if (isCustomProp(name)) {
        return;
    } else if (typeof value === 'boolean') {
        setBooleanProp($target, name, value);
    } else {
        $target.setAttribute(name, value);
    }
}

function setBooleanProp($target, name, value) {
    if (value) {
        $target.setAttribute(name, value);
        $target[name] = true;
    } else {
        $target[name] = false;
    }
}

function removeBooleanProp($target, name) {
    $target.removeAttribute(name);
    $target[name] = false;
}

function removeProp($target, name, value) {
    if (isCustomProp(name)) {
        return;
    } else if (typeof value === 'boolean') {
        removeBooleanProp($target, name);
    } else {
        $target.removeAttribute(name);
    }
}

function setProps(context, $target, props) {
    let len = $target.localName.split('-').length;
    if (len > 1) {
        $target.props = {};
        $target.attrs = props;
    }
    Object.keys(props).forEach(name => {
        let value;
        if ($target.props) {
            value = get(context, props[name]);
        } else {
            value = props[name];
        }
        setProp($target, name, value);
    });

}

function isCustomProp(name) {
    return isEventProp(name) || name === 'forceUpdate';
}

function getContextProps(context, props) {
    let $props = {};
    for (let prop in props) {
        $props[prop] = get(context, arr[prop]);
    }
    return $props;
}

function updateProp(context, $target, name, newVal, oldVal) {
    if (!newVal) {
        removeProp($target, name, oldVal);
    } else if (!oldVal || newVal !== oldVal) {
        setProp(context, $target, name, newVal);
    }
}

function updateProps(context, $target, newProps, oldProps = {}) {
    if ($target.isLiteComponent) {
        let props = {};
        let arr = $target.attrs;
        for (let prop in arr) {
            props[prop] = get(context, arr[prop]);
        }
        $target.setProps(props);
    } else {
        const props = Object.assign({}, newProps, oldProps);
        Object.keys(props).forEach(name => {
            updateProp(context, $target, name, newProps[name], oldProps[name]);
        });
    }
}

//Events
var events = {
    'onClick': 'click',
    'onSubmit': 'submit'
}
function isEventProp(name) {
    return /^on/.test(name);
}

function extractEventName(name) {
    return name.slice(2).toLowerCase();
}

function addEventListeners(context, $target, props) {
    let match;
    let match1;
    for (let prop in props) {
        if (match = isEvent.exec(prop)) {
            let prop_value = props[prop];
            if (match1 = isFuncWithArgs.exec(prop_value)) {
                let args = match1[1].split(',');
                let values = [];
                for (let item of args) {
                    values.push(get(context, item));
                }
                let funcName = getFuncName.exec(value)[0];
                node.addEventListener(events[match[0]], get(context, funcName).bind(context, ...values), false);
            } else {
                $target.addEventListener(events[match[0]], get(context, prop_value).bind(context), false);
            }
            $target.eventsBinded = true;
        }
    };
}

//DOM check
function createElement(context, node) {
    let $el;
    let $comp = registry.getComponent(node.type);
    if (typeof node === 'string') {
        return document.createTextNode(node);
    }
    if(!$comp) {
        $el = document.createElement(node.type);
        setProps(context, $el, node.props);
        addEventListeners(context, $el, node.props);
    } else {
        let $props = getContextProps(context, node.props);
        $el = new $comp($props);
    }
    
    node.children
        .map(x => createElement(context, x))
        .forEach($el.appendChild.bind($el));
    return $el;
}

function changed(node1, node2) {
    return typeof node1 !== typeof node2 ||
        typeof node1 === 'string' && node1 !== node2 ||
        node1.type !== node2.type ||
        (node1.props && node1.props.forceUpdate);
}

function updateElement(context, $parent, newNode, oldNode, index = 0) {
    if (!oldNode) {
        $parent.appendChild(
            createElement(context, newNode)
        );
    } else if (!newNode) {
        $parent.removeChild(
            $parent.childNodes[index]
        );
    } else if (changed(newNode, oldNode)) {
        $parent.replaceChild(
            createElement(context, newNode),
            $parent.childNodes[index]
        );
    } else if (newNode.type) {
        updateProps(
            context,
            $parent.childNodes[index],
            newNode.props,
            oldNode.props
        );
        const newLength = newNode.children.length;
        const oldLength = oldNode.children.length;
        for (let i = 0; i < newLength || i < oldLength; i++) {
            updateElement(
                context,
                $parent.childNodes[index],
                newNode.children[i],
                oldNode.children[i],
                i
            );
        }
    }
}

export { createElement, changed, updateElement, h };