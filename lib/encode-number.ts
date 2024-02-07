export const binaryDigits = 6;
export const startCode = 0x30;
export const startChar = "0"; // same as String.fromCharCode(startCode), just pre-computed
const mask = (1 << binaryDigits) - 1;

export default function encodeNumber(num: number, len: number): string{
	if(!Number.isInteger(num)) throw new Error(`Cannot encode non-integer ${num}`);
	if(num >= 1 << (len * binaryDigits)) throw new Error(`${num} is too large to encode`);
	if(num < 0) throw new Error(`Cannot encode negative value ${num}`);
	let str = "";
	while(num > 0){
		let part = num & mask;
		num = num >> binaryDigits;
		str = String.fromCharCode(startCode + part) + str;
	}
	return str.padStart(len, startChar);
}