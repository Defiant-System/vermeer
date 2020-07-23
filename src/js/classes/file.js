
class File {
	constructor(options) {
		// defaults
		let opt = {
			scale: 1,
			width: 1,
			height: 1,
			...options
		};

		this._id = opt._id;
		this.scale = opt.scale;
		this.path = opt.path;

		this.loadImage();
	}

	async loadImage() {
		let img = await loadImage(this.path);
		this.img = img;
		this.oW = img.width;
		this.oH = img.height;
		this.w = this.oW * this.scale;
		this.h = this.oH * this.scale;

		// initiate canvas
		this.dispatch({ type: "set-canvas", w: img.width, h: img.height, scale1: 4 });

		//Files.select(this._id);
		Projector.render();
	}

	dispatch(event) {
		let APP = vermeer,
			Proj = Projector,
			_round = Math.round,
			el;
		//console.log(event);
		switch (event.type) {
			// custom events
			case "set-canvas":
				// original dimension
				this.oW = event.w;
				this.oH = event.h;

				// reset projector
				Proj.reset(this);

				if (!event.scale) {
					// default to first zoom level
					event.scale = .125;
					// iterate available zoom levels
					ZOOM.filter(z => z.level <= 100)
						.map(zoom => {
							let scale = zoom.level / 100;
							if (Proj.aW > event.w * scale && Proj.aH > event.h * scale) {
								event.scale = scale;
							}
						});
				}
				this.dispatch({ ...event, type: "set-scale" });
				break;
			case "set-scale":
				// scaled dimension
				this.scale = event.scale;
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
