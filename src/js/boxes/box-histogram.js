
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
			Proj = Projector,
			File = Proj.file,
			_round = Math.round,
			el;

		switch (event.type) {
			// subscribed events
			case "projector-update":
				let d = File.ctx.getImageData(0, 0, File.oW, File.oH).data,
					rData = Array(256).fill(0),
					gData = Array(256).fill(0),
					bData = Array(256).fill(0),
					oY = 100;

				for (let i=0, il=d.length; i<il; i+=4) {
					rData[d[i  ]]++;
					gData[d[i+1]]++;
					bData[d[i+2]]++;
				}

				let scalar = Math.max(...rData, ...gData, ...bData);

				rData = rData.map(y => _round((y / scalar) * (oY - 7)));
				gData = gData.map(y => _round((y / scalar) * (oY - 7)));
				bData = bData.map(y => _round((y / scalar) * (oY - 7)));

				// reset canvases
				Self.cvs.prop({ width: 222, height: 111 });
				Proj.swap.cvs.prop({ width: 256, height: oY });
				Proj.swap.ctx.globalCompositeOperation = "lighten";
				
				Proj.swap.ctx.fillStyle = "#f00";
				rData.map((y, x) => Proj.swap.ctx.fillRect(x, oY, 1, -y));
				
				Proj.swap.ctx.fillStyle = "#0f0";
				gData.map((y, x) => Proj.swap.ctx.fillRect(x, oY, 1, -y));
				
				Proj.swap.ctx.fillStyle = "#00f";
				bData.map((y, x) => Proj.swap.ctx.fillRect(x, oY, 1, -y));

				Self.ctx.drawImage(Proj.swap.cvs[0], 1, 0, 220, 110);
				break;
			// custom events
			case "show-only-reds":
				break;
			case "show-only-greens":
				break;
			case "show-only-blues":
				break;
			case "show-blend":
				break;
		}
	}
}
