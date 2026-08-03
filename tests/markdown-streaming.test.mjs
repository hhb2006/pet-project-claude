import assert from "node:assert/strict";
import test from "node:test";

class FakeNode {
  constructor(tagName = "", text = "") {
    this.tagName = tagName;
    this.nodeText = text;
    this.childNodes = [];
    this.parentNode = null;
    this.className = "";
    this.hidden = false;
  }

  get firstChild() { return this.childNodes[0] || null; }
  get textContent() {
    return this.tagName === "#text"
      ? this.nodeText
      : this.childNodes.map(child => child.textContent).join("");
  }
  set textContent(value) {
    this.replaceChildren(new FakeNode("#text", String(value)));
  }

  appendChild(child) {
    if (child.tagName === "#fragment") {
      while (child.firstChild) this.appendChild(child.firstChild);
      return child;
    }
    if (child.parentNode) {
      const oldIndex = child.parentNode.childNodes.indexOf(child);
      if (oldIndex >= 0) child.parentNode.childNodes.splice(oldIndex, 1);
    }
    child.parentNode = this;
    this.childNodes.push(child);
    return child;
  }

  insertBefore(child, reference) {
    if (child.parentNode) {
      const oldIndex = child.parentNode.childNodes.indexOf(child);
      if (oldIndex >= 0) child.parentNode.childNodes.splice(oldIndex, 1);
    }
    const index = this.childNodes.indexOf(reference);
    child.parentNode = this;
    this.childNodes.splice(index < 0 ? this.childNodes.length : index, 0, child);
    return child;
  }

  replaceChildren(...children) {
    for (const child of this.childNodes) child.parentNode = null;
    this.childNodes = [];
    for (const child of children) this.appendChild(child);
  }
}

globalThis.document = {
  createElement: tagName => new FakeNode(tagName),
  createTextNode: text => new FakeNode("#text", text),
  createDocumentFragment: () => new FakeNode("#fragment"),
};
globalThis.window = { location: { href: "https://example.test/" } };

await import("../public/markdown.js");

test("streaming Markdown keeps completed blocks and only replaces the live block", () => {
  const target = document.createElement("div");
  const stream = window.createStreamingMarkdownRenderer(target);

  stream.append("First **bold** paragraph.\n\nSecond");
  const completedFirstParagraph = target.childNodes[0];
  const liveBlock = target.childNodes[1];
  assert.equal(completedFirstParagraph.tagName, "p");
  assert.equal(completedFirstParagraph.textContent, "First bold paragraph.");
  assert.equal(liveBlock.textContent, "Second");

  stream.append(" paragraph");
  assert.equal(target.childNodes[0], completedFirstParagraph);
  assert.equal(liveBlock.textContent, "Second paragraph");

  stream.append("\n\n- one\n- two");
  const completedSecondParagraph = target.childNodes[1];
  assert.equal(target.childNodes[0], completedFirstParagraph);
  assert.equal(completedSecondParagraph.textContent, "Second paragraph");
  assert.equal(liveBlock.textContent, "onetwo");

  stream.append("\n- three");
  assert.equal(target.childNodes[0], completedFirstParagraph);
  assert.equal(target.childNodes[1], completedSecondParagraph);
  assert.equal(liveBlock.textContent, "onetwothree");
});

test("blank lines inside an open code fence do not commit a partial block", () => {
  const target = document.createElement("div");
  const stream = window.createStreamingMarkdownRenderer(target);

  stream.append("```js\nconst value = 1;\n\nstill code");
  assert.equal(target.childNodes.length, 1);
  const liveBlock = target.firstChild;

  stream.append("\n```\n\nAfter");
  assert.equal(target.childNodes.length, 2);
  assert.equal(target.childNodes[0].tagName, "pre");
  assert.equal(target.childNodes[0].textContent, "const value = 1;\n\nstill code");
  assert.equal(target.childNodes[1], liveBlock);
  assert.equal(liveBlock.textContent, "After");
});
