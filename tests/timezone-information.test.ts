import tzInfo from "../timezone-information";
import decodeNumber from "../lib/decode-number";

describe("timezone-information", () => {
	test("indices have a valid ordering", () => {
		const {lookup, tzLen, idxLen} = tzInfo;
		const totalLen = tzLen + idxLen;
		for(let i = 0; i < lookup.length; i++){
			const lookupLine = lookup[i];
			const rowLen = (lookupLine.length) / totalLen;
			for(let i = 0; i < rowLen - 1; i++){
				expect(
					decodeNumber(lookupLine.substring(i * totalLen, i * totalLen + idxLen))
				).toBeLessThan(
					decodeNumber(lookupLine.substring((i + 1) * totalLen, (i + 1) * totalLen + idxLen))
				)
			}
		}
	})
});