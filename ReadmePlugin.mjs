// a Very Bad readme generator

import doctrine from 'doctrine';
import fs from 'fs';
import getHacks from './getHacks';

const l = getHacks().length;
const headers = [];

function write() {
	var contents = headers
		.filter(h => h)
		.map(header =>
			doctrine.parse(header, {
				unwrap: true,
				recoverable: true,
			})
		)
		.map(jsdoc => {
			var o = {};
			o.emoji = jsdoc.description;
			Object.values(jsdoc.tags).forEach(tag => {
				o[tag.title] = tag.description;
			});
			o.file = o.file || '';
			o.url = `/dist/${encodeURI(o.file.replace(/\s/g, '-'))}.js`;
			return o;
		})
		.sort((a, b) => a.file.localeCompare(b.file, 'en', { sensitivity: 'base', ignorePunctuation: true }));
	fs.writeFileSync(
		'README.md',
		`# bipsi hacks

A collection of re-usable scripts for [candle](https://twitter.com/ragzouken)'s [bipsi](https://kool.tools/bipsi).

- [Contents](#contents)
- [How to use](#how-to-use)

## Contents

${contents.map(hack => `- ${hack.emoji} [${hack.file}](${hack.url}): ${hack.summary}`).join('\n')}

## How to use

todo`
	);
}

// eslint-disable-next-line import/no-default-export
export default function () {
	return {
		// grab headers
		renderChunk(code) {
			const pattern = /^(\/\*\*[\S\s]*?\*\/)$/gm;
			const matches = code.match(pattern);
			if (!matches) {
				console.warn("Couldn't find jsdoc");
				headers.push(null);
				return code;
			}
			const header = matches[matches.length - 1];
			headers.push(header);
			return code;
		},
		writeBundle() {
			if (headers.length === l) {
				write();
			}
		},
	};
}
