import fs from "fs";
import https from "node:https";
import path from "node:path";

import getRelease from "./get-release.js";
import headers from "./headers.js";

// the default release date in case the github lookup fails
const defaultRelease = "2023d";

interface RefreshOptions{
	// should oceans be included in the geojson? default: true
	includeOceans?: boolean;
	// release id. if not set, get it from github or fallback to default
	release?: string;
	// release type. for values, see https://github.com/evansiroky/timezone-boundary-builder. default: "all"
	releaseType?: "1970" | "all" | "now";
}

export default async function refresh(options?: RefreshOptions){
	let release: string;
	// use supplied release id
	if(options?.release) release = options.release;
	// get release id from github if possible, otherwise set to default
	else await getRelease().then((r: string) => {
		release = r;
	}).catch(() => {
		release = defaultRelease;
	});
	// get release url
	const oceanText = (options?.includeOceans ?? true) ? "-with-oceans" : "";
	const releaseType = options?.releaseType ?? "all";
	const typeText = releaseType === "1970" ? "-1970" : (releaseType === "now" ? "-now" : "");
	const fileUrl = `https://github.com/evansiroky/timezone-boundary-builder/releases/download/${release}/timezones${oceanText}${typeText}.geojson.zip`;

	// get zip file final url
	// relies on having a single redirect, which may not always be true
	// but this method has worked for github for a long time, so we assume that it will
	// in order to have a reduced dependency count
	const finalUrl = await new Promise((resolve, reject) => {
		https.get(
			fileUrl,
			{headers},
			(res) => {
				if(res.statusCode === 302) resolve(res.headers.location);
				else reject("Error while attempting to follow redirect.");
			}
		)
	}).catch((e) => console.warn(e));

	// create a placeholder file for our binaries
	const zipFileName = `tmp-${Date.now()}.zip`;
	const stream = fs.createWriteStream(path.resolve(__dirname, zipFileName));
	// actually download the final url
	await new Promise((resolve, reject) => {
		https.get(
			finalUrl,
			{headers},
			(res) => {
				if(res.statusCode !== 200) reject("Failed to download new timezone boundary file");
				res.on("data", data => {
					console.log(data);
					stream.write(data)
				});
				res.on("end", () => {
					stream.end();
					resolve();
				});
			}
		);
	});
	
	// unzip the file
}