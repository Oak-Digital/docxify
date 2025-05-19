# Docxify internals

This document describes how Docxify works and how it turns an html document into a docx document.

## Overview

![docxify overview](https://github.com/user-attachments/assets/006a1a6e-776e-407f-a9d6-f5b3b9b15889)

1. parse HTML using [`htmlparser2`](https://github.com/fb55/htmlparser2)
2. transform to docx hierarchy
3. "Serialize" tags with their own "serializer".
4. Pack up the docx from the serialized data

## Transform to docx hierarchy

Even though docx uses xml, we cannot directly translate an html tag to a corresponding xml tag for docx.
Docx also needs a strict hierarchy, which is outlined in the following list

1. section
2. block (paragraph/table)
3. inline

This means that if that if there is a `<p>` inside of a `<p>`, the inner `<p>` must be "up" while still maintaining state (font size, text color, etc.).
This needs to be done such that all paragraphs are on the same level.

Inline elements might also need to be at the same level, with some exceptions.
For example an anchor can still have inline children.
