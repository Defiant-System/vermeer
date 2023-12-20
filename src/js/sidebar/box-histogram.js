
// vermeer.sidebar.box.histogram

{
	init() {
		// fast references
		let root = window.find(`sidebar .box-body > div[data-box="histogram"]`);
		// fast references
		this.els = {
			foot: root.find(".box-foot"),
			rgbIcon: root.find(".box-foot .icon-rgb"),
			root,
		};

		this.cvs = root.find(".histogram-cvs");
		this.ctx = this.cvs[0].getContext("2d", { willReadFrequently: true });

		// subscribe to events
		window.on("projector-update", this.dispatch);

		// this.dispatch({ type: "projector-update" });
	},
	dispatch(event) {
		let APP = vermeer,
			Self = APP.sidebar.box.histogram,
			Proj = Projector,
			File = Proj.file,
			_round = Math.round,
			show,
			el;

		switch (event.type) {
			// subscribed events
			case "projector-update":
				if (File.oW === undefined) return;

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

				// decides which colors to display
				show = event.show || Self.show || ["r", "g", "b"];

				rData = rData.map(y => _round((y / scalar) * (oY - 7)));
				gData = gData.map(y => _round((y / scalar) * (oY - 7)));
				bData = bData.map(y => _round((y / scalar) * (oY - 7)));

				// reset canvases
				Self.cvs.prop({ width: 222, height: 111 });
				Proj.swap.cvs.prop({ width: 256, height: oY });
				Proj.swap.ctx.globalCompositeOperation = "lighten";
				
				if (show.includes("r")) {
					Proj.swap.ctx.fillStyle = "#f00";
					rData.map((y, x) => Proj.swap.ctx.fillRect(x, oY, 1, -y));
				}
				if (show.includes("g")) {
					Proj.swap.ctx.fillStyle = "#0f0";
					gData.map((y, x) => Proj.swap.ctx.fillRect(x, oY, 1, -y));
				}
				if (show.includes("b")) {
					Proj.swap.ctx.fillStyle = "#00f";
					bData.map((y, x) => Proj.swap.ctx.fillRect(x, oY, 1, -y));
				}
				Self.ctx.drawImage(Proj.swap.cvs[0], 1, 0, 220, 110);

				Self.els.foot.find(".active").removeClass("active");
				Self.els.foot.find(".icon-"+ show.join("")).addClass("active");

				Self.show = show;
				break;
			// custom events
			case "show-only-reds":
				if (event.el.hasClass("active")) {
					return Self.els.rgbIcon.trigger("click");
				}
				Self.dispatch({ type: "projector-update", show: ["r"] });
				break;
			case "show-only-greens":
				if (event.el.hasClass("active")) {
					return Self.els.rgbIcon.trigger("click");
				}
				Self.dispatch({ type: "projector-update", show: ["g"] });
				break;
			case "show-only-blues":
				if (event.el.hasClass("active")) {
					return Self.els.rgbIcon.trigger("click");
				}
				Self.dispatch({ type: "projector-update", show: ["b"] });
				break;
			case "show-blend":
				Self.dispatch({ type: "projector-update", show: ["r", "g", "b"] });
				break;
		}
	}
}
