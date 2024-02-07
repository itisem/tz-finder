import bbox from "@turf/bbox";
import pointInPolygon from "@turf/boolean-point-in-polygon";
import {point, polygon} from "@turf/helpers";
import {getCenterLatFromTile, getCenterLngFromTile, getTileFromLatLng} from "@gmaps-tools/tile-coordinates";
import encodeNumber, {binaryDigits} from "../lib/encode-number";

export interface QuantiseOptions{
	zoom?: number;
	allowHighZoom?: boolean;
}

export type Quantisation = [number, number][];

export interface TZFeatureCollection{
	type: "FeatureCollection";
	features: TZFeature[];
};

interface TZFeature{
	type: "Feature";
	properties: {
		tzid: string;
	}
	geometry: TZGeometry;
};

interface TZGeometry{
	type: "Polygon" | "MultiPolygon";
	coordinates: Coordinates[];
};

type Coordinates = ([number, number] | Coordinates)[];

export const defaultZoom = 12;

export default function quantise(
	features: FeatureCollection,
	options: QuantiseOptions
): {timezones: string[], quantisation: string[], indexSize: number, timezoneSize: number}{
	const zoom = options?.zoom ?? defaultZoom;
	const rows = 1 << zoom;

	// don't allow suboptimal zoom settings
	if(zoom > 16 && !options?.allowHighZoom){
		console.warn("For high zoom levels, it is much more optimal to use the original geoJSON boundaries with the geo-tz library.");
		console.warn("If, for some reason, you still wish to use tz-finder, re-run the regenerate script with --allow-high-zoom");
		return;
	}
	if(!Number.isInteger(zoom)) throw new Error("Zoom level must be an integer");

	// set up quantisation arrays
	let basicQuantisation: Set<number>[][] = [...Array(rows)].map(x => [...Array(rows)].map(x => new Set()));
	let timezones: string[] = [];
	let timezonesByName: {[key: string]: number} = {};

	// calculate tile centres
	const latCentre = [...Array(rows).keys()].map(i => getCenterLatFromTile(i, zoom));
	const lngCentre = [...Array(rows).keys()].map(i => getCenterLngFromTile(i, zoom));

	// set up a basic quantisation that *may* contain some problems if the original geojsons aren't perfectly fitted
	for(let i = 0; i < features.features.length; i++){
		const feature = features.features[i];

		// add timezone information
		timezones.push(feature.properties.tzid);
		timezonesByName[feature.properties.tzid] = i;

		// separate multi-polygons in order to ensure that there is no need to check too many inclusions
		if(feature.geometry.type === "Polygon"){
			basicQuantisation = quantisationHelper(feature, latCentre, lngCentre, basicQuantisation, i, zoom);
		}
		else{
			for(let poly of feature.geometry.coordinates){
				basicQuantisation = quantisationHelper(polygon(poly), latCentre, lngCentre, basicQuantisation, i, zoom);
			}
		}

	}

	// use fixed size entries for calculations
	const ln = Math.log(1 << binaryDigits); // base 36 since this can do parseInt and is equally compact for zoom level 10 as base 64
	const indexSize = Math.ceil(Math.log(rows) / ln);
	const timezoneSize = Math.ceil(Math.log(features.features.length) / ln);

	// set up ocean timezones if they don't exist yet
	for(let i = -12; i <= 12; i++){
		const gmtTimezoneName = oceanName(i);
		if(timezonesByName[gmtTimezoneName] === undefined){
			timezonesByName[gmtTimezoneName] = timezones.length;
			timezones.push(gmtTimezoneName);
		}
	}
	
	// fix the geojson and create a final quantisation table
	let quantisation: string[] = [];
	for(let i = 0; i < rows; i++){
		const row = basicQuantisation[i]
		// set up quantisation row
		quantisation.push("");

		// setting up helpers
		let lastTimezone = -1;
		for(let j = 0; j < rows; j++){
			let cell = row[j];
			// using simple lookups to fix erroneous cells
			// this is *not* the optimal solution, but it's a sufficient one, since errors are very rare
			// and area calculations are expensive
			if(cell.size !== 1){
				// make sure we don't run later fixes if the first one already worked
				let cellIsFixed: boolean = false;

				// first, fix known border conflicts
				if(cell.size > 1){
					const timezoneNames = Array.from(cell).map(x => timezones[x]);
					// certain timezone issues are resolved by using the "special" timezone to indicate issues
					// end-users can resolve this by remapping the timezones themselves
					if(timezoneNames.includes("Asia/Urumqi")){
						row[j] = new Set([timezonesByName["Asia/Urumqi"]]);
						cellIsFixed = true;
					}
					if(timezoneNames.includes("Asia/Hebron")){
						row[j] = new Set([timezonesByName["Asia/Hebron"]]);
						cellIsFixed = true;
					}
				}

				// manual fixes didn't work, try fixing using a neighbour
				if(!cellIsFixed){
					const attemptedFixes = [
						row[j - 1],
						row[j + 1],
						basicQuantisation[i - 1]?.[j],
						basicQuantisation[i + 1]?.[j],
						basicQuantisation[i - 1]?.[j - 1],
						basicQuantisation[i - 1]?.[j + 1],
						basicQuantisation[i + 1]?.[j - 1],
						basicQuantisation[i + 1]?.[j + 1],
					];

					for(let attemptedFix of attemptedFixes){
						// if the cell fixes something, fix it with that!
						if(canFixCell(cell, attemptedFix)){
							row[j] = attemptedFix;
							cellIsFixed = true;
							break;
						}
					}
				}

				// absolutely nothing works, try a last-ditch effort
				if(!cellIsFixed){
					// if nothing fixed the cell, but it has elements, arbitrarily select the first one
					if(cell.size > 1) cell = new Set([Array.from(cell)[0]]);

					// if absolutely nothing worked, just add an ocean timezone
					else{
						const lng = getCenterLngFromTile(i, zoom);
						const timezoneName = oceanName(- Math.round(lng / 15));
						row[j] = new Set([timezonesByName[timezoneName]]);
					}
				}
			}

			// we are now certain that everything has the correct length so we can get our current value
			const currentTimezone = Array.from(row[j])[0] as number;
			// new timezone, needs adding
			if(currentTimezone !== lastTimezone){
				// first, add index representation
				quantisation[i] += encodeNumber(j, indexSize);
				// then, add timezone representation
				quantisation[i] += encodeNumber(currentTimezone, timezoneSize);
			}
			lastTimezone = currentTimezone;
			// otherwise, we can just proceed to the next one
		}
	}
	return {quantisation, timezones, indexSize, timezoneSize};
}

// a simple helper function for quantisation
// mainly there to reduce code duplication
// not the cleanest, but it does the job for now
function quantisationHelper(
	poly: TZFeature,
	latCentre: number[],
	lngCentre: number[],
	quantisation: Set<number>[][],
	polygonIndex: number,
	zoom: number
): void{
	// get bounding box for ease of access
	const featureBbox = bbox(poly);
	const topLeftTile = getTileFromLatLng({lat: featureBbox[3], lng: featureBbox[0]}, zoom);
	const bottomRightTile = getTileFromLatLng({lat: featureBbox[1], lng: featureBbox[2]}, zoom);
	for(let i = topLeftTile.x; i <= bottomRightTile.x; i++){
		for(let j = topLeftTile.y; j <= bottomRightTile.y; j++){
			if(pointInPolygon(
				point([lngCentre[i] as number, latCentre[j] as number]),
				poly
			)) quantisation[i][j].add(polygonIndex);
		}
	}
	return quantisation;
}

// a simple helper function to ensure that while fixing quantisation, there is no issues
function canFixCell(
	cell: Set<number>,
	otherCell: Set<number> | undefined
): boolean{
	if(otherCell === undefined) return false;
	// .intersection is not natively supported in most usecases yet
	if(
		([...cell].filter(x => otherCell.has(x))).length !== 1
	) return false;
	return true;
}

// helper function for GMT+... / GMT-... type timezones
function oceanName(n: number){
	if(n === 0) return "Etc/GMT";
	if(n < 0) return "Etc/GMT" + n.toString(10);
	if(n > 0) return "Etc/GMT+" + n.toString(10);
}