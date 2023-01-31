import { stripPrefix, stringToIntOrThrow } from "./utils.js";

export function resolveAllValues(data, unresolvedKeys, allData) {
    // Init already resolved keys.
    let resolvedKeys = new Set();
    for (const [key, val] of data) {
        if (_isResolved(val)) {
            resolvedKeys.add(key);
        }
    }

    // Resolve other keys.
    while (_resolveStep(data, resolvedKeys, allData));

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

function _resolveStep(data, resolvedKeys, allData) {
    let changedKey = null;
    let changedValue = null;
    for (const [key, val] of data) {
        if (!resolvedKeys.has(key)) {
            let newValue = _resolveOneValue(key, val, data, allData, resolvedKeys);
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
            changedValue = _getResolvedValue(changedValue, allData);
        }
        data.set(changedKey, changedValue);
        return true;
    }
    return false;
}

// Do not modify data, but ok to modify resolvedKeys.
function _resolveOneValue(key, value, data, allData, resolvedKeys) {
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
        value = _getResolvedValue(value, allData);
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
// Examples
//    ${x} == 2
//    ${name} != Anna
function _resolveComparison(value) {
    value = value.trim();
    if (value == 'true') {
        return true;
    }
    if (value == 'false') {
        return false;
    }
    if (value.includes('==') || value.includes('!=')) {
        return _resolveEquality(value);
    } else if (value.includes('<') || value.includes('>')) {
        return _resolveNumberComparison(value);
    }
    throw '(resolve comparison) incorrect syntax: ' + value;
}

// Examples
//     abc
//     firstletter(abc)
function _getVal(str) {
    if (str.length > 13 && str.startsWith("firstletter(") && str.endsWith(")")) {
        str = str.charAt(12)
    }
    return str;
}

function _resolveEquality(value) {
    let equality = true;
    let j = value.indexOf('==');
    if (j < 0) {
        equality = false;
        j = value.indexOf('!=');
    }
    let val1 = _getVal(value.slice(0, j).trim());
    let val2 = _getVal(value.slice(j + 2).trim());
    let equal = val1 == val2;
    //console.log(`Comparing ${val1} == ${val2}`);
    return equality ? equal : !equal;
}

function _resolveNumberComparison(value) {
    let less = true;
    let j = value.indexOf('<');
    if (j < 0) {
        j = value.indexOf('>');
        less = false;
    }
    let equalityToo = j + 1 < value.length && value.charAt(j + 1) == '=';
    let val1 = value.slice(0, j).trim();
    let val2 = value.slice(j + (equalityToo ? 2 : 1)).trim();
    let num1 = stringToIntOrThrow(val1);
    let num2 = stringToIntOrThrow(val2);

    if (less) {
        if (equalityToo) {
            return num1 <= num2;
        } else {
            return num1 < num2;
        }
    } else {
        if (equalityToo) {
            return num1 >= num2;
        } else {
            return num1 > num2;
        }
    }
}

// Examples:
//   "0    == 1"
//   "blah == 10 && ${x} == 10 || ${y} == 20"
function _resolveCondition(value) {
    let orResult = false;
    for (let orComponent of value.split('||')) {
        let andResult = true;
        for (let v of orComponent.split('&&')) {
            andResult &&= _resolveComparison(v)
        }
        orResult ||= andResult;
    }
    return orResult;
}

//   "$varif ${x} == 100  ?? 10    :: 20"
//   "$varif ${x} == blah ?? blah1 :: blah2"
function _tryResolveConditionalSelector(value, sep1, sep2) {
    let j = value.indexOf(sep1);
    if (j >= 0) {
        let val1 = value.slice(0, j).trim();
        let k = value.indexOf(sep2, j + sep1.length);
        if (k >= j + sep1.length) {
            let val2 = value.slice(j + sep1.length, k).trim();
            let val3 = value.slice(k + sep2.length).trim();
            return _resolveCondition(val1) ? _resolveValue(val2) : _resolveValue(val3);
        }
    }
    return null;
}

function _resolveConditionalSelector(value) {
    let result = _tryResolveConditionalSelector(value, '????', '::::');
    if (result == null) {
        result = _tryResolveConditionalSelector(value, '???', ':::');
    }
    if (result == null) {
        result = _tryResolveConditionalSelector(value, '??', '::');
    }
    if (result == null) {
        throw '(resolve conditional selector) incorrect syntax: ' + value;
    }
    return result;
}

//   "$varif ${x} == 100  ?? 10    :: (${y} != 20 ?? 1 :: 2)"
function _resolveValue(value) {
    value = value.trim();

    // Strip parenthesis.
    if (value.startsWith('(') && value.endsWith(')')) {
        return _resolveValue(value.substring(1, value.length - 1));
    }

    // Handle conditional like: a == b ?? c : d
    if (value.includes('??') && value.includes('::')) {
        return _resolveConditionalSelector(value);
    }

    // Handle simple variable
    return value;
}

// Examples:
//   "$varbookref isbn 123456789      !! name"   <-- get name of the book with that isbn
//   "$varbookref name Clara          !! asin "  <-- get asin of the book with key name=Clara
//   "$varbookref name Clara, lang RU !! title"   <-- title isbn of the book with keys name=Clara lang=RU
function _resolveVarbookref(value, allData) {
    if (!value.includes('!!')) {
        throw '(resolve book ref) incorrect syntax: ' + value;
    }
    let j = value.indexOf('!!');
    let searchKeys = value.slice(0, j).trim();
    let fieldToExtract = value.slice(j + 2).trim();
    let matchedBookField = _getBookField(allData, searchKeys, fieldToExtract);
    // If no match, return empty string
    return matchedBookField != null ? matchedBookField : '';
}

function _getResolvedValue(value, allData) {
    if (value.startsWith('$var')) {
        if (value.startsWith('$vareq ')) {
            return _resolveCondition(stripPrefix(value, '$vareq ')) ? 'true' : 'false';
        } else if (value.startsWith('$varif ')) {
            return _resolveConditionalSelector(stripPrefix(value, '$varif '));
        } else if (value.startsWith('$varbookref ')) {
            return _resolveVarbookref(stripPrefix(value, '$varbookref '), allData);
        } else {
            throw new Error('Unknown key starting with a special prefix $var. Expected are $vareq, $varif and $varbookref')
        }
    }
    return value;
}

function _isResolved(value) {
    return !value.includes('${') && !value.startsWith('$var');
}

function _getBookField(allData, searchKeys, fieldToExtract) {
    let matchedData = null;
    for (let data of allData) {
        if (_dataMatchesKeys(data, searchKeys)) {
            if (matchedData == null) {
                matchedData = data;
            } else {
                throw new Error('Matched more than one record for key: ' + searchKeys);
            }
        }
    }
    if (matchedData == null) {
        return null; // No match
    }
    if (!matchedData.has(fieldToExtract)) {
        throw new Error("No such key: " + fieldToExtract);
    }
    return matchedData.get(fieldToExtract);
}

function _dataMatchesKeys(data, searchKeys) {
    for (const keyVal of searchKeys.split("&&")) {
        let v = keyVal.trim().split("==");
        if (v.length != 2) {
            throw new Error("Incorrect syntax of search key: " + keyVal);
        }
        let keyName = v[0].trim();
        let keyValue = v[1].trim();
        if (!data.has(keyName)) {
            throw new Error('No such key: ' + keyName);
        }
        let val = data.get(keyName);
        if (val != keyValue) {
            return false; // No match
        }
    }
    return true;
}
