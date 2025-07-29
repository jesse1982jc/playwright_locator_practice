/**
 * Extending object that entered in first argument.
 *
 * Returns extended object or false if have no target object or incorrect type.
 *
 * If you wish to clone source object (without modify it), just use empty new
 * object as first argument, like this:
 *   deepExtend({}, yourObj_1, [yourObj_N]);
 */
export const deepExtend = function (...objects) {
    if (arguments.length < 1 || typeof arguments[0] !== 'object') {
        return false;
    }
    if (arguments.length < 2) {
        return arguments[0];
    }
    const target = arguments[0];
    // convert arguments to array and cut off target object
    const args = Array.prototype.slice.call(arguments, 1);
    let val, src;
    args.forEach(function (obj) {
        // skip argument if it is array or isn't object
        if (typeof obj !== 'object' || Array.isArray(obj)) {
            return;
        }
        Object.keys(obj).forEach(function (key) {
            src = target[key]; // source value
            val = obj[key]; // new value
            // recursion prevention
            if (val === target) {
                return;
                /**
                 * if new value isn't object then just overwrite by new value
                 * instead of extending.
                 */
            }
            else if (typeof val !== 'object' || val === null) {
                target[key] = val;
                return;
                // just clone arrays (and recursive clone objects inside)
            }
            else if (Array.isArray(val)) {
                target[key] = deepCloneArray(val);
                return;
                // custom cloning and overwrite for specific objects
            }
            else if (isSpecificValue(val)) {
                target[key] = cloneSpecificValue(val);
                return;
                // overwrite by new value if source isn't object or array
            }
            else if (typeof src !== 'object' || src === null || Array.isArray(src)) {
                target[key] = deepExtend({}, val);
                return;
                // source value and new value is objects both, extending...
            }
            else {
                target[key] = deepExtend(src, val);
                return;
            }
        });
    });
    return target;
};
function isSpecificValue(val) {
    return (val instanceof Date
        || val instanceof RegExp) ? true : false;
}
function cloneSpecificValue(val) {
    if (val instanceof Date) {
        return new Date(val.getTime());
    }
    else if (val instanceof RegExp) {
        return new RegExp(val);
    }
    else {
        throw new Error('cloneSpecificValue: Unexpected situation');
    }
}
/**
 * Recursive cloning array.
 */
function deepCloneArray(arr) {
    const clone = [];
    arr.forEach(function (item, index) {
        if (typeof item === 'object' && item !== null) {
            if (Array.isArray(item)) {
                clone[index] = deepCloneArray(item);
            }
            else if (isSpecificValue(item)) {
                clone[index] = cloneSpecificValue(item);
            }
            else {
                clone[index] = deepExtend({}, item);
            }
        }
        else {
            clone[index] = item;
        }
    });
    return clone;
}
// getDeepFromObject({result: {data: 1}}, 'result.data', 2); // returns 1
export function getDeepFromObject(object = {}, name, defaultValue) {
    const keys = name.split('.');
    // clone the object
    let level = deepExtend({}, object || {});
    keys.forEach((k) => {
        if (level && typeof level[k] !== 'undefined') {
            level = level[k];
        }
        else {
            level = undefined;
        }
    });
    return typeof level === 'undefined' ? defaultValue : level;
}
export function urlBase64Decode(str) {
    let output = str.replace(/-/g, '+').replace(/_/g, '/');
    switch (output.length % 4) {
        case 0: {
            break;
        }
        case 2: {
            output += '==';
            break;
        }
        case 3: {
            output += '=';
            break;
        }
        default: {
            throw new Error('Illegal base64url string!');
        }
    }
    return b64DecodeUnicode(output);
}
export function b64decode(str) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output = '';
    str = String(str).replace(/=+$/, '');
    if (str.length % 4 === 1) {
        throw new Error(`'atob' failed: The string to be decoded is not correctly encoded.`);
    }
    for (
    // initialize result and counters
    let bc = 0, bs, buffer, idx = 0; 
    // get next character
    buffer = str.charAt(idx++); 
    // character found in table? initialize bit storage and add its ascii value;
    ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
        // and if not first of each 4 characters,
        // convert the first 8 bits to one ascii character
        bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
        // try to find character in table (0-63, not found => -1)
        buffer = chars.indexOf(buffer);
    }
    return output;
}
// https://developer.mozilla.org/en/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#The_Unicode_Problem
export function b64DecodeUnicode(str) {
    return decodeURIComponent(Array.prototype.map.call(b64decode(str), (c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVscGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9mcmFtZXdvcmsvYXV0aC9oZWxwZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7OztHQVFHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sVUFBVSxHQUFHLFVBQVUsR0FBRyxPQUFjO0lBQ25ELElBQUksU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksT0FBTyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUSxFQUFFO1FBQzVELE9BQU8sS0FBSyxDQUFDO0tBQ2Q7SUFFRCxJQUFJLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1FBQ3hCLE9BQU8sU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ3JCO0lBRUQsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRTVCLHVEQUF1RDtJQUN2RCxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRXRELElBQUksR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUViLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxHQUFRO1FBQzdCLCtDQUErQztRQUMvQyxJQUFJLE9BQU8sR0FBRyxLQUFLLFFBQVEsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ2pELE9BQU87U0FDUjtRQUVELE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsR0FBRztZQUNwQyxHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsZUFBZTtZQUNsQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsWUFBWTtZQUU1Qix1QkFBdUI7WUFDdkIsSUFBSSxHQUFHLEtBQUssTUFBTSxFQUFFO2dCQUNsQixP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QUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFNLEVBQUUsRUFBRTtRQUM1RSxPQUFPLEdBQUcsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQy9ELENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2YsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogRXh0ZW5kaW5nIG9iamVjdCB0aGF0IGVudGVyZWQgaW4gZmlyc3QgYXJndW1lbnQuXG4gKlxuICogUmV0dXJucyBleHRlbmRlZCBvYmplY3Qgb3IgZmFsc2UgaWYgaGF2ZSBubyB0YXJnZXQgb2JqZWN0IG9yIGluY29ycmVjdCB0eXBlLlxuICpcbiAqIElmIHlvdSB3aXNoIHRvIGNsb25lIHNvdXJjZSBvYmplY3QgKHdpdGhvdXQgbW9kaWZ5IGl0KSwganVzdCB1c2UgZW1wdHkgbmV3XG4gKiBvYmplY3QgYXMgZmlyc3QgYXJndW1lbnQsIGxpa2UgdGhpczpcbiAqICAgZGVlcEV4dGVuZCh7fSwgeW91ck9ial8xLCBbeW91ck9ial9OXSk7XG4gKi9cbmV4cG9ydCBjb25zdCBkZWVwRXh0ZW5kID0gZnVuY3Rpb24gKC4uLm9iamVjdHM6IGFueVtdKTogYW55IHtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAxIHx8IHR5cGVvZiBhcmd1bWVudHNbMF0gIT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50c1swXTtcbiAgfVxuXG4gIGNvbnN0IHRhcmdldCA9IGFyZ3VtZW50c1swXTtcblxuICAvLyBjb252ZXJ0IGFyZ3VtZW50cyB0byBhcnJheSBhbmQgY3V0IG9mZiB0YXJnZXQgb2JqZWN0XG4gIGNvbnN0IGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuXG4gIGxldCB2YWwsIHNyYztcblxuICBhcmdzLmZvckVhY2goZnVuY3Rpb24gKG9iajogYW55KSB7XG4gICAgLy8gc2tpcCBhcmd1bWVudCBpZiBpdCBpcyBhcnJheSBvciBpc24ndCBvYmplY3RcbiAgICBpZiAodHlwZW9mIG9iaiAhPT0gJ29iamVjdCcgfHwgQXJyYXkuaXNBcnJheShvYmopKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgT2JqZWN0LmtleXMob2JqKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIHNyYyA9IHRhcmdldFtrZXldOyAvLyBzb3VyY2UgdmFsdWVcbiAgICAgIHZhbCA9IG9ialtrZXldOyAvLyBuZXcgdmFsdWVcblxuICAgICAgLy8gcmVjdXJzaW9uIHByZXZlbnRpb25cbiAgICAgIGlmICh2YWwgPT09IHRhcmdldCkge1xuICAgICAgICByZXR1cm47XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIGlmIG5ldyB2YWx1ZSBpc24ndCBvYmplY3QgdGhlbiBqdXN0IG92ZXJ3cml0ZSBieSBuZXcgdmFsdWVcbiAgICAgICAgICogaW5zdGVhZCBvZiBleHRlbmRpbmcuXG4gICAgICAgICAqL1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsICE9PSAnb2JqZWN0JyB8fCB2YWwgPT09IG51bGwpIHtcbiAgICAgICAgdGFyZ2V0W2tleV0gPSB2YWw7XG5cbiAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIC8vIGp1c3QgY2xvbmUgYXJyYXlzIChhbmQgcmVjdXJzaXZlIGNsb25lIG9iamVjdHMgaW5zaWRlKVxuICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHZhbCkpIHtcbiAgICAgICAgdGFyZ2V0W2tleV0gPSBkZWVwQ2xvbmVBcnJheSh2YWwpO1xuXG4gICAgICAgIHJldHVybjtcblxuICAgICAgICAvLyBjdXN0b20gY2xvbmluZyBhbmQgb3ZlcndyaXRlIGZvciBzcGVjaWZpYyBvYmplY3RzXG4gICAgICB9IGVsc2UgaWYgKGlzU3BlY2lmaWNWYWx1ZSh2YWwpKSB7XG4gICAgICAgIHRhcmdldFtrZXldID0gY2xvbmVTcGVjaWZpY1ZhbHVlKHZhbCk7XG5cbiAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIC8vIG92ZXJ3cml0ZSBieSBuZXcgdmFsdWUgaWYgc291cmNlIGlzbid0IG9iamVjdCBvciBhcnJheVxuICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygc3JjICE9PSAnb2JqZWN0JyB8fCBzcmMgPT09IG51bGwgfHwgQXJyYXkuaXNBcnJheShzcmMpKSB7XG4gICAgICAgIHRhcmdldFtrZXldID0gZGVlcEV4dGVuZCh7fSwgdmFsKTtcblxuICAgICAgICByZXR1cm47XG5cbiAgICAgICAgLy8gc291cmNlIHZhbHVlIGFuZCBuZXcgdmFsdWUgaXMgb2JqZWN0cyBib3RoLCBleHRlbmRpbmcuLi5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRhcmdldFtrZXldID0gZGVlcEV4dGVuZChzcmMsIHZhbCk7XG5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcblxuICByZXR1cm4gdGFyZ2V0O1xufTtcblxuZnVuY3Rpb24gaXNTcGVjaWZpY1ZhbHVlKHZhbDogYW55KSB7XG4gIHJldHVybiAoXG4gICAgdmFsIGluc3RhbmNlb2YgRGF0ZVxuICAgIHx8IHZhbCBpbnN0YW5jZW9mIFJlZ0V4cFxuICApID8gdHJ1ZSA6IGZhbHNlO1xufVxuXG5mdW5jdGlvbiBjbG9uZVNwZWNpZmljVmFsdWUodmFsOiBhbnkpOiBhbnkge1xuICBpZiAodmFsIGluc3RhbmNlb2YgRGF0ZSkge1xuICAgIHJldHVybiBuZXcgRGF0ZSh2YWwuZ2V0VGltZSgpKTtcbiAgfSBlbHNlIGlmICh2YWwgaW5zdGFuY2VvZiBSZWdFeHApIHtcbiAgICByZXR1cm4gbmV3IFJlZ0V4cCh2YWwpO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcignY2xvbmVTcGVjaWZpY1ZhbHVlOiBVbmV4cGVjdGVkIHNpdHVhdGlvbicpO1xuICB9XG59XG5cbi8qKlxuICogUmVjdXJzaXZlIGNsb25pbmcgYXJyYXkuXG4gKi9cbmZ1bmN0aW9uIGRlZXBDbG9uZUFycmF5KGFycjogYW55W10pOiBhbnkge1xuICBjb25zdCBjbG9uZTogYW55W10gPSBbXTtcbiAgYXJyLmZvckVhY2goZnVuY3Rpb24gKGl0ZW06IGFueSwgaW5kZXg6IGFueSkge1xuICAgIGlmICh0eXBlb2YgaXRlbSA9PT0gJ29iamVjdCcgJiYgaXRlbSAhPT0gbnVsbCkge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoaXRlbSkpIHtcbiAgICAgICAgY2xvbmVbaW5kZXhdID0gZGVlcENsb25lQXJyYXkoaXRlbSk7XG4gICAgICB9IGVsc2UgaWYgKGlzU3BlY2lmaWNWYWx1ZShpdGVtKSkge1xuICAgICAgICBjbG9uZVtpbmRleF0gPSBjbG9uZVNwZWNpZmljVmFsdWUoaXRlbSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjbG9uZVtpbmRleF0gPSBkZWVwRXh0ZW5kKHt9LCBpdGVtKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY2xvbmVbaW5kZXhdID0gaXRlbTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBjbG9uZTtcbn1cblxuLy8gZ2V0RGVlcEZyb21PYmplY3Qoe3Jlc3VsdDoge2RhdGE6IDF9fSwgJ3Jlc3VsdC5kYXRhJywgMik7IC8vIHJldHVybnMgMVxuZXhwb3J0IGZ1bmN0aW9uIGdldERlZXBGcm9tT2JqZWN0KG9iamVjdCA9IHt9LCBuYW1lOiBzdHJpbmcsIGRlZmF1bHRWYWx1ZT86IGFueSkge1xuICBjb25zdCBrZXlzID0gbmFtZS5zcGxpdCgnLicpO1xuICAvLyBjbG9uZSB0aGUgb2JqZWN0XG4gIGxldCBsZXZlbCA9IGRlZXBFeHRlbmQoe30sIG9iamVjdCB8fCB7fSk7XG4gIGtleXMuZm9yRWFjaCgoaykgPT4ge1xuICAgIGlmIChsZXZlbCAmJiB0eXBlb2YgbGV2ZWxba10gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBsZXZlbCA9IGxldmVsW2tdO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXZlbCA9IHVuZGVmaW5lZDtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiB0eXBlb2YgbGV2ZWwgPT09ICd1bmRlZmluZWQnID8gZGVmYXVsdFZhbHVlIDogbGV2ZWw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1cmxCYXNlNjREZWNvZGUoc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICBsZXQgb3V0cHV0ID0gc3RyLnJlcGxhY2UoLy0vZywgJysnKS5yZXBsYWNlKC9fL2csICcvJyk7XG4gIHN3aXRjaCAob3V0cHV0Lmxlbmd0aCAlIDQpIHtcbiAgICBjYXNlIDA6IHsgYnJlYWs7IH1cbiAgICBjYXNlIDI6IHsgb3V0cHV0ICs9ICc9PSc7IGJyZWFrOyB9XG4gICAgY2FzZSAzOiB7IG91dHB1dCArPSAnPSc7IGJyZWFrOyB9XG4gICAgZGVmYXVsdDoge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbGxlZ2FsIGJhc2U2NHVybCBzdHJpbmchJyk7XG4gICAgfVxuICB9XG4gIHJldHVybiBiNjREZWNvZGVVbmljb2RlKG91dHB1dCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiNjRkZWNvZGUoc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBjaGFycyA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvPSc7XG4gIGxldCBvdXRwdXQ6IHN0cmluZyA9ICcnO1xuXG4gIHN0ciA9IFN0cmluZyhzdHIpLnJlcGxhY2UoLz0rJC8sICcnKTtcblxuICBpZiAoc3RyLmxlbmd0aCAlIDQgPT09IDEpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYCdhdG9iJyBmYWlsZWQ6IFRoZSBzdHJpbmcgdG8gYmUgZGVjb2RlZCBpcyBub3QgY29ycmVjdGx5IGVuY29kZWQuYCk7XG4gIH1cblxuICBmb3IgKFxuICAgIC8vIGluaXRpYWxpemUgcmVzdWx0IGFuZCBjb3VudGVyc1xuICAgIGxldCBiYzogbnVtYmVyID0gMCwgYnM6IGFueSwgYnVmZmVyOiBhbnksIGlkeDogbnVtYmVyID0gMDtcbiAgICAvLyBnZXQgbmV4dCBjaGFyYWN0ZXJcbiAgICBidWZmZXIgPSBzdHIuY2hhckF0KGlkeCsrKTtcbiAgICAvLyBjaGFyYWN0ZXIgZm91bmQgaW4gdGFibGU/IGluaXRpYWxpemUgYml0IHN0b3JhZ2UgYW5kIGFkZCBpdHMgYXNjaWkgdmFsdWU7XG4gICAgfmJ1ZmZlciAmJiAoYnMgPSBiYyAlIDQgPyBicyAqIDY0ICsgYnVmZmVyIDogYnVmZmVyLFxuICAgICAgLy8gYW5kIGlmIG5vdCBmaXJzdCBvZiBlYWNoIDQgY2hhcmFjdGVycyxcbiAgICAgIC8vIGNvbnZlcnQgdGhlIGZpcnN0IDggYml0cyB0byBvbmUgYXNjaWkgY2hhcmFjdGVyXG4gICAgYmMrKyAlIDQpID8gb3V0cHV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoMjU1ICYgYnMgPj4gKC0yICogYmMgJiA2KSkgOiAwXG4gICkge1xuICAgIC8vIHRyeSB0byBmaW5kIGNoYXJhY3RlciBpbiB0YWJsZSAoMC02Mywgbm90IGZvdW5kID0+IC0xKVxuICAgIGJ1ZmZlciA9IGNoYXJzLmluZGV4T2YoYnVmZmVyKTtcbiAgfVxuICByZXR1cm4gb3V0cHV0O1xufVxuXG4vLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi9kb2NzL1dlYi9BUEkvV2luZG93QmFzZTY0L0Jhc2U2NF9lbmNvZGluZ19hbmRfZGVjb2RpbmcjVGhlX1VuaWNvZGVfUHJvYmxlbVxuZXhwb3J0IGZ1bmN0aW9uIGI2NERlY29kZVVuaWNvZGUoc3RyOiBhbnkpIHtcbiAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChBcnJheS5wcm90b3R5cGUubWFwLmNhbGwoYjY0ZGVjb2RlKHN0ciksIChjOiBhbnkpID0+IHtcbiAgICByZXR1cm4gJyUnICsgKCcwMCcgKyBjLmNoYXJDb2RlQXQoMCkudG9TdHJpbmcoMTYpKS5zbGljZSgtMik7XG4gIH0pLmpvaW4oJycpKTtcbn1cbiJdfQ==