export function resolveAllValues(data, unresolvedKeys) {
    // Init already resolved keys.
    let resolvedKeys = new Set();
    for (const [key, val] of data) {
        if (_isResolved(val)) {
            resolvedKeys.add(key);
        }
    }

    // Resolve other keys.
    while (_resolveStep(data, resolvedKeys));

    // Return the unresolvedKeys
    if (unresolvedKeys != null) {
        for (const [key, val] of data) {
            if (!_isResolved(val)) {
                unresolvedKeys.add(key);
            }
        }
    }
    return data;
}

function _resolveStep(data, resolvedKeys) {
    let changedKey = null;
    let changedValue = null;
    for (const [key, val] of data) {
        if (!(resolvedKeys.has(key))) {
            let newValue = _resolveOneValue(key, val, data, resolvedKeys);
            if (val != newValue) {
                changedKey = key;
                changedValue = newValue;
                // We break here to avoid modifying data while iterating on it.
                break;
            }
        }
    }
    if (changedKey != null) {
        if (_isResolved(changedValue)) {
            resolvedKeys.add(changedKey);
            changedValue = _getResolvedValue(changedValue);
        }
        data.set(changedKey, changedValue);
        return true;
    }
    return false;
}

// Do not modify data, but ok to modify resolvedKeys.
function _resolveOneValue(key, value, data, resolvedKeys) {
    let neededKeys = _extractNeededKeys(value);
    let allResolved = true;
    for (let neededKey of neededKeys) {
        if (resolvedKeys.has(neededKey)) {
            value = value.replace('${' + neededKey + '}', data.get(neededKey));
        } else {
            allResolved = false;
        }
    }
    if (allResolved) {
        value = _getResolvedValue(value);
    }
    return value;
}

function _extractNeededKeys(value) {
    let keys = [];
    for (let i = 0; i + 1 < value.length; ++i) {
        if (value[i] == '$' && value[i + 1] == '{') {
            let j = i + 2;
            while (j < value.length && value[j] != '}') j++;
            keys.push(value.slice(i + 2, j));
            i = j;
        }
    }
    return keys;
}

function _getResolvedValue(value) {
    if (value.startsWith('$vareq ')) {
        if (!value.includes('==')) {
            throw '$vareq incorrect syntax: ' + value;
        }
        value = value.slice('$vareq '.length);
        let j = value.indexOf('==');
        let val1 = value.slice(0, j).trim();
        let val2 = value.slice(j + 2).trim();
        return val1 == val2 ? 'true' : 'false';
    } else if (value.startsWith('$varif ')) {
        if (!value.includes('??')) {
            throw '$varif incorrect syntax: ' + value;
        }
        value = value.slice('$varif '.length);
        let j = value.indexOf('??');
        let val1 = value.slice(0, j).trim();
        value = value.slice(j + 2).trim();
        if (!value.includes('::')) {
            throw '$varif incorrect syntax (missing colon): ' + value;
        }
        let k = value.indexOf('::');
        let val2 = value.slice(0, k).trim();
        let val3 = value.slice(k + 2).trim();
        return val1 == 'true' ? val2 : val3;
    }

    return value;
}

function _isResolved(value) {
    return !value.includes('${') && !value.startsWith('$vareq ') && !value.startsWith('$varif ');
}
