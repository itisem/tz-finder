import https from "node:https";

import headers from "./headers.js";

const rejectMessage = "Error while fetching releases.";

export default async function getRecentRelease(): Promise<string>{
	const apiUrl = "https://api.github.com/repos/evansiroky/timezone-boundary-builder/releases";

	// using the built-in https module to ensure compatibility with everything
	return new Promise((resolve, reject) => {
		https.get(
			apiUrl,
			{
				headers: {
					...headers,
					"Accept": "application/vnd.github+json",
					"X-GitHub-Api-Version": "2022-11-28",
				}
			},
			(res) => {
				// get request body
				let body: string = "";
				// api error while requesting
				if(res.statusCode !== 200) return reject(rejectMessage + "1");
				// get request contents piece by piece
				res.on("data", (chunk: string) => body += chunk);
				// evaluate everything on end
				res.on("end", () => {
					try{
						// get json contents if body exists
						const parsed = JSON.parse(body);
						const name = parsed[0]?.name;
						if(name === undefined) reject(rejectMessage + "2");
						else resolve(name as string);
					}
					catch{
						// somehow not a json. shouldn't happen, but kept here in case something has gone horribly wrong
						reject(rejectMessage);
					}
				});
			}
		)
	});
}