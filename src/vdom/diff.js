//regex
let forRegex = /^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+track\s+by\s+([\s\S]+?))?\s*$/,
    isExpression = /{{(.+?)}}/g,
    isEvent = /^on(Click|Submit)/,
    isFuncWithArgs = /\(\s*([^)]+?)\s*\)/,
    getFuncName = /^\s*[A-Za-z][A-Za-z0-9_]*([^\(]*)/i;


//get
function get(obj, path, defaultValue) {
    let patharr = path.trim().split('.');
    let value;
    let k;
    for (let i of patharr) {
        k = k ? k[i] : obj[i];
        if (k && typeof k !== 'object') {
            value = k;
            return value;
        }
    }
    if (typeof value === 'undefined') {
        if (typeof defaultValue !== 'undefined')
            value = defaultValue
        else
            value = '';
    }
    return value;
}

//Props
function setProp(context, $target, name, value) {
    if (isCustomProp(name)) {
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
    if ($target.isLiteComponent) {
        for (let prop of $target.attributes) {
            $target.props[prop.name] = get(context, prop.value);
        }
    } else {
        Object.keys(props).forEach(name => {
            setProp(context, $target, name, props[name]);
        });
    }
}

function isCustomProp(name) {
    return isEventProp(name) || name === 'forceUpdate';
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
        for (let prop of $target.attributes) {
            $target.props[prop.name] = get(context, prop.value);
        }
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
    if (typeof node === 'string') {
        return document.createTextNode(node);
    }
    const $el = document.createElement(node.type);
    setProps(context, $el, node.props);
    addEventListeners(context, $el, node.props);
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