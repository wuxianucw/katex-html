import katex, { KatexOptions } from 'katex';
import { buildSplitter, unescapeHTML, Delimiter, Splitter } from './utils';
import visit from './visit';

export interface RenderOptions {
    delimiters?: Delimiter[];
    excludedTags?: string[];
}

export type Options = RenderOptions & KatexOptions;

const defaultOptions: Options = {
    delimiters: [
        { left: '$$', right: '$$', display: true },
        // LaTeX uses $...$, but it ruins the display of normal `$` in text.
        { left: "$", right: "$", display: false },
        { left: '\\[', right: '\\]', display: true },
        { left: '\\(', right: '\\)', display: false },
        { left: '\\begin{equation}', right: '\\end{equation}', display: true },
        { left: '\\begin{align}', right: '\\end{align}', display: true },
        { left: '\\begin{gather}', right: '\\end{gather}', display: true },
        { left: '\\begin{alignat}', right: '\\end{alignat}', display: true },
        { left: '\\begin{CD}', right: '\\end{CD}', display: true },
    ],
    excludedTags: ['script', 'noscript', 'style', 'pre', 'code', 'kbd', 'samp', 'var', 'math', 'svg', 'textarea', 'option'],

    throwOnError: false,
    errorColor: '#cc0000',
    macros: {},
};

export class Renderer {
    private options: Options;
    private split: Splitter;

    constructor(options: Options = {}) {
        this.options = { ...defaultOptions, ...options };
        this.options.excludedTags!!.map((tag) => tag.toLowerCase());
        this.split = buildSplitter(this.options.delimiters!!);
    }

    render(input: string): string {
        return visit(input, (text) => {
            const data = this.split(text);
            return data.reduce((acc, x) => {
                if (x.type === 'text') {
                    return acc + x.data;
                }
                return acc + katex.renderToString(unescapeHTML(x.data), { ...this.options, displayMode: x.display });
            }, '');
        }, this.options.excludedTags!!);
    }
}

export function render(input: string, options: Options = {}): string {
    return new Renderer(options).render(input);
}
