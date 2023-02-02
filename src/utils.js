export function mergeActions(action1, action2) {
    let a1 = action1.split(':').filter(x => x);
    let a2 = action2.split(':').filter(x => x);
    return [...a1, ...a2].join(':');
}

/* istanbul ignore next */
export function debug(verbose, message) {
    if (verbose) {
        console.debug(message);
    }
}

export function arraysEqual(a, b) {
    if (a === b) {
        return true;
    }
    if (a == null) {
        return b == null;
    }
    if (b == null || a.length != b.length) {
        return false;
    }
    for (let i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) {
            return false;
        }
    }
    return true;
}

export function normalizeText(str) {
    return str.replaceAll('\n', ' ')
        .replaceAll(/\s+/g, ' ')
        .replaceAll(/\s+$/g, '')
        .replaceAll('> <', '><')
        .replaceAll('. </', '.</')
        .trim();
}

export function normalizeSearchQuery(str) {
    return str
        .replaceAll('?', ' ')
        .replaceAll('(', ' ')
        .replaceAll(')', ' ')
        .replaceAll('[', ' ')
        .replaceAll(']', ' ')
        .replaceAll(',', ' ')
        .replaceAll('.', ' ')
        .replaceAll('"', ' ')
        .replaceAll('\'', ' ')
        .replaceAll('/', ' ')
        .replaceAll('\\', ' ')
        .replaceAll('-', ' ')
        .replaceAll(/\s+/g, ' ')
        .replaceAll(/\s+$/g, '')
        .trim();
}

export function stripPrefix(str, prefix) {
    return str.startsWith(prefix) ? str.substring(prefix.length) : str;
}

export function stripQuotes(str) {
    if (str.startsWith('"') && str.endsWith('"') ||
        str.startsWith("'") && str.endsWith("'")) {
        return str.substring(1, str.length - 1);
    }
    return str;
}

export function isInt(str) {
    let i = parseInt(str);
    return str == '' + i
}

export function stringToIntOrThrow(str) {
    let i = parseInt(str);
    if (str != '' + i) {
        throw `cannot parse as int: ${str}`;
    }
    return i;
}