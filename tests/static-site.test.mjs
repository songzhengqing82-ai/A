import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (name) => readFile(new URL(`../${name}`, import.meta.url), "utf8");

test("HTML links the standalone CSS and JavaScript assets", async () => {
  const html = await read("index.html");
  assert.match(html, /<meta charset="UTF-8">/);
  assert.match(html, /href="\.\/styles\.css"/);
  assert.match(html, /src="\.\/app\.js"/);
  assert.match(html, /id="task-list"/);
});

test("application retains the existing storage key and core actions", async () => {
  const script = await read("app.js");
  assert.match(script, /muyu-tasks/);
  assert.match(script, /localStorage\.getItem/);
  assert.match(script, /data-filter/);
  assert.match(script, /clear-completed/);
  assert.match(script, /切换重要任务/);
});

test("Chinese interface copy is valid UTF-8 text", async () => {
  const [html, script] = await Promise.all([read("index.html"), read("app.js")]);
  assert.match(html, /把今天/);
  assert.match(script, /规划今天最重要的三件事/);
  assert.doesNotMatch(`${html}${script}`, /锛|鈫|瑙勫垝/);
});
