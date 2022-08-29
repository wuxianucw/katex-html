export default function visit(input: string, callback: (text: string) => string, excludedTags: string[]): string {
    const selfClosingTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
    const minLength = 3; // minimum length of a LaTeX input

    const stack: string[] = [];
    let pos = 0;
    let ignore = 0;
    let result = '';

    const wrappedCallback = (text: string): string => (
        (text.length < minLength || ignore > 0) ? text : callback(text)
    );

    while (pos < input.length) {
        const ch = input[pos];
        if (ch === '<') {
            const end = input.indexOf('>', pos);
            if (end === -1) {
                throw new Error('Unterminated tag');
            }
            result += input.substring(pos, end + 1);
            const tag = input.slice(pos + 1, end).split(' ')[0].toLowerCase();
            if (tag.startsWith('/')) {
                if (stack.length === 0 || stack[stack.length - 1] !== tag.slice(1)) {
                    throw new Error('Unmatched closing tag');
                }
                if (excludedTags.includes(stack.pop()!!)) {
                    ignore--;
                }
            } else if (!selfClosingTags.includes(tag)) {
                stack.push(tag);
                if (excludedTags.includes(tag)) {
                    ignore++;
                }
            }
            pos = end + 1;
        } else {
            const end = input.indexOf('<', pos);
            if (end === -1) {
                result += wrappedCallback(input.substring(pos));
                break;
            }
            result += wrappedCallback(input.substring(pos, end));
            pos = end;
        }
    }

    if (stack.length > 0) {
        throw new Error('Unmatched opening tag');
    }

    return result;
}
