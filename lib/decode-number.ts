import {binaryDigits, startCode} from "./encode-number.js";

export default function decodeNumber(str: string): number{
	let num = 0;
	for(let i = 0; i < str.length; i++){
		num = num << binaryDigits;
		const newNum = str.charCodeAt(i) - startCode;
		if(newNum < 0 || newNum >= (1 << binaryDigits))
			throw new Error(`Invalid character ${str[i]}, can't be decoded`);
		else num += newNum;
	}
	return num;
}

export {binaryDigits, startCode};