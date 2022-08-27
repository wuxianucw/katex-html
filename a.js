const { render } = require('./dist/index.js');

const input = String.raw`
$1 + 1 = 2$
<a href="https://www.google.com">Google</a>
<div>$$ \dfrac{a}{b} $$</div>
`;

console.log(render(input));
