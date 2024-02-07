import decodeNumber from "../../lib/decode-number";
import encodeNumber from "../../lib/encode-number";

describe("decodeNumber", () => {
	test("invalid inputs", () => {
		expect(() => decodeNumber('a"b')).toThrow();
		expect(() => decodeNumber('z')).toThrow();
	});
	test("valid inputs: 1 digit", () => {
		for(let i = 0; i < (1 << 6); i++){
			expect(decodeNumber(encodeNumber(i, 1))).toEqual(i);
		}
	});
	test("valid inputs: 2 digits", () => {
		for(let i = 0; i < (1 << 12); i++){
			expect(decodeNumber(encodeNumber(i, 2))).toEqual(i);
		}
	});
	test("valid inputs: 3 digits", () => {
		for(let i = 0; i < (1 << 18); i++){
			expect(decodeNumber(encodeNumber(i, 3))).toEqual(i);
		}
	});
})