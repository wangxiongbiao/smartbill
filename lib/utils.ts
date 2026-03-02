/**
 * Safely deep-cleans an object by removing circular references and non-serializable objects (DOM nodes, Window, etc.)
 */
export function safeDeepClean(obj: any, seen = new WeakSet()): any {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (seen.has(obj)) {
        return undefined;
    }

    // Check for Window or DOM Node
    if (
        (typeof window !== 'undefined' && obj === window) ||
        (typeof Node !== 'undefined' && obj instanceof Node) ||
        (obj.constructor && (obj.constructor.name === 'Window' || obj.constructor.name === 'HTMLDocument'))
    ) {
        return undefined;
    }

    seen.add(obj);

    if (Array.isArray(obj)) {
        return obj.map(item => safeDeepClean(item, seen)).filter(item => item !== undefined);
    }

    const result: Record<string, any> = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            try {
                const value = safeDeepClean(obj[key], seen);
                if (value !== undefined) {
                    result[key] = value;
                }
            } catch (e) {
                // Skip non-accessible properties
            }
        }
    }
    return result;
}
