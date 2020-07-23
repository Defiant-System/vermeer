
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
			clutPath : "~/images/various-a8314e11.png",
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
			highQualityPreview : false,
		};

		let { cvs, ctx } = createCanvas(opt.width, opt.height);
		this.cvs = cvs;
		this.ctx = ctx;

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

		this.dispatch({ ...event, type: "set-scale", noRender: true });

		vermeer.editor.setFile(this);
		//Files.select(this._id);
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
				this.scale = this.scale;
				this.w = this.oW * this.scale;
				this.h = this.oH * this.scale;
				// origo
				this.oX = _round(Proj.cX - (this.w / 2));
				this.oY = _round(Proj.cY - (this.h / 2));

				if (!event.noRender) {
					// render projector canvas
					Proj.renderFrame(this);
					Proj.render();
				}
				break;
		}
	}
}
