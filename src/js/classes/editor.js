
import CanvasProcessor from "../classes/canvas-processor";
import CanvasWorkerProcessor from "../classes/canvas-worker-processor";

import { createCanvas, scaleImageHQ } from "../modules/image-helpers";
import clut from "../modules/clut";


export class Editor {
	constructor(Projector) {
		this.processorCanvas = createCanvas().cvs[0];
		this.processor = this.getSupportedProcessor(this.processorCanvas);

		this.inputImage = null;
		this.scaledImage = null;
		this.lastImage = null;
		this.renderPending = false;
		this.renderInProgress = false;
		this.projector = Projector;
	}

	dispose() {
		// forward "kill" signal
		this.processor.dispose();
	}

	setFile(file) {
		this.inputFile = file;
		this.inputImage = file.img;
		this.scaledImage = null;
		this.render();
	}

	getSupportedProcessor(cvs) {
		let Processor = [CanvasWorkerProcessor, CanvasProcessor].find(p => p.isSupported());
		return new Processor(cvs);
	}

	getOptions() {
		let config = this.inputFile.config;

		return Promise.resolve(config.clutFile && clut.get(config.clutFile)).then(clut => {
			return {
				clut,
				...config,
				highQuality: config.highQualityPreview,
				// divide grain scale by image scale so the preview more or less matches the original
				grain: {
					scale     : 1600 * config.grainScale,
					intensity : config.grain
				},
				vignette: {
					radius    : 0.4 * config.vignetteRadius,
					falloff   : Math.sqrt(1 + Math.pow(Math.max(this.inputFile.width, this.inputFile.height) / Math.min(this.inputFile.width, this.inputFile.height), 2)) * .5 - .4,
					intensity : Math.pow(2, config.vignette)
				},
				lightLeak: {
					seed      : config.lightLeak,
					intensity : config.lightLeakIntensity,
					scale     : config.lightLeakScale,
				}
			}
		});
	}

	async render(emit) {
		if (!this.inputImage) return;

		if (this.renderPending) {
			return console.log('render already pending');
		}
		if (this.renderInProgress) {
			this.renderPending = true;
			return console.log('render already in progress, setting pending');
		}

		let oW = this.inputFile.oW,
			oH = this.inputFile.oH,
			options = await this.getOptions();

		if (oW <= 0 || oH <= 0) {
			return console.log('editor is not visible, not rendering');
		}

		this.renderInProgress = true;
		this.lastImage = this.inputImage;

		if (!this.scaledImage
			|| this.scaledImage.w !== oW
			|| this.scaledImage.h !== oH
			|| this.inputImage !== this.lastImage) {
			this.scaledImage = scaleImageHQ(this.inputImage, oW, oH);
		}

		// console.time('Editor.render');
		await this.processor.process(this.scaledImage, options);
		this.inputFile.ctx.drawImage(this.processorCanvas, 0, 0, oW, oH);
		this.renderInProgress = false;
		// console.timeEnd('Editor.render');
		
		// select file and render projector
		this.projector.render({ emit: ["projector-update"] });

		// if (this.renderPending) {
		// 	this.renderPending = false;
		// 	return this.render();
		// }
	}
}
