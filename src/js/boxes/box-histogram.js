
// vermeer.box.histogram

{
	els: {},
	toggle(root, state) {
		if (state === "on") {
			// fast references
			this.els.root = root;

			this.cvs = root.find(".histogram-cvs");
			this.ctx = this.cvs[0].getContext("2d");

			// subscribe to events
			defiant.on("projector-update", this.dispatch);
		} else {
			// clean up
			this.els = {};

			// unsubscribe to events
			defiant.off("projector-update", this.dispatch);
		}
	},
	dispatch(event) {
		let APP = vermeer,
			Self = APP.box.histogram,
			File = Projector.file,
			_round = Math.round,
			img,
			data,
			el;

		switch (event.type) {
			// custom events
			case "projector-update":
				let r = Array(256).fill(0),
					g = Array(256).fill(0),
					b = Array(256).fill(0),
					fW = File.w,
					fH = File.h;

				img = File.ctx.getImageData(0, 0, fW, fH);
				data = img.data;

				for (let y=0; y<fH; y++) {
					for (let x=0; x<fH; x++) {
						let o = ((y * fH) + x) * 4;
						r[data[o + 0]]++;
						g[data[o + 1]]++;
						b[data[o + 2]]++;
					}
				}

				let rM = Math.max(...r);
				let gM = Math.max(...g);
				let bM = Math.max(...b);

				Self.cvs.prop({ width: 226, height: 113 });

				Self.ctx.strokeStyle = "#f00";
				Self.ctx.beginPath();
				Self.ctx.moveTo(0, 0);
				r.map((e, i) => Self.ctx.lineTo(i, 110 - _round((e / rM) * 70)));
				Self.ctx.stroke();

				Self.ctx.strokeStyle = "#0f0";
				Self.ctx.beginPath();
				Self.ctx.moveTo(0, 0);
				g.map((e, i) => Self.ctx.lineTo(i, 110 - _round((e / rM) * 70)));
				Self.ctx.stroke();

				Self.ctx.strokeStyle = "#00f";
				Self.ctx.beginPath();
				Self.ctx.moveTo(0, 0);
				b.map((e, i) => Self.ctx.lineTo(i, 110 - _round((e / rM) * 70)));
				Self.ctx.stroke();
				break;
		}
	}
}
