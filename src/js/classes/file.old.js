
class File {
	constructor(options) {
		// defaults
		let opt = {
			scale: .125, // default to first zoom level
			width: 1,
			height: 1,
			...options
		};

		this._id = opt._id;
		this.scale = opt.scale;
		this.path = opt.path;

		this.config = {
			clutFile : false,
		//	clutFile : "various-a8314e11.png",
			clutMix            : 1,
			highQualityPreview : false,
			grain              : 0,
			grainScale         : .5,
			vignette           : 0,
			vignetteRadius     : 0,
			lightLeak          : 0,
			lightLeakIntensity : 0.5,
			lightLeakScale     : 0.5,
			brightness         : 1,
			blacks             : 0,
			contrast           : 0,
			temperature        : 0,
			vibrance           : 0,
			saturation         : 0,
		};

		let { cvs, ctx } = createCanvas(opt.width, opt.height);
		this.cvs = cvs;
		this.ctx = ctx;

		// load image
		this.loadImage();
	}

	async loadImage() {
		let img = await loadImage(this.path);
		this.img = img;
		this.oW = img.width;
		this.oH = img.height;

		// reset canvas
		this.cvs.prop({ width: this.oW, height: this.oH });

		// paint image on canvas
		this.ctx.drawImage(img, 0, 0);

		// iterate available zoom levels
		ZOOM.filter(z => z.level <= 100)
			.map(zoom => {
				let scale = zoom.level / 100;
				if (Projector.aW > this.oW * scale && Projector.aH > this.oH * scale) {
					this.scale = scale;
				}
			});

		// set file initial scale
		this.dispatch({ ...event, type: "set-scale", skipEmit: true, scale1: 1 });

		//vermeer.editor.setFile(this);
		Files.select(this._id);
	}

	dispatch(event) {
		let APP = vermeer,
			Proj = Projector,
			_round = Math.round,
			el;
		//console.log(event);
		switch (event.type) {
			// custom events
			case "set-scale":
				// scaled dimension
				this.scale = event.scale || this.scale;
				this.w = this.oW * this.scale;
				this.h = this.oH * this.scale;
				// origo
				this.oX = _round(Proj.cX - (this.w / 2));
				this.oY = _round(Proj.cY - (this.h / 2));

				if (!event.skipEmit) {
					// render projector canvas
					Proj.renderFrame(this);
					Proj.render({ emit: ["projector-zoom"] });
				}
				break;
			case "pan-canvas":
				this.oX = (Number.isInteger(event.left) ? event.left : this.w > Proj.aW ? Proj.cX - (this.w / 2) + event.x : false) || this.oX;
				this.oY = (Number.isInteger(event.top) ? event.top : this.h > Proj.aH ? Proj.cY - (this.h / 2) + event.y : false) || this.oY;

				// render projector canvas
				Proj.render(!event.skipEmit ? { emit: ["projector-pan"] } : null);
				break;
		}
	}
}
