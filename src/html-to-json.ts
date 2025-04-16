import type { ChildNode } from "domhandler";
import { DomHandler, Parser } from "htmlparser2";

export const parseHtml = (html: string) => {
	return new Promise<ChildNode[]>((resolve, reject) => {
		const handler = new DomHandler((error, dom) => {
			if (error) {
				reject(error);
				return;
			}

			resolve(dom);
		});

		const parser = new Parser(handler);
		parser.write(html);
		parser.end();
	});
};
