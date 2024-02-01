import AdmZip from "adm-zip";

import fs from "fs";
import https from "node:https";
import path from "node:path";

import getRelease from "./get-release.js";
import getFileNamesFromOptions from "./get-file-names-from-options.js";
import headers from "./headers.js";

export default async function refresh(options?: RefreshOptions): Promise<void>{
	options = options ?? {};
	// get release id
	const release = await getRelease(options.release);
	// get release names
	const fileNames = getFileNamesFromOptions({...options, release});
	console.log(fileNames);

	// get zip file final url
	// relies on having a single redirect, which may not always be true
	// but this method has worked for github for a long time, so we assume that it will
	// in order to have a reduced dependency count
	const finalUrl = await new Promise((resolve, reject) => {
		https.get(
			fileNames.url,
			{headers},
			(res) => {
				if(res.statusCode === 302) resolve(res.headers.location);
				else reject("Error while attempting to follow redirect.");
			}
		)
	}).catch((e) => console.warn(e));

	// create a placeholder file for our binaries
	const resolvedFileName = path.resolve(__dirname, fileNames.zip);
	const stream = fs.createWriteStream(resolvedFileName, {flags: "a", encoding: null});
	// actually download the final url
	await new Promise((resolve, reject) => {
		https.get(
			finalUrl,
			{headers, encoding: null},
			(res) => {
				// ensure that data is binary
				res.setEncoding("binary");
				if(res.statusCode !== 200) reject("Failed to download new timezone boundary file");
				// data error fixes, as per https://stackoverflow.com/a/49600958
				let chunks: Buffer[] = [];
				res.on("data", data => chunks.push(Buffer.from(data, "binary")));
				res.on("end", () => {
					stream.write(Buffer.concat(chunks));
					// end write stream
					stream.end();
					// unzip the file
					const zip = new AdmZip(resolvedFileName);
					const boundaries = JSON.parse(zip.readAsText(fileNames.unzipped));
					console.log(boundaries);
					// remove file
					fs.unlink(resolvedFileName, () => null);
					resolve();
				});
			}
		);
	});
	return Promise.resolve();
}

refresh({since: "1970", includeOceans: false});