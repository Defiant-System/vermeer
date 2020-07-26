
import WorkerPool from "./worker-pool";
import CanvasProcessor from "./canvas-processor";

export default class CanvasWorkerProcessor extends CanvasProcessor {
	constructor(canvas) {
		super(canvas);
		this.workers = new WorkerPool("~/js/worker.js", 4);
	}

	static isSupported() {
		return !!document.createElement("canvas").getContext && window.Worker;
	}

	static supportedOptions() {
		return ["clut", "brightness"];
	}

	process(image, options, progress = function(){}) {
		//console.log("processing", options);
		let canvas = this.canvas,
			ctx = this.ctx;

		canvas.width = image.naturalWidth || image.width;
		canvas.height = image.naturalHeight || image.height;
		ctx.drawImage(image, 0, 0);

		//let data = ctx.getImageData(0, 0, canvas.width, canvas.height);

		let n = this.workers.pool.length,
			chunk = Math.ceil(canvas.height / n),
			messages = [];

		for(let i=0; i<n; i++) {
			let offset = chunk * i,
				imageData = ctx.getImageData(0, offset, canvas.width, chunk),
				slice = {
					width: canvas.width,
					height: canvas.height,
					x: 0,
					y: offset
				};
			messages.push([{
					command: "processImage",
					arguments: [imageData, slice, options]
				}, [imageData.data.buffer]]);
		}

		return Promise.all(this.workers.dispatch(messages)).then(results => {
			for(let i=0; i<results.length; i++) {
				ctx.putImageData(results[i], 0, chunk * i);
			}
		});
	}
}
