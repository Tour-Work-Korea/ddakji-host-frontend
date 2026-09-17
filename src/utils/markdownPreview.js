import {MarkdownIt} from 'react-native-markdown-display';

const markdown = new MarkdownIt({html: false});

// Parse before limiting preview lines so headings, lists and multiline formatting
// are interpreted together. Keep visible text without rendering links or images.
export const markdownToPreviewText = value => {
  const source = String(value ?? '');
  const readTokens = tokens =>
    tokens
      .map(token => {
        if (token.type === 'text') {
          // Server previews may end before a closing bold/strike delimiter.
          // Clean dangling opening markers only in prose, preserving code and escapes.
          return token.content.replace(
            /(^|[\s([{])(\*\*|__|~~)(?=\S)/g,
            (match, prefix, marker) => source.includes(`\\${marker}`) ? match : prefix,
          );
        }
        if (token.type === 'code_inline') {
          return token.content;
        }
        if (token.type === 'image') {
          return '';
        }
        if (token.children) {
          return readTokens(token.children);
        }
        if (token.type === 'fence' || token.type === 'code_block') {
          return `${token.content}\n`;
        }
        if (
          token.type === 'softbreak' ||
          token.type === 'hardbreak' ||
          (token.block && token.nesting === -1)
        ) {
          return '\n';
        }
        return '';
      })
      .join('');

  return readTokens(markdown.parse(source, {}))
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .join('\n');
};
