
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
		this.swap = { cvs, ctx } = createCanvas(1, 1);

		// calc available dimensions
		this.reset();
	},
	renderFrame(file) {
		// pre-render frame
		let w = file.oW * file.scale,
			h = file.oH * file.scale,
			oX = file.oX || Math.round(this.cX - (w / 2)),
			oY = file.oY || Math.round(this.cY - (h / 2));
		
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
	render(opt) {
		// reference to displayed file
		let file = this.file;
		// reset canvas
		this.cvs.prop({ width: window.innerWidth, height: window.innerHeight });

		this.ctx.save();
		this.ctx.putImageData(this.frame, 0, 0);
		this.ctx.translate(file.oX, file.oY);
		this.ctx.drawImage(file.cvs[0], 0, 0, file.w, file.h);

		if (opt) {
			if (Number(opt.cX) === opt.cX) {
				let csX = opt.cX / file.scale,
					x1 = opt.cX / file.scale,
					y1 = 0,
					w1 = file.oW - x1,
					h1 = file.oH,
					x2 = opt.cX,
					y2 = 0,
					w2 = file.w - opt.cX,
					h2 = file.h;
				this.ctx.drawImage(file.img, x1, y1, w1, h1, x2, y2, w2, h2);
			}
			if (opt.emit) {
				// emit event
				opt.emit.map(type => defiant.emit(type));
			}
		}

		this.ctx.restore();
	}
};
