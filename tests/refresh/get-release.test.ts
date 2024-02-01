import getRelease from "../../refresh/get-release";

describe("getRelease", () => {
	test("gets release accurately", async () => {
		const releaseFormat = /^[0-9]{4}[a-z]$/;

		const realRelease = await getRelease();
		expect((realRelease ?? "").match(releaseFormat)).toBeTruthy();

		// it is not worth testing this with a mock response since unless github fails miserably, this will always be correct
	});
});