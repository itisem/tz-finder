import getFileNamesFromOptions from "../../refresh/get-file-names-from-options";

describe("getFileNamesFromOptions", () => {
	test("no options", () => {
		expect(getFileNamesFromOptions()).toMatchObject({
			url: "https://github.com/evansiroky/timezone-boundary-builder/releases/download/2023d/timezones.geojson.zip",
			unzipped: "combined.json"
		});
	});
	test("1970", () => {
		expect(getFileNamesFromOptions({release: "2022a", since: "1970"})).toMatchObject({
			url: "https://github.com/evansiroky/timezone-boundary-builder/releases/download/2022a/timezones-1970.geojson.zip",
			unzipped: "combined-1970.json"
		});
	});
	test("now", () => {
		expect(getFileNamesFromOptions({release: "2022a", since: "now"})).toMatchObject({
			url: "https://github.com/evansiroky/timezone-boundary-builder/releases/download/2022a/timezones-now.geojson.zip",
			unzipped: "combined-now.json"
		});
	});
	test("no oceans", () => {
		expect(getFileNamesFromOptions({release: "2022a", includeOceans: true})).toMatchObject({
			url: "https://github.com/evansiroky/timezone-boundary-builder/releases/download/2022a/timezones-with-oceans.geojson.zip",
			unzipped: "combined-with-oceans.json"
		});
	});
	test("no oceans 1970", () => {
		expect(getFileNamesFromOptions({release: "2022a", since: "1970", includeOceans: true})).toMatchObject({
			url: "https://github.com/evansiroky/timezone-boundary-builder/releases/download/2022a/timezones-with-oceans-1970.geojson.zip",
			unzipped: "combined-with-oceans-1970.json"
		});
	});
	test("no oceans now", () => {
		expect(getFileNamesFromOptions({release: "2022a", since: "now", includeOceans: true})).toMatchObject({
			url: "https://github.com/evansiroky/timezone-boundary-builder/releases/download/2022a/timezones-with-oceans-now.geojson.zip",
			unzipped: "combined-with-oceans-now.json"
		});
	});
});