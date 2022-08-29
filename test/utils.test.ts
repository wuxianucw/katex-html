import { unescapeHTML } from '../src/utils';

describe('unescapeHTML', () => {
    it('does nothing when input is not escaped', () => {
        const input = 'abcdefghijkABCDEFGHIJK1234567890-;:!?()[]{}';
        const output = unescapeHTML(input);
        expect(output).toBe(input);
    });

    it('unescapes escaped html text', () => {
        const input = '&lt;&amp;&gt;&quot;&#39;&#x2F;&#X5c;';
        const output = unescapeHTML(input);
        expect(output).toBe('<&>"\'\x2f\x5c');
    });

    it('ignores invalid character references', () => {
        const input = '114514&#x2F;&nmsl;&nbsp;&#???;';
        const output = unescapeHTML(input);
        expect(output).toBe('114514\x2f&nmsl;\xa0&#???;');
    });

    it('ignores incorrectly used `&`', () => {
        const input = '&x&x&amp;&y';
        const output = unescapeHTML(input);
        expect(output).toBe('&x&x&&y');
    });

    it('is case sensitive with named character references', () => {
        const input = '&amp;&AMP;&Amp;';
        const output = unescapeHTML(input);
        expect(output).toBe('&&&Amp;');
    });
});
