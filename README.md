# docxify

> [!NOTE]
> This library is still in development and the documentation might not be complete and the api may not be implemented completely yet,

Create DOCX files from HTML. Works in browser, Node.js and Bun (and probably other runtimes as well).

## Motivation

Converting an html document into a DOCX file is possible with other tools.
One example is [pandoc](https://pandoc.org/), this is trivial to use and works for most use cases.
However once you need custom logic or different ways of handling, it might become more challenging since you need to write custom filters.

It will also be easier to use a javascript/typescript library, if you are already using js.

Another bonus is also that you can run it directly in the browser, which allows users to get a DOCX document without needing server interactions, so it will also work offline.

Another reason for making this library, is that if you are using a headless editor in javascript (such as [tiptap](https://tiptap.dev/)), they can almost always output html.
In contrast to projects like [prosemirror-docx](https://github.com/curvenote/prosemirror-docx) (which could work with tiptap), it will be easy to switch to another editor which can also output html.

## Getting started

Install with your package manager

```bash
bun add @oak-digital/docxify
```

```bash
pnpm add @oak-digital/docxify
```

```bash
yarn add @oak-digital/docxify
```

```bash
npm install @oak-digital/docxify
```

**Generate a document**

```ts
const html = `<p>
    Hello world
</p>`;

// Node / Bun
const docx = await generateDocx(html).toBuffer();
fs.writeFileSync("output.docx", docx);

// Browser
const docx = await generateDocx(html).toBlob();
// Download
const file = URL.createObjectUrl(docx);
window.location.assign(file);
```

## Concepts

### Serializers

A serializer is a class that handles an html element and does one or more of the following

- creates either a block or inline docx element.
- updates the text modifiers for this and child elements.

When a serializer creates a docx element it must return an instance of a [`docx`](https://github.com/dolanmiu/docx) class.

## License

This library is licensed under the [MIT license](./LICENSE)
