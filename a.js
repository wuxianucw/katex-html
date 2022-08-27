const { render } = require('./dist/index.js');
const fs = require('fs');

const input = String.raw`
<div class="section__body typo" data-fragment-id="problem-description">
<h2 id="description" tabindex="-1">Description</h2>
<div><p>You are given an array $a$ that contains $n$ integers. You can choose any proper subsegment $a_l, a_{l + 1}, \ldots, a_r$ of this array, meaning you can choose any two integers $1 \le l \le r \le n$, where $r - l + 1 &lt; n$. We define the <span class="tex-font-style-it">beauty</span> of a given subsegment as the value of the following expression:</p><p>$$\max(a_{1}, a_{2}, \ldots, a_{l-1}, a_{r+1}, a_{r+2}, \ldots, a_{n}) - \min(a_{1}, a_{2}, \ldots, a_{l-1}, a_{r+1}, a_{r+2}, \ldots, a_{n}) + \max(a_{l}, \ldots, a_{r}) - \min(a_{l}, \ldots, a_{r}).$$</p><p>Please find the maximum beauty among all proper subsegments.</p></div><div class="input-specification"><p>The first line contains one integer $t$ ($1 \leq t \leq 1000$) — the number of test cases. Then follow the descriptions of each test case.</p><p>The first line of each test case contains a single integer $n$ $(4 \leq n \leq 10^5)$ — the length of the array.</p><p>The second line of each test case contains $n$ integers $a_1, a_2, \ldots, a_n$ ($1 \leq a_{i} \leq 10^9$) — the elements of the given array.</p><p>It is guaranteed that the sum of $n$ over all test cases does not exceed $10^5$.</p></div><div class="output-specification"><p>For each testcase print a single integer — the maximum beauty of a proper subsegment.</p></div>
<h2 id="input" tabindex="-1">Input</h2>
<p>The first line contains one integer $t$ ($1 \leq t \leq 1000$) — the number of test cases. Then follow the descriptions of each test case.</p><p>The first line of each test case contains a single integer $n$ $(4 \leq n \leq 10^5)$ — the length of the array.</p><p>The second line of each test case contains $n$ integers $a_1, a_2, \ldots, a_n$ ($1 \leq a_{i} \leq 10^9$) — the elements of the given array.</p><p>It is guaranteed that the sum of $n$ over all test cases does not exceed $10^5$.</p>
<h2 id="output" tabindex="-1">Output</h2>
<p>For each testcase print a single integer — the maximum beauty of a proper subsegment.</p>
<h2 id="samples" tabindex="-1">Samples</h2>
<div class="row"><div class="code-toolbar medium-6 columns sample"><h2>输入数据 1</h2><pre class="syntax-hl language-input1" tabindex="0"><code class="language-input1">4
8
1 2 2 3 1 5 6 1
5
1 2 3 100 200
4
3 3 3 3
6
7 8 3 1 1 8
</code></pre><div class="toolbar"><div class="toolbar-item"><a href="javascript:;">Copy</a></div></div></div><div class="code-toolbar medium-6 columns sample"><h2>输出数据 1</h2><pre class="syntax-hl language-output1" tabindex="0"><code class="language-output1">9
297
0
14
</code></pre><div class="toolbar"><div class="toolbar-item"><a href="javascript:;">Copy</a></div></div></div></div>

<h2 id="note" tabindex="-1">Note</h2>
<p>In the first test case, the optimal segment is $l = 7$, $r = 8$. The beauty of this segment equals to $(6 - 1) + (5 - 1) = 9$.</p><p>In the second test case, the optimal segment is $l = 2$, $r = 4$. The beauty of this segment equals $(100 - 2) + (200 - 1) = 297$.</p>

</div>`.trim();

// console.log(render(input));
fs.writeFileSync('out.txt', render(input));
