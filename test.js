// node test.js で判定ロジックを確かめる
const assert = require("assert");
const C = require("./core.js");

// 全部言えた
let r = C.judge("I fixed the bug in the deploy script.", ["I fixed the bug in the deploy script"]);
assert.strictEqual(r.accuracy, 1);
assert.deepStrictEqual(r.missed, []);

// 1語の言い間違い（fixed を fix と言った）
r = C.judge("I fixed the bug in the deploy script.", ["i fix the bug in the deploy script"]);
assert.deepStrictEqual(r.missed, ["fixed"]);

// 抜けた語
r = C.judge("Please check the log.", ["please the log"]);
assert.deepStrictEqual(r.missed, ["check"]);

// ハイフンの語は、全部のかけらが言えたときだけ言えた
r = C.judge("It is a state-of-the-art tool.", ["it is a state of the art tool"]);
assert.deepStrictEqual(r.missed, []);
r = C.judge("It is a state-of-the-art tool.", ["it is a state of the tool"]);
assert.deepStrictEqual(r.missed, ["state-of-the-art"]);

// 縮約形
r = C.judge("I don't know.", ["I don't know"]);
assert.strictEqual(r.accuracy, 1);

// 候補が複数あれば、いちばん合うものを使う
r = C.judge("Open the console.", ["open the counsel", "open the console"]);
assert.strictEqual(r.accuracy, 1);

// 何も聞こえなかった
r = C.judge("Open the console.", [""]);
assert.strictEqual(r.accuracy, 0);
assert.strictEqual(r.missed.length, 3);

// One が「1」や「won」と認識されても、言えた扱い
r = C.judge("One of them failed.", ["1 of them failed"]);
assert.deepStrictEqual(r.missed, []);
r = C.judge("One of them failed.", ["won of them failed"]);
assert.deepStrictEqual(r.missed, []);
r = C.judge("I have two servers.", ["i have 2 servers"]);
assert.deepStrictEqual(r.missed, []);
r = C.judge("It is for you.", ["it is four you"]);
assert.deepStrictEqual(r.missed, []);

// 5文字以上は、1文字の違いまで許す（認識の揺れ）
r = C.judge("The servers restarted.", ["the server restarted"]);
assert.deepStrictEqual(r.missed, []);
// 短い語の違いは許さない
r = C.judge("I can run it.", ["i can ran it"]);
assert.deepStrictEqual(r.missed, ["run"]);

// 文の分割とまとめ
const ss = C.splitSentences("I worked on AWS. What is blocking me?\nI will test it!");
assert.deepStrictEqual(ss, ["I worked on AWS.", "What is blocking me?", "I will test it!"]);
assert.strictEqual(C.chunk(ss, 2).length, 2);
assert.strictEqual(C.chunk(ss, 0).length, 1);

console.log("OK");
