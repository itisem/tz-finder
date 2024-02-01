import getRecentRelease from "../../refresh/get-release";

const releaseFormat = /^[0-9]{4}[a-z]$/;

describe("getRecentRelease", () => {
	test("gets release accurately", async () => {
		const realRelease = await getRecentRelease();
		expect((realRelease ?? "").match(releaseFormat)).toBeTruthy();

		// it is not worth testing this with a mock response since unless github fails miserably, this will always be correct
	});
});