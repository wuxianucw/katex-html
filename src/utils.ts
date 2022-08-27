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
    // eslint-disable-next-line
    const entityMap = { "Tab": "\t", "NewLine": "\n", "nbsp": " ", "quot": "\"", "amp": "&", "lt": "<", "gt": ">", "iexcl": "¡", "cent": "¢", "pound": "£", "curren": "¤", "yen": "¥", "brvbar": "¦", "sect": "§", "uml": "¨", "copy": "©", "ordf": "ª", "laquo": "«", "not": "¬", "shy": "­", "reg": "®", "macr": "¯", "deg": "°", "plusmn": "±", "sup2": "²", "sup3": "³", "acute": "´", "micro": "µ", "para": "¶", "dot": "¶", "cedil": "¸", "sup1": "¹", "ordm": "º", "raquo": "»", "frac14": "¼", "frac12": "½", "frac34": "¾", "iquest": "¿", "Agrave": "À", "Aacute": "Á", "Acirc": "Â", "Atilde": "Ã", "Auml": "Ä", "Aring": "Å", "AElig": "Æ", "Ccedil": "Ç", "Egrave": "È", "Eacute": "É", "Ecirc": "Ê", "Euml": "Ë", "Igrave": "Ì", "Iacute": "Í", "Icirc": "Î", "Iuml": "Ï", "ETH": "Ð", "Ntilde": "Ñ", "Ograve": "Ò", "Oacute": "Ó", "Ocirc": "Ô", "Otilde": "Õ", "Ouml": "Ö", "times": "×", "Oslash": "Ø", "Ugrave": "Ù", "Uacute": "Ú", "Ucirc": "Û", "Uuml": "Ü", "Yacute": "Ý", "THORN": "Þ", "szlig": "ß", "agrave": "à", "aacute": "á", "acirc": "â", "atilde": "ã", "auml": "ä", "aring": "å", "aelig": "æ", "ccedil": "ç", "egrave": "è", "eacute": "é", "ecirc": "ê", "euml": "ë", "igrave": "ì", "iacute": "í", "icirc": "î", "iuml": "ï", "eth": "ð", "ntilde": "ñ", "ograve": "ò", "oacute": "ó", "ocirc": "ô", "otilde": "õ", "ouml": "ö", "divide": "÷", "oslash": "ø", "ugrave": "ù", "uacute": "ú", "ucirc": "û", "uuml": "ü", "yacute": "ý", "thorn": "þ", "yuml": "ÿ", "Amacr": "Ā", "amacr": "ā", "Abreve": "Ă", "abreve": "ă", "Aogon": "Ą", "aogon": "ą", "Cacute": "Ć", "cacute": "ć", "Ccirc": "Ĉ", "ccirc": "ĉ", "Cdot": "Ċ", "cdot": "ċ", "Ccaron": "Č", "ccaron": "č", "Dcaron": "Ď", "dcaron": "ď", "Dstrok": "Đ", "dstrok": "đ", "Emacr": "Ē", "emacr": "ē", "Ebreve": "Ĕ", "ebreve": "ĕ", "Edot": "Ė", "edot": "ė", "Eogon": "Ę", "eogon": "ę", "Ecaron": "Ě", "ecaron": "ě", "Gcirc": "Ĝ", "gcirc": "ĝ", "Gbreve": "Ğ", "gbreve": "ğ", "Gdot": "Ġ", "gdot": "ġ", "Gcedil": "Ģ", "gcedil": "ģ", "Hcirc": "Ĥ", "hcirc": "ĥ", "Hstrok": "Ħ", "hstrok": "ħ", "Itilde": "Ĩ", "itilde": "ĩ", "Imacr": "Ī", "imacr": "ī", "Ibreve": "Ĭ", "ibreve": "ĭ", "Iogon": "Į", "iogon": "į", "Idot": "İ", "imath; &inodot": "ı", "IJlig": "Ĳ", "ijlig": "ĳ", "Jcirc": "Ĵ", "jcirc": "ĵ", "Kcedil": "Ķ", "kcedil": "ķ", "kgreen": "ĸ", "Lacute": "Ĺ", "lacute": "ĺ", "Lcedil": "Ļ", "lcedil": "ļ", "Lcaron": "Ľ", "lcaron": "ľ", "Lmidot": "Ŀ", "lmidot": "ŀ", "Lstrok": "Ł", "lstrok": "ł", "Nacute": "Ń", "nacute": "ń", "Ncedil": "Ņ", "ncedil": "ņ", "Ncaron": "Ň", "ncaron": "ň", "napos": "ŉ", "ENG": "Ŋ", "eng": "ŋ", "Omacr": "Ō", "omacr": "ō", "Obreve": "Ŏ", "obreve": "ŏ", "Odblac": "Ő", "odblac": "ő", "OElig": "Œ", "oelig": "œ", "Racute": "Ŕ", "racute": "ŕ", "Rcedil": "Ŗ", "rcedil": "ŗ", "Rcaron": "Ř", "rcaron": "ř", "Sacute": "Ś", "sacute": "ś", "Scirc": "Ŝ", "scirc": "ŝ", "Scedil": "Ş", "scedil": "ş", "Scaron": "Š", "scaron": "š", "Tcedil": "Ţ", "tcedil": "ţ", "Tcaron": "Ť", "tcaron": "ť", "Tstrok": "Ŧ", "tstrok": "ŧ", "Utilde": "Ũ", "utilde": "ũ", "Umacr": "Ū", "umacr": "ū", "Ubreve": "Ŭ", "ubreve": "ŭ", "Uring": "Ů", "uring": "ů", "Udblac": "Ű", "udblac": "ű", "Uogon": "Ų", "uogon": "ų", "Wcirc": "Ŵ", "wcirc": "ŵ", "Ycirc": "Ŷ", "ycirc": "ŷ", "Yuml": "Ÿ", "fnof": "ƒ", "circ": "ˆ", "tilde": "˜", "Alpha": "Α", "Beta": "Β", "Gamma": "Γ", "Delta": "Δ", "Epsilon": "Ε", "Zeta": "Ζ", "Eta": "Η", "Theta": "Θ", "Iota": "Ι", "Kappa": "Κ", "Lambda": "Λ", "Mu": "Μ", "Nu": "Ν", "Xi": "Ξ", "Omicron": "Ο", "Pi": "Π", "Rho": "Ρ", "Sigma": "Σ", "Tau": "Τ", "Upsilon": "Υ", "Phi": "Φ", "Chi": "Χ", "Psi": "Ψ", "Omega": "Ω", "alpha": "α", "beta": "β", "gamma": "γ", "delta": "δ", "epsilon": "ε", "zeta": "ζ", "eta": "η", "theta": "θ", "iota": "ι", "kappa": "κ", "lambda": "λ", "mu": "μ", "nu": "ν", "xi": "ξ", "omicron": "ο", "pi": "π", "rho": "ρ", "sigmaf": "ς", "sigma": "σ", "tau": "τ", "upsilon": "υ", "phi": "φ", "chi": "χ", "psi": "ψ", "omega": "ω", "thetasym": "ϑ", "upsih": "ϒ", "piv": "ϖ", "ensp": " ", "emsp": " ", "thinsp": " ", "zwnj": "‌", "zwj": "‍", "lrm": "‎", "rlm": "‏", "ndash": "–", "mdash": "—", "lsquo": "‘", "rsquo": "’", "sbquo": "‚", "ldquo": "“", "rdquo": "”", "bdquo": "„", "dagger": "†", "Dagger": "‡", "bull": "•", "hellip": "…", "permil": "‰", "prime": "′", "Prime": "″", "lsaquo": "‹", "rsaquo": "›", "oline": "‾", "euro": "€", "trade": "™", "larr": "←", "uarr": "↑", "rarr": "→", "darr": "↓", "harr": "↔", "crarr": "↵", "forall": "∀", "part": "∂", "exist": "∃", "empty": "∅", "nabla": "∇", "isin": "∈", "notin": "∉", "ni": "∋", "prod": "∏", "sum": "∑", "minus": "−", "lowast": "∗", "radic": "√", "prop": "∝", "infin": "∞", "ang": "∠", "and": "∧", "or": "∨", "cap": "∩", "cup": "∪", "int": "∫", "there4": "∴", "sim": "∼", "cong": "≅", "asymp": "≈", "ne": "≠", "equiv": "≡", "le": "≤", "ge": "≥", "sub": "⊂", "sup": "⊃", "nsub": "⊄", "sube": "⊆", "supe": "⊇", "oplus": "⊕", "otimes": "⊗", "perp": "⊥", "sdot": "⋅", "lceil": "⌈", "rceil": "⌉", "lfloor": "⌊", "rfloor": "⌋", "loz": "◊", "spades": "♠", "clubs": "♣", "hearts": "♥", "diams": "♦" };

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
        const entity = html.slice(start + 1, end);
        if (entity.startsWith('#')) {
            const num = parseInt(entity.slice(1), 10);
            if (!isNaN(num)) {
                result += String.fromCharCode(num);
            } else {
                result += '&' + entity + ';'; // restore
            }
        } else {
            result += entityMap[entity];
        }
        pos = end + 1;
    }

    return result;
}
