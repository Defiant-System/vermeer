
// vermeer.sidebar.box.info

{
	els: {},
	toggle(root, state) {
		if (state === "on") {
			// fast references
			this.els.hslH = root.find(".value.hslH");
			this.els.hslS = root.find(".value.hslS");
			this.els.hslV = root.find(".value.hslV");
			this.els.rgbR = root.find(".value.rgbR");
			this.els.rgbG = root.find(".value.rgbG");
			this.els.rgbB = root.find(".value.rgbB");
			this.els.mouseX = root.find(".value.mouseX");
			this.els.mouseY = root.find(".value.mouseY");
			this.els.comparisonX = root.find(".value.comparisonX");
			this.els.comparisonY = root.find(".value.comparisonY");
			this.els.root = root;

			// subscribe to events
			defiant.on("mouse-move", this.dispatch);
		} else {
			// clean up
			this.els = {};

			// unsubscribe to events
			defiant.off("mouse-move", this.dispatch);
		}
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
				
				Self.els.hslH.html(isOn ? Detail.hsl[0] +"°" : "");
				Self.els.hslS.html(isOn ? Detail.hsl[1] +"%" : "");
				Self.els.hslV.html(isOn ? Detail.hsl[2] +"%" : "");
				
				Self.els.rgbR.html(isOn ? Detail.rgba[0] : "");
				Self.els.rgbG.html(isOn ? Detail.rgba[1] : "");
				Self.els.rgbB.html(isOn ? Detail.rgba[2] : "");

				Self.els.mouseY.html(isOn ? Detail.top : "");
				Self.els.mouseX.html(isOn ? Detail.left : "");
				break;
			// custom events
			case "custom-event":
				break;
		}
	}
}
