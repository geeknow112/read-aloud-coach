// node test.js で判定ロジックを確かめる
const assert = require("assert");
const C = require("./core.js");

// 全部言えた
let r = C.judge("I fixed the bug in the deploy script.", ["I fixed the bug in the deploy script"]);
assert.strictEqual(r.accuracy, 1);
assert.deepStrictEqual(r.missed, []);

// 1語の言い間違い
r = C.judge("I fixed the bug in the deploy script.", ["i fix the bug in the deploy script"]);
assert.deepStrictEqual(r.missed, ["fixed"]);
assert.ok(r.accuracy > 0.8 && r.accuracy < 1);

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

// 1語の練習
assert.ok(C.judgeWord("console", ["the console"]));
assert.ok(!C.judgeWord("console", ["counsel"]));

// 文の分割
assert.deepStrictEqual(
  C.splitSentences("I worked on AWS. What is blocking me?\nI will test it!"),
  ["I worked on AWS.", "What is blocking me?", "I will test it!"]
);

console.log("OK");
