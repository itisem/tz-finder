import tzInfo from "./timezone-information.js";
import decodeNumber from "./lib/decode-number.js";
import {getTileFromLatLng} from "@gmaps-tools/tile-coordinates";

export default function getTimezone(
	lat: number,
	lng: number,
	tz?: {timezones: string[], lookup: string[], tzLen: number, idxLen: number, zoom: number}
): string{
	tz = tz ?? tzInfo;
	const {timezones, lookup, tzLen, idxLen, zoom} = tz;
	const tile = getTileFromLatLng({lat, lng}, zoom);
	const unitLen = tzLen + idxLen;

	const findTile = (searchIndex: number) => parseInt(
		lookupLine.substring(unitLen * searchIndex, unitLen * searchIndex + idxLen),
		36
	);

	// get the actual tile information
	const lookupLine = lookup[tile.x];
	const lookupTile = tile.y;
	let searchStart = 0; // where the tile may be found (start)
	let searchEnd = lookupLine.length / unitLen - 1; // where the tile may be found (end)
	let tileStart = 0; // what tile it may be (start)
	let tileEnd = findTile(searchEnd);
	// fast special cases
	if(lookupTile === 0) searchEnd = 0;
	if(tileEnd <= lookupTile) searchStart = searchEnd;

	// narrow down range until found
	while(searchStart !== searchEnd){
		// special case if the diff is 1, since we already know what happens next
		if(searchEnd - searchStart === 1){
			// we know that we must have found the right tile
			searchEnd = searchStart;
			continue;
		}

		// assume that each timezone is roughly the same size, check based on that
		// basically, just linearly scaling the [searchStart, searchEnd] to [tileStart, tileEnd]
		let searchIndex = Math.floor(
			(lookupTile - tileStart) / (tileEnd - tileStart) * (searchEnd - searchStart) + searchStart
		);
		// fixing index if the interval is narrow and it'd use the start
		searchIndex = searchIndex === searchStart ? searchIndex + 1 : searchIndex;

		// get what tile it is
		const searchTile = findTile(searchIndex);
		switch(Math.sign(lookupTile - searchTile)){
			case -1: // the tile is lower than searchTile
				tileEnd = searchTile;
				searchEnd = searchIndex;
				break;
			case 0: // we found the tile!
				searchStart = searchIndex;
				searchEnd = searchIndex;
				break;
			case 1: // this tile is still too early
				tileStart = searchTile;
				searchStart = searchIndex;
		}
	}
	// use searchStart (which is the same as searchEnd) as our tile id, and look up timezone id based on that
	const timezoneId = parseInt(lookupLine.substring(unitLen * searchStart + idxLen, unitLen * (searchStart + 1)), 36);
	return timezones[timezoneId] as string;
}