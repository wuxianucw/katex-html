import { render } from '../src/index';
import katex from 'katex';

class Math {
    expr: string;
    wrapper: string;
    display: boolean;

    constructor(expr: string, wrapper: string) {
        this.expr = expr;
        this.wrapper = wrapper;
        this.display = wrapper === '$$';
    }

    raw() {
        return `${this.wrapper}${this.expr}${this.wrapper}`;
    }

    html() {
        return katex.renderToString(this.expr, { displayMode: this.display });
    }
}

describe('render', () => {
    it('should render math using katex', () => {
        const input = new Math('1 + 1 = 2', '$');
        const output = render(input.raw());
        expect(output).toBe(input.html());
    });

    it('should not break html structure', () => {
        const input = '<p> $ </p><p> $ </p><p> $$ </p><p> $$ </p>';
        const output = render(input);
        expect(output).toBe(input);
    });

    it('throws error when html structure is broken', () => {
        const input = [
            '<p $$ 1 + 1 = 2 $$',
            '<p> $ </p></p> $$',
            '<p> $ </div>',
            '<p> $$ 1 + 1 = 2 $$',
        ];
        expect(() => render(input[0])).toThrow(new Error('Unterminated tag'));
        expect(() => render(input[1])).toThrow(new Error('Unmatched closing tag'));
        expect(() => render(input[2])).toThrow(new Error('Unmatched closing tag'));
        expect(() => render(input[3])).toThrow(new Error('Unmatched opening tag'));
    });

    it('should render math in text nodes', () => {
        const math = [
            ['1 + 1 = 2', '$'],
            [String.raw`\dfrac{a}{b}`, '$$'],
        ].map(([expr, wrapper]) => new Math(expr, wrapper));
        const input = `<p>${math[0].raw()}</p>${math[0].raw()}<div>${math[1].raw()}</div>$<p>$</p>`;
        const expected = `<p>${math[0].html()}</p>${math[0].html()}<div>${math[1].html()}</div>$<p>$</p>`;
        const output = render(input);
        expect(output).toBe(expected);
    });

    it('should not render in excluded tags', () => {
        const math = new Math('1 + 1 = 2', '$');
        const input = `<p>${math.raw()}</p>${math.raw()}<div>${math.raw()}</div>`;
        const expected = `<p>${math.raw()}</p>${math.html()}<div>${math.html()}</div>`;
        const output = render(input, { excludedTags: ['p'] });
        expect(output).toBe(expected);
    });

    it('should work with escaped html text', () => {
        const input = '$ 114 &lt; 514 $&amp;';
        const expected = `${katex.renderToString(' 114 < 514 ')}&amp;`;
        const output = render(input);
        expect(output).toBe(expected);
    });

    it('should recognize self-closing tags', () => {
        const math = new Math('1 + 1 = 2', '$');
        const input = `$<img src="test.png" />$<input type="text">$<p>${math.raw()}</p>`;
        const expected = `$<img src="test.png" />$<input type="text">$<p>${math.html()}</p>`;
        const output = render(input);
        expect(output).toBe(expected);
    });

    it('should be case insensitive with tags', () => {
        const math = new Math('1 + 1 = 2', '$');
        const input = `<PRE>${math.raw()}</PRE><Img>${math.raw()}<Div>${math.raw()}</Div>`;
        const expected = `<PRE>${math.raw()}</PRE><Img>${math.html()}<Div>${math.html()}</Div>`;
        const output = render(input);
        expect(output).toBe(expected);
    });

    it('should recognize AMS environment even without `$$...$$`', () => {
        const input = '\\begin{align} x + y = z \\end{align}';
        const expected = katex.renderToString(input, { displayMode: true });
        const output = render(input);
        expect(output).toBe(expected);
    });
});
