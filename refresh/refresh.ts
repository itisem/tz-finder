 import AdmZip from "adm-zip";

import fs from "fs";
import https from "node:https";
import path from "node:path";

import quantise, {defaultZoom, QuantiseOptions, TZFeatureCollection} from "./quantise.js";
import getRelease from "./get-release.js";
import getFileNamesFromOptions, {RefreshOptions} from "./get-file-names-from-options.js";
import headers from "./headers.js";
import SimpleTimer from "./simple-timer.js";

export interface FullRefreshOptions extends QuantiseOptions, RefreshOptions{
	typescript?: boolean;
}

export default async function refresh(options?: FullRefreshOptions): Promise<void>{
	options = options ?? {};

	const timer = new SimpleTimer();

	console.log("Starting timezone update.")
	options = options ?? {};
	// get release id
	const release = await getRelease(options.release);
	// get release names
	const fileNames = getFileNamesFromOptions({...options, release});

	console.log(`Downloading timezone boundaries. (${timer.section}s)`);

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
					console.log(`Extracting timezone data. (${timer.section}s)`);
					stream.write(Buffer.concat(chunks));
					// end write stream
					stream.end();
					// unzip the file
					const zip = new AdmZip(resolvedFileName);
					const boundaries = JSON.parse(zip.readAsText(fileNames.unzipped));
					console.log(`Number of timezones: ${boundaries.features.length}`);
					// remove file
					fs.unlink(resolvedFileName, () => null);
					// quantise timezones
					console.log(`Quantising timezone boundaries. (${timer.section}s)`);
					console.log("This step can take a few minutes to an hour depending on zoom level, please be patient");
					const quantisation = quantise(boundaries, options);
					// finishing update
					console.log(`Generating code (${timer.section}s)`);
					const codeFileName = path.resolve(__dirname, "../timezone-information.js");
					// write code
					fs.writeFileSync(codeFileName,
						"export default const a = {" +
						"timezones:" + JSON.stringify(quantisation.timezones) +
						",lookup:" + JSON.stringify(quantisation.quantisation) +
						",idxLen:" + quantisation.indexSize.toString() +
						",tzLen:" + quantisation.timezoneSize.toString() +
						",zoom:" + (options.zoom ?? defaultZoom).toString() + "}"
					);
					console.log(`Finished timezone update (total: ${timer.overall}s)`);
					resolve();
				});
			}
		);
	});
	return;
}