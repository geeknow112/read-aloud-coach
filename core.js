// 音読の判定ロジック（ブラウザと Node の両方で動く純粋関数）
(function (root) {
  function normalize(s) {
    return String(s)
      .toLowerCase()
      .replace(/[’‘]/g, "'")
      .replace(/[^a-z0-9' ]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function tokens(s) {
    const n = normalize(s);
    if (!n) return [];
    return n.split(" ").map((w) => w.replace(/^'+|'+$/g, "")).filter(Boolean);
  }

  // 認識エンジンは「one」を「1」や「won」と返すことがある。同じ語として扱う。
  const NUMS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
    "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"];
  const SAME = [
    ["1", "one", "won"], ["2", "two", "to", "too"], ["4", "four", "for", "fore"], ["8", "eight", "ate"],
    ["no", "know"], ["there", "their", "theyre"], ["right", "write"], ["by", "buy", "bye"], ["see", "sea"],
    ["hear", "here"], ["its", "it's"], ["whole", "hole"], ["would", "wood"], ["new", "knew"], ["our", "hour"],
    ["a", "uh"], ["on", "an"], ["in", "inn"], ["so", "sew"], ["weak", "week"], ["which", "witch"],
  ];
  const CANON = new Map();
  NUMS.forEach((w, i) => CANON.set(w, String(i)));
  CANON.set("0", "0");
  for (let i = 0; i <= 20; i++) CANON.set(String(i), String(i));
  SAME.forEach((g) => g.forEach((w) => { if (!CANON.has(w) || ["won", "to", "too", "for", "fore", "ate"].includes(w)) CANON.set(w, g[0]); }));
  function canon(t) { return CANON.get(t) || t; }

  function lev(a, b) {
    const m = a.length, n = b.length;
    if (Math.abs(m - n) > 1) return 2;
    const d = Array.from({ length: m + 1 }, (_, i) => [i]);
    for (let j = 1; j <= n; j++) d[0][j] = j;
    for (let i = 1; i <= m; i++)
      for (let j = 1; j <= n; j++)
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[m][n];
  }

  // 同じ語とみなす。数字・同音語は同じ扱い。5文字以上の語は1文字の違いまで許す。
  function same(a, b) {
    if (a === b) return true;
    if (canon(a) === canon(b)) return true;
    return a.length >= 5 && b.length >= 5 && lev(a, b) <= 1;
  }

  // 文を、表示用の語（空白区切り）と、判定用のトークンに分ける。
  // 例: "state-of-the-art" は表示では1語、トークンでは4つ。
  function prepare(sentence) {
    const all = sentence.split(/\s+/).filter(Boolean).map((raw) => ({ raw, toks: tokens(raw) }));
    const words = all.filter((w) => w.toks.length > 0);
    const flat = [];
    words.forEach((w, wi) => w.toks.forEach((t) => flat.push({ t, wi })));
    return { words, flat };
  }

  // 最長共通部分列で、目標のトークンのうち「言えた」ものに印を付ける
  function align(targetToks, spokenToks) {
    const n = targetToks.length, m = spokenToks.length;
    const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        dp[i][j] = same(targetToks[i - 1], spokenToks[j - 1])
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
    const matched = new Array(n).fill(false);
    let i = n, j = m;
    while (i > 0 && j > 0) {
      if (same(targetToks[i - 1], spokenToks[j - 1])) { matched[i - 1] = true; i--; j--; }
      else if (dp[i - 1][j] >= dp[i][j - 1]) i--;
      else j--;
    }
    return matched;
  }

  // 認識結果の候補が複数あるとき、いちばん一致した候補で判定する
  function judge(text, alternatives) {
    const prep = prepare(text);
    const target = prep.flat.map((x) => x.t);
    let best = null;
    for (const alt of alternatives) {
      const matched = align(target, tokens(alt));
      const count = matched.filter(Boolean).length;
      if (!best || count > best.count) best = { matched, count, heard: alt };
    }
    if (!best) best = { matched: new Array(target.length).fill(false), count: 0, heard: "" };
    const wordOk = prep.words.map(() => true);
    prep.flat.forEach((x, k) => { if (!best.matched[k]) wordOk[x.wi] = false; });
    const missed = prep.words.filter((_, k) => !wordOk[k]).map((w) => w.raw);
    const accuracy = target.length ? best.count / target.length : 0;
    return {
      accuracy,
      words: prep.words.map((w, k) => ({ raw: w.raw, ok: wordOk[k] })),
      missed,
      heard: best.heard,
    };
  }

  function splitSentences(text) {
    return String(text)
      .replace(/\r/g, "")
      .split(/\n+/)
      .flatMap((line) => line.split(/(?<=[.!?])\s+/))
      .map((s) => s.trim())
      .filter((s) => tokens(s).length > 0);
  }

  // 文を、読む区切り（n文ずつ）にまとめる。n が 0 なら全部を1つにする。
  function chunk(sentences, n) {
    if (!n || n <= 0) return [sentences.join(" ")];
    const out = [];
    for (let i = 0; i < sentences.length; i += n) out.push(sentences.slice(i, i + n).join(" "));
    return out;
  }

  const api = { normalize, tokens, canon, same, prepare, align, judge, splitSentences, chunk };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.ReadAloudCore = api;
})(typeof window !== "undefined" ? window : globalThis);
