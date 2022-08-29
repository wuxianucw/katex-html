import entityMap from './entities';

function findEndOfMath(delimiter: string, text: string, startIndex: number): number {
    // Adapted from
    // https://github.com/Khan/perseus/blob/master/src/perseus-markdown.jsx
    let index = startIndex;
    let braceLevel = 0;

    const delimLength = delimiter.length;

    while (index < text.length) {
        const character = text[index];

        if (braceLevel <= 0 &&
            text.slice(index, index + delimLength) === delimiter) {
            return index;
        } else if (character === '\\') {
            index++;
        } else if (character === '{') {
            braceLevel++;
        } else if (character === '}') {
            braceLevel--;
        }

        index++;
    }

    return -1;
}

function escapeRegex(string: string): string {
    return string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}

const amsRegex = /^\\begin{/;

export interface Delimiter {
    left: string;
    right: string;
    display: boolean;
}

interface TextGroup {
    type: 'text';
    data: string;
}

interface MathGroup {
    type: 'math';
    data: string;
    rawData: string;
    display: boolean;
}

export type Group = TextGroup | MathGroup;

export type Splitter = (text: string) => Group[];

export function buildSplitter(delimiters: Delimiter[]): Splitter {
    const regexLeft = new RegExp(
        '(' + delimiters.map((x) => escapeRegex(x.left)).join('|') + ')'
    );

    return (text) => {
        let index: number;
        const data: Group[] = [];

        while (true) {
            index = text.search(regexLeft);
            if (index === -1) {
                break;
            }
            if (index > 0) {
                data.push({
                    type: 'text',
                    data: text.slice(0, index),
                });
                text = text.slice(index); // now text starts with delimiter
            }
            // ... so this always succeeds:
            const i = delimiters.findIndex((delim) => text.startsWith(delim.left));
            index = findEndOfMath(delimiters[i].right, text, delimiters[i].left.length);
            if (index === -1) {
                break;
            }
            const rawData = text.slice(0, index + delimiters[i].right.length);
            const math = amsRegex.test(rawData)
                ? rawData
                : text.slice(delimiters[i].left.length, index);
            data.push({
                type: 'math',
                data: math,
                rawData,
                display: delimiters[i].display,
            });
            text = text.slice(index + delimiters[i].right.length);
        }

        if (text !== '') {
            data.push({
                type: 'text',
                data: text,
            });
        }

        return data;
    };
}

export function unescapeHTML(html: string): string {
    let result = '';
    let pos = 0;
    while (pos < html.length) {
        const start = html.indexOf('&', pos);
        if (start === -1) {
            result += html.slice(pos);
            break;
        }
        result += html.slice(pos, start);
        const end = html.indexOf(';', start);
        if (end === -1) {
            result += html.slice(start);
            break;
        }
        let entity = html.slice(start + 1, end);
        const fixEnd = entity.lastIndexOf('&');
        if (fixEnd !== -1) {
            result += '&' + entity.slice(0, fixEnd);
            entity = entity.slice(fixEnd + 1);
        }

        if (entity.startsWith('#')) {
            const inner = entity.slice(1).toLowerCase();
            const num = inner.startsWith('x') ? parseInt(inner.slice(1), 16) : parseInt(inner, 10);
            if (!isNaN(num)) {
                result += String.fromCharCode(num);
            } else {
                result += '&' + entity + ';'; // restore
            }
        } else {
            result += entityMap[entity] ?? '&' + entity + ';'; // restore if not a known entity
        }
        pos = end + 1;
    }

    return result;
}
