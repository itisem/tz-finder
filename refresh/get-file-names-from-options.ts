import {defaultRelease} from "./get-release.js";

interface RefreshOptions{
	// should oceans be included in the geojson? default: false
	includeOceans?: boolean;
	// release id. if not set, get it from github or fallback to default
	release?: string;
	// release type. for values, see https://github.com/evansiroky/timezone-boundary-builder. default: "all"
	since?: "1970" | "all" | "now";
}

interface FileNames{
	url: string;
	unzipped: string;
	tmp: string;
}

export default function getFileNamesFromOptions(options?: RefreshOptions): FileNames{
	// set default release again, if something somehow broke greatly
	const release = options?.release ?? defaultRelease;
	// if oceans are included, "-with-oceans" is appended, otherwise, nothing is
	const oceanText = options?.includeOceans ? "-with-oceans" : "";
	// default to all timezones
	const since = options?.since ?? "all";
	// append appropriate text to type names
	const typeText = since === "1970" ? "-1970" : (since === "now" ? "-now" : "");
	// get the file url
	const url = `https://github.com/evansiroky/timezone-boundary-builder/releases/download/${release}/timezones${oceanText}${typeText}.geojson.zip`;
	// get the unzipped filename
	const unzipped = `combined${oceanText}${typeText}.json`;
	// get a temporary filename for the zip. doesn't depend on options, but it's nice to have around in one helper function
	const zip = `tmp-${Date.now()}.zip`;

	return {url, unzipped, zip};
}