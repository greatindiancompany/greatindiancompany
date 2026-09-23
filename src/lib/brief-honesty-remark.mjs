/**
 * Soften boilerplate that claims a verified shift or a source-backed reading.
 * Source lists are removed here and re-rendered only when the link matches
 * the brief topic. Article files are left unchanged.
 */

const REMOVED_SECTIONS = new Set([
  'source-backed reading path',
  'source links',
  'primary sources',
  'seo keyphrases',
]);

function nodeText(node) {
  if (!node) {
    return '';
  }
  if (node.type === 'text' || node.type === 'inlineCode') {
    return node.value || '';
  }
  if (!Array.isArray(node.children)) {
    return '';
  }
  return node.children.map((child) => nodeText(child)).join('');
}

function replacementFor(text) {
  if (/verifiable shifts/i.test(text)) {
    return 'This outline does not report a checked change.';
  }
  if (/assessed against official releases/i.test(text)) {
    return 'These notes were not checked against official releases.';
  }
  if (/using publicly available primary sources/i.test(text)) {
    return 'This article is an English template for Great Indian Company. It does not check registry documents.';
  }
  if (/public-source reading/i.test(text)) {
    return 'This is an English template for Great Indian Company. It is not a checked reading of listed sources.';
  }
  if (/synthesizes public information from/i.test(text)) {
    return 'This brief is an English template. It does not verify registry links paired with this topic.';
  }
  if (/measurable shift in policy/i.test(text)) {
    return 'No checked change in policy or operating conditions is reported here.';
  }
  if (/source-driven analysis/i.test(text)) {
    return 'This article is an English template about the topic in the title. It does not analyze checked sources.';
  }
  if (/attribute claims to primary sources/i.test(text)) {
    return 'This template does not separate checked facts from inference, because the pipeline does not verify sources.';
  }
  if (/recent public disclosures indicate movement/i.test(text)) {
    return 'This template does not report a checked change in public disclosures.';
  }
  if (/source-first reading improves confidence/i.test(text)) {
    return 'This template does not raise confidence with checked citations.';
  }
  return null;
}

function softenNode(node) {
  if (!node || !Array.isArray(node.children)) {
    return;
  }

  if (node.type === 'paragraph' || node.type === 'listItem') {
    const replacement = replacementFor(nodeText(node).trim());
    if (replacement) {
      const text = { type: 'text', value: replacement };
      node.children =
        node.type === 'paragraph' ? [text] : [{ type: 'paragraph', children: [text] }];
      return;
    }
  }

  for (const child of node.children) {
    softenNode(child);
  }
}

function scrubRemaining(node) {
  if (!node) {
    return;
  }
  if (node.type === 'text' && typeof node.value === 'string') {
    node.value = node.value
      .replace(/source-backed/gi, 'template')
      .replace(/verifiable shifts/gi, 'unchecked notes')
      .replace(/evidence-based/gi, 'template');
  }
  for (const child of node.children || []) {
    scrubRemaining(child);
  }
}

function sectionEnd(children, start, depth) {
  for (let index = start + 1; index < children.length; index += 1) {
    const node = children[index];
    if (node.type === 'heading' && node.depth <= depth) {
      return index;
    }
  }
  return children.length;
}

export function applyBriefHonesty(tree) {
  const source = Array.isArray(tree?.children) ? tree.children : [];
  const next = [];

  for (let index = 0; index < source.length; index += 1) {
    const node = source[index];
    if (node.type === 'heading') {
      const title = nodeText(node).trim().toLowerCase();
      if (REMOVED_SECTIONS.has(title)) {
        index = sectionEnd(source, index, node.depth) - 1;
        continue;
      }
      if (title === 'evidence and interpretation') {
        node.children = [{ type: 'text', value: 'Template note' }];
      }
    }
    softenNode(node);
    next.push(node);
  }

  tree.children = next;
  scrubRemaining(tree);
  return tree;
}

export function briefHonestyRemark() {
  return (tree) => {
    applyBriefHonesty(tree);
  };
}
