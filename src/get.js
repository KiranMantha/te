const get = (obj, path, defaultValue) => {
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

export default get;