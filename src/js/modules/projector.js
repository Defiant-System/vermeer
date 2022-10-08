
const Projector = {
	init() {
		// fast references
		this.doc = $(document);
		this.els = {
			sideBar: window.find(".sidebar-wrapper"),
		};
		// canvas
		this.cvs = window.find(".cvs-wrapper .canvas");
		this.ctx = this.cvs[0].getContext("2d");
		this.cvs.prop({ width: window.innerWidth, height: window.innerHeight });

		// publicly used swap canvas
		this.swap = createCanvas(1, 1);

		// calc available dimensions
		this.reset();

		// bind event handlers
		this.cvs.on("mousemove", this.dispatch);
	},
	dispatch(event) {
		let APP = vermeer,
			Self = Projector,
			File = Self.file,
			_max = Math.max,
			_min = Math.min,
			_round = Math.round,
			data = {},
			el;

		switch (event.type) {
			// native events
			case "mousemove":
				if (!File || !File.width) return;
				data.top = _round(_min(_max(event.offsetY - File.oY, 0), File.height) / File.scale);
				data.left = _round(_min(_max(event.offsetX - File.oX, 0), File.width) / File.scale);
				data.offsetY = _min(_max(event.offsetY, File.oY), File.oY + File.height) - Self.aY;
				data.offsetX = _min(_max(event.offsetX, File.oX), File.oX + File.width) - Self.aX;

				let c = Self.ctx.getImageData(data.left, data.top, 1, 1).data;
				data.rgba = { r: c[0], g: c[1], b: c[2], a: c[3] };
				data.hsl = ColorLib.rgbToHsl(data.rgba);
				data.isOnCanvas = event.offsetY >= File.oY && event.offsetY <= File.oY + File.height
								&& event.offsetX >= File.oX && event.offsetX <= File.oX + File.width;

				// broadcast event
				karaqu.emit("mouse-move", data);
				break;
		}
	},
	renderFrame(file) {
		// pre-render frame
		let w = file.oW * file.scale,
			h = file.oH * file.scale,
			oX = file.oX || Math.round(this.cX - (w / 2)),
			oY = file.oY || Math.round(this.cY - (h / 2));
		
		// reset canvases
		this.swap.cvs.prop({ width: window.innerWidth, height: window.innerHeight });
		
		this.swap.ctx.fillStyle = "#fff";
		this.swap.ctx.shadowOffsetX = 0;
		this.swap.ctx.shadowOffsetY = 3;
		this.swap.ctx.shadowBlur = 13;
		this.swap.ctx.shadowColor = "#999";
		this.swap.ctx.fillRect(oX, oY, w, h);
		this.frame = this.swap.ctx.getImageData(0, 0, window.width, window.height);
	},
	reset(file) {
		// reference to displayed file
		this.file = file || this.file;
		// reset canvases
		this.cvs.prop({ width: window.width, height: window.height });
		// available dimensions
		this.aX = 0;
		this.aY = 0;
		this.aW = window.innerWidth - this.aX - this.els.sideBar.width();
		this.aH = window.innerHeight - this.aY;
		// center
		this.cX = (window.innerWidth + this.aX - this.els.sideBar.width()) / 2;
		this.cY = (window.innerHeight + this.aY) / 2;
		// pre-render frame
		if (this.file) this.renderFrame(this.file);
	},
	comparison: {
		isOn: false,
		cX: false,
	},
	render(opt) {
		// reference to displayed file
		let file = this.file;
		// reset canvas
		this.cvs.prop({ width: window.innerWidth, height: window.innerHeight });

		this.ctx.save();
		this.ctx.putImageData(this.frame, 0, 0);
		this.ctx.translate(file.oX, file.oY);
		this.ctx.drawImage(file.cvs[0], 0, 0, file.width, file.height);

		if (this.comparison.isOn) {
			let cX = this.comparison.cX,
				x1 = cX / file.scale,
				y1 = 0,
				w1 = file.oW - x1,
				h1 = file.oH,
				x2 = cX,
				y2 = 0,
				w2 = file.width - cX,
				h2 = file.height;
			this.ctx.drawImage(file.img, x1, y1, w1, h1, x2, y2, w2, h2);
		}
		this.ctx.restore();

		if (opt && opt.emit) {
			// emit event
			opt.emit.map(type => karaqu.emit(type));
		}
	}
};
