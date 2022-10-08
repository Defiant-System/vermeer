
// vermeer.sidebar.box.info

{
	init() {
		let root = window.find(`.sidebar .box-body > div[data-box="info"]`);
		// fast references
		this.els = {
			hslH: root.find(".value.hslH"),
			hslS: root.find(".value.hslS"),
			hslL: root.find(".value.hslL"),
			rgbR: root.find(".value.rgbR"),
			rgbG: root.find(".value.rgbG"),
			rgbB: root.find(".value.rgbB"),
			mouseX: root.find(".value.mouseX"),
			mouseY: root.find(".value.mouseY"),
			comparisonX: root.find(".value.comparisonX"),
			comparisonY: root.find(".value.comparisonY"),
			root,
		};

		// subscribe to events
		karaqu.on("mouse-move", this.dispatch);
	},
	dispatch(event) {
		let APP = vermeer,
			Self = APP.sidebar.box.info,
			Detail = event.detail,
			isOn,
			el;

		if (!Self.els.root) return;

		switch (event.type) {
			// subscribed events
			case "mouse-move":
				isOn = Detail.isOnCanvas;

				if (Detail.cX) {
					Self.els.comparisonX.html(Detail.cX || "");
					Self.els.comparisonY.html(Detail.cY || "");
					return;
				}
				
				Self.els.hslH.html(isOn ? Math.round(Detail.hsl.h) +"°" : "");
				Self.els.hslS.html(isOn ? Math.round(Detail.hsl.s * 100) +"%" : "");
				Self.els.hslL.html(isOn ? Math.round(Detail.hsl.l * 100) +"%" : "");
				
				Self.els.rgbR.html(isOn ? Detail.rgba.r : "");
				Self.els.rgbG.html(isOn ? Detail.rgba.g : "");
				Self.els.rgbB.html(isOn ? Detail.rgba.b : "");

				Self.els.mouseY.html(isOn ? Detail.top : "");
				Self.els.mouseX.html(isOn ? Detail.left : "");
				break;
			// custom events
			case "custom-event":
				break;
		}
	}
}
