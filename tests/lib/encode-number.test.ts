import encodeNumber from "../../lib/encode-number";

describe("encodeNumber", () => {
	test("erroneous inputs", () => {
		expect(() => encodeNumber(10, 0)).toThrow();
		expect(() => encodeNumber(64, 1)).toThrow();
		expect(() => encodeNumber(4096, 2)).toThrow();
		expect(() => encodeNumber(-1, 2)).toThrow();
		expect(() => encodeNumber(3.5, 2)).toThrow();
	});
	test("valid inputs", () => {
		expect(encodeNumber(9, 1)).toEqual("9");
		expect(encodeNumber(0, 2)).toEqual("00");
		expect(encodeNumber(9, 2)).toEqual("09");
		expect(encodeNumber(66, 2)).toEqual("12");
	})
});