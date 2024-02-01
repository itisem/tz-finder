import getRelease from "../../refresh/get-release";
import * as getRecentRelease from "../../refresh/get-recent-release";

const releaseFormat = /^[0-9]{4}[a-z]$/;


describe("getRelease", () => {
	test("supplied release id", () => {
		expect(getRelease("2016a")).resolves.toBe("2016a");
		expect(getRelease("W0W")).resolves.toBe("W0W");
	});
	test("no release id", async () => {
		const release = await getRelease();
		expect(release.length).toEqual(5);
		expect(release.match(releaseFormat)).toBeTruthy();
		expect(release >= "2023d").toBe(true);

		getRecentRelease = jest.fn(async () => Promise.reject());
		expect(getRelease()).resolves.toBe("2023d");
	});
});