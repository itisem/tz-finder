export default class SimpleTimer{
	startTime: number;
	lastTime: number;

	constructor(){
		this.restart();
	}

	restart(){
		this.startTime = this.lastTime = Date.now();
	}

	// gets the time since the last section
	get section(): number{
		const time = Date.now();
		const diff = (time - this.lastTime) / 1000;
		this.lastTime = time;
		return diff;
	}

	// gets the time since beginning
	get overall(): number{
		const time = Date.now();
		const diff = (time - this.startTime) / 1000;
		this.lastTime = time;
		return diff;
	}
}