
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
		this.swap.ctx.shadowOffsetY = 1;
		this.swap.ctx.shadowBlur = 5;
		this.swap.ctx.shadowColor = "#aaa";
		this.swap.ctx.fillRect(oX, oY, w, h);
		this.frame = this.swap.ctx.getImageData(0, 0, window.width, window.height);
	},
	reset(file) {
		// reference to displayed file
		this.file = file;
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
		if (file) this.renderFrame(file);
	},
	render() {
		// reference to displayed file
		let file = this.file;
		// reset canvas
		this.cvs.prop({ width: window.innerWidth, height: window.innerHeight });

		this.ctx.save();
		this.ctx.putImageData(this.frame, 0, 0);
		this.ctx.translate(file.oX, file.oY);
		this.ctx.imageSmoothingEnabled = false;
		this.ctx.drawImage(file.cvs[0], 0, 0, file.w, file.h);
		this.ctx.restore();
	}
};
