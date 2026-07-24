// Small, dependency-free Markdown renderer for assistant messages.
// It builds DOM nodes instead of assigning generated HTML, so raw HTML in a
// model response is displayed as text and cannot execute.
(function () {
  "use strict";

  function appendInline(parent, source) {
    const pattern = /(\*\*([^*\n]+)\*\*|__([^_\n]+)__|`([^`\n]+)`|\[([^\]\n]+)\]\(([^)\s]+)\)|\*([^*\n]+)\*|_([^_\n]+)_)/g;
    let cursor = 0;
    let match;

    while ((match = pattern.exec(source)) !== null) {
      if (match.index > cursor) {
        parent.appendChild(document.createTextNode(source.slice(cursor, match.index)));
      }

      if (match[2] !== undefined || match[3] !== undefined) {
        const strong = document.createElement("strong");
        strong.textContent = match[2] !== undefined ? match[2] : match[3];
        parent.appendChild(strong);
      } else if (match[4] !== undefined) {
        const code = document.createElement("code");
        code.textContent = match[4];
        parent.appendChild(code);
      } else if (match[5] !== undefined) {
        appendLink(parent, match[5], match[6]);
      } else {
        const emphasis = document.createElement("em");
        emphasis.textContent = match[7] !== undefined ? match[7] : match[8];
        parent.appendChild(emphasis);
      }
      cursor = pattern.lastIndex;
    }

    if (cursor < source.length) {
      parent.appendChild(document.createTextNode(source.slice(cursor)));
    }
  }

  function appendLink(parent, label, href) {
    try {
      const url = new URL(href, window.location.href);
      if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("Unsafe link");
      const link = document.createElement("a");
      link.href = url.href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = label;
      parent.appendChild(link);
    } catch {
      parent.appendChild(document.createTextNode(`[${label}](${href})`));
    }
  }

  function isBlockStart(line) {
    return /^```/.test(line) ||
      /^(#{1,6})\s+/.test(line) ||
      /^\s*[-*+]\s+/.test(line) ||
      /^\s*\d+[.)]\s+/.test(line) ||
      /^>\s?/.test(line);
  }

  function renderMarkdown(target, markdown) {
    target.replaceChildren();
    const lines = String(markdown || "").replace(/\r\n?/g, "\n").split("\n");
    const fragment = document.createDocumentFragment();
    let index = 0;

    while (index < lines.length) {
      const line = lines[index];
      if (!line.trim()) {
        index += 1;
        continue;
      }

      if (/^```/.test(line)) {
        const codeLines = [];
        index += 1;
        while (index < lines.length && !/^```\s*$/.test(lines[index])) {
          codeLines.push(lines[index]);
          index += 1;
        }
        if (index < lines.length) index += 1;
        const pre = document.createElement("pre");
        const code = document.createElement("code");
        code.textContent = codeLines.join("\n");
        pre.appendChild(code);
        fragment.appendChild(pre);
        continue;
      }

      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        const level = Math.min(headingMatch[1].length + 2, 6);
        const heading = document.createElement(`h${level}`);
        appendInline(heading, headingMatch[2]);
        fragment.appendChild(heading);
        index += 1;
        continue;
      }

      const unordered = /^\s*[-*+]\s+/.test(line);
      const ordered = /^\s*\d+[.)]\s+/.test(line);
      if (unordered || ordered) {
        const list = document.createElement(ordered ? "ol" : "ul");
        const itemPattern = ordered ? /^\s*\d+[.)]\s+(.+)$/ : /^\s*[-*+]\s+(.+)$/;
        while (index < lines.length) {
          const itemMatch = lines[index].match(itemPattern);
          if (!itemMatch) break;
          const item = document.createElement("li");
          appendInline(item, itemMatch[1]);
          list.appendChild(item);
          index += 1;
        }
        fragment.appendChild(list);
        continue;
      }

      if (/^>\s?/.test(line)) {
        const quoteLines = [];
        while (index < lines.length && /^>\s?/.test(lines[index])) {
          quoteLines.push(lines[index].replace(/^>\s?/, ""));
          index += 1;
        }
        const quote = document.createElement("blockquote");
        appendInline(quote, quoteLines.join(" "));
        fragment.appendChild(quote);
        continue;
      }

      const paragraphLines = [];
      while (index < lines.length && lines[index].trim() && !isBlockStart(lines[index])) {
        paragraphLines.push(lines[index].trim());
        index += 1;
      }
      const paragraph = document.createElement("p");
      appendInline(paragraph, paragraphLines.join(" "));
      fragment.appendChild(paragraph);
    }

    target.appendChild(fragment);
  }

  window.renderMarkdown = renderMarkdown;
})();
