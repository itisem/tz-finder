import getRecentRelease from "./get-recent-release.js";

// the default release date in case the github lookup fails
export const defaultRelease = "2023d";

export default async function getRelease(release?: string): Promise<string>{
	if(release) return release;
	try{
		const release = await getRecentRelease();
		return release;
	}
	catch{
		return defaultRelease;
	}
}