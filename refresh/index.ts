interface RefreshOptions{

}

async function refresh(options?: RefreshOptions){
	const release = options?.release ?? await getRelease();
}