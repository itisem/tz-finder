import {find} from "geo-tz";
import tzlookup from "@photostructure/tz-lookup";

import getTimezone from "../index";
import SimpleTimer from "../refresh/simple-timer";

const trials = 1000000;

let times = {tzfinder: 0, tzlookup: 0, geotz: 0};
let accuracy = {tzfinder: 0, tzlookup: 0};

const timer = new SimpleTimer();

for(let i = 0; i < trials; i++){
	// get random lat, lng
	const lat = Math.random() * 170 - 85; // within the [-85, 85) range since ocean timezones on the poles rarely matter
	const lng = Math.random() * 360 - 180;

	// make sure that overhead cannot bias our results
	// this should not be an issue, but just in case
	timer.section;
	// first, get tz-finder results
	const tzFinderResult = getTimezone(lat, lng);
	times.tzfinder += timer.section;
	// then, get tz-lookup result
	const tzlookupResult = tzlookup(lat, lng);
	times.tzlookup += timer.section;
	//finally, get geo-tz result
	const geoTzResult = find(lat, lng);
	times.geotz += timer.section;
	// and then add accuracy details
	if(geoTzResult.includes(tzFinderResult)) accuracy.tzfinder += 1;
	if(geoTzResult.includes(tzlookupResult)) accuracy.tzlookup += 1;
}

console.log(`${trials} trials:`);
console.log(`geo-tz: 100% accuracy, ${trials / times.geotz} lookups / second`);
console.log(`tz-lookup: ${Math.round(accuracy.tzfinder / trials * 10000) / 100}% accuracy, ${trials / times.tzfinder} lookups / second`);
console.log(`tz-finder: ${Math.round(accuracy.tzlookup / trials * 10000) / 100}% accuracy, ${trials / times.tzlookup} lookups / second`);