
import WorkerPool from "../classes/worker-pool";
import CanvasProcessor from "../classes/canvas-processor";
import CanvasWorkerProcessor from "../classes/canvas-worker-processor";

import { createCanvas, scaleImageHQ } from "../modules/image-helpers";
import clut from "../modules/clut";


export class Editor {
	constructor(cvs) {
		this.outputCanvas = cvs;
		this.processorCanvas = createCanvas().cvs;
		this.processor = this.getSupportedProcessor(this.processorCanvas);
		this.inputImage = null;
		this.scaledImage = null;

		this.lastOptions = 0;
		this.lastWidth = 0;
		this.lastHeight = 0;
		this.lastImage = null;
		this.highQualityPreview = false;

		this.renderPending = false;
		this.renderInProgress = false;
	}

	setImage(image) {
		this.inputImage = image;
		this.scaledImage = null;
		this.render();
	}

	getSupportedProcessor(canvas) {
		let Processor = [CanvasWorkerProcessor, CanvasProcessor].find(p => p.isSupported());
		return new Processor(canvas);
	}

	getCanvasSize(image) {
		let pixelRatio = 1,
			padding = 0;

		let availableW = 641,
			availableH = 800,
			scale = Math.min(availableW/image.width, availableH/image.height, 1),
			w = ~~(image.width * scale),
			h = ~~(image.height * scale);

		return [w, h, w/pixelRatio, h/pixelRatio];
	}

	getOptions(w, h) {
		let clutPath = "~/images/various-a8314e11.png",
			options = {
				clutMix            : 1,
				brightness         : 1,
				saturation         : 0,
				contrast           : 0,
				vibrance           : 0,
				blacks             : 0,
				temperature        : 6500,
				grainScale         : .5,
				grain              : 0,
				vignetteRadius     : 1,
				vignette           : 0,
				lightLeak          : 0,
				lightLeakIntensity : 1,
				lightLeakScale     : 1,
			};

		return Promise.resolve(clutPath && clut.get(clutPath)).then(clut => {
			return {
				clut,
				...options,
				highQuality: this.highQualityPreview,
				// divide grain scale by image scale so the preview more or less matches the original
				grain: {
					scale     : 1600 * (options.grainScale || 1),
					intensity : options.grain
				},
				vignette: {
					radius    : 0.4 * (options.vignetteRadius || 1),
					falloff   : Math.sqrt(1 + Math.pow(Math.max(w, h) / Math.min(w, h), 2)) * .5 - .4,
					intensity : Math.pow(2, options.vignette)
				},
				lightLeak: {
					seed      : options.lightLeak,
					intensity : options.lightLeakIntensity,
					scale     : options.lightLeakScale || 1,
				}
			};
		});
	}

	render() {
		if (!this.inputImage) return;

		if (this.renderPending) {
			return console.log('render already pending');
		}
		if (this.renderInProgress) {
			this.renderPending = true;
			return console.log('render already in progress, setting pending');
		}

		let [w, h, wc, hc] = this.getCanvasSize(this.inputImage),
			options = this.getOptions(w, h);

		if (w <= 0 || h <= 0) {
			return console.log('editor is not visible, not rendering');
		}

		this.renderInProgress = true;
		this.lastWidth = w;
		this.lastHeight = h;
		//this.lastOptions = this.controls.options;
		this.lastImage = this.inputImage;


		if (!this.scaledImage
			|| this.scaledImage.w !== w
			|| this.scaledImage.h !== h
			|| this.inputImage !== this.lastImage) {
			this.scaledImage = scaleImageHQ(this.inputImage, w, h);
		}

		console.time('Editor.render');
		options
			.then((options) => {
				return this.processor.process(this.scaledImage, options);
			})
			.then(() => {
				this.outputCanvas.width = w;
				this.outputCanvas.height = h;
				this.outputCanvas.getContext('2d').drawImage(this.processorCanvas, 0, 0);
			})
			.finally(() => {
				console.timeEnd('Editor.render');
				this.renderInProgress = false;
				//$('.photo-rendering', this.el).hide();
				if(this.renderPending) {
					this.renderPending = false;
					return this.render();
				}
			});
	}
}
