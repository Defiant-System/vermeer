
class File {
	constructor(fsFile) {
		// save reference to original FS file
		this._file = fsFile;
		
		// defaults
		this.scale = .125;
		this.width = 0;
		this.height = 0;

		// preset defaults
		this.config = {
			clutFile           : false,
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

		// file canvas
		let { cvs, ctx } = createCanvas(1, 1);
		this.cvs = cvs;
		this.ctx = ctx;

		// parse image content blob
		this.parseImage();
	}

	async parseImage() {
		let src = URL.createObjectURL(this._file.blob),
			image = await loadImage(src),
			width = image.width,
			height = image.height;

		// set image dimensions
		this.oW = this.width = width;
		this.oH = this.height = height;

		// reset canvas
		this.cvs.prop({ width, height });
		// apply image to canvas
		this.ctx.drawImage(image, 0, 0);
		this.img = image;

		// iterate available zoom levels
		ZOOM.filter(z => z.level <= 100)
			.map(zoom => {
				let scale = zoom.level / 100;
				if (Projector.aW > this.oW * scale && Projector.aH > this.oH * scale) {
					this.scale = scale;
				}
			});

		// set file initial scale
		this.dispatch({ ...event, type: "set-scale", skipEmit: true });

		//vermeer.editor.setFile(this);
		Files.select(this._file.id);
	}

	dispatch(event) {
		let APP = vermeer,
			Proj = Projector,
			el;
		//console.log(event);
		switch (event.type) {
			// custom events
			case "set-scale":
				// scaled dimension
				this.scale = event.scale || this.scale;
				this.width = this.oW * this.scale;
				this.height = this.oH * this.scale;

				// origo
				this.oX = Math.round(Proj.cX - (this.width / 2));
				this.oY = Math.round(Proj.cY - (this.height / 2));

				if (!event.skipEmit) {
					// render projector canvas
					Proj.renderFrame(this);
					Proj.render({ emit: ["projector-zoom"] });
				}
				break;
			case "pan-canvas":
				this.oX = (Number.isInteger(event.left) ? event.left : this.width > Proj.aW ? Proj.cX - (this.width / 2) + event.x : false) || this.oX;
				this.oY = (Number.isInteger(event.top) ? event.top : this.height > Proj.aH ? Proj.cY - (this.height / 2) + event.y : false) || this.oY;

				// render projector canvas
				Proj.render(!event.skipEmit ? { emit: ["projector-pan"] } : null);
				break;
		}
	}
}
