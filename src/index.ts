import katex, { KatexOptions } from 'katex';
import { buildSplitter, unescapeHTML, Delimiter } from './utils';
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

export function render(input: string, options?: Options): string {
    const opts = { ...defaultOptions, ...options };
    opts.excludedTags!!.map((tag) => tag.toLowerCase());
    const split = buildSplitter(opts.delimiters!!);
    return visit(input, (text) => {
        const data = split(text);
        return data.reduce((acc, x) => {
            if (x.type === 'text') {
                return acc + x.data;
            }
            return acc + katex.renderToString(unescapeHTML(x.data), { ...opts, displayMode: x.display });
        }, '');
    }, opts.excludedTags!!);
}
