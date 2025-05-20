import { parseArgs } from "node:util";
import { generateDocx } from "../src/html-to-docx";

const { values, positionals } = parseArgs({
  args: Bun.argv,
  strict: true,
  allowPositionals: true,
});

const filePath = positionals[2];

if (!filePath || !filePath.endsWith(".html")) {
  console.error("Please provide a file path to an html file.");
  process.exit(1);
}

const file = Bun.file(filePath);
const fileContent = await file.text();

const docx = await (await generateDocx(fileContent)).toBuffer();

// change extension of filePath to .docx
const docxFilePath = filePath.replace(/\.html$/, ".docx");

// await Bun.file(docxFilePath).write(docx);
await Bun.write(docxFilePath, docx);
