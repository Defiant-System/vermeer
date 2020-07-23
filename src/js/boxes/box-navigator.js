
// vermeer.box.navigator

{
	els: {},
	toggle(root, state) {
		if (state === "on") {
			// fast references
			this.doc = $(document);
			this.els.wrapper = root.find(".navigator-wrapper");
			this.els.zoomRect = root.find(".view-rect");
			this.els.zoomValue = root.find(".box-foot .value");
			this.els.zoomSlider = root.find(".zoom-slider input");
			this.els.root = root;

			this.cvs = root.find(".nav-cvs");
			this.ctx = this.cvs[0].getContext("2d");

			// available height
			this.navHeight = this.els.wrapper.height();
			this.maxWidth = parseInt(this.els.wrapper.css("max-width"), 10);

			// bind event handlers
			this.els.zoomRect.on("mousedown", this.pan);
			this.els.zoomSlider.on("input", this.dispatch);

			// subscribe to events
			defiant.on("projector-update", this.dispatch);
		} else {
			// unbind event handlers
			if (this.els.zoomRect) this.els.zoomRect.off("mousedown", this.pan);
			if (this.els.zoomSlider) this.els.zoomSlider.off("input", this.dispatch);

			// clean up
			this.els = {};

			// unsubscribe to events
			defiant.off("projector-update", this.dispatch);
		}
	},
	dispatch(event) {
		let APP = vermeer,
			Self = APP.box.navigator,
			el;
		console.log(event);
		switch (event.type) {
			// custom events
			case "custom-event":
				break;
		}
	},
	pan(event) {
		let APP = vermeer,
			Self = APP.box.navigator,
			Drag = Self.drag,
			Proj = Projector,
			File = Proj.file,
			_max = Math.max,
			_min = Math.min,
			x, y,
			el;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// prepare drag object
				el = $(event.target);
				Self.drag = {
					el,
					clickX: +el.prop("offsetLeft") - event.clientX,
					clickY: +el.prop("offsetTop") - event.clientY,
					min: { x: 0, y: 0 },
					max: {
						x: +el.parent().prop("offsetWidth") - +el.prop("offsetWidth"),
						y: +el.parent().prop("offsetHeight") - +el.prop("offsetHeight") - 4,
						w: Proj.aW - File.w - (File.showRulers ? Rulers.t : 0),
						h: Proj.aH - File.h + (File.showRulers ? Rulers.t : 0),
					}
				};
				// prevent mouse from triggering mouseover
				APP.els.content.addClass("cover");
				// bind event handlers
				Self.doc.on("mousemove mouseup", Self.pan);
				break;
			case "mousemove":
				x = _min(_max(event.clientX + Drag.clickX, Drag.min.x), Drag.max.x);
				y = _min(_max(event.clientY + Drag.clickY, Drag.min.y), Drag.max.y);
				// moves navigator view rectangle
				Drag.el.css({ top: y +"px", left: x +"px" });
				// emit pan-event
				Self.dispatch({ type: "pan-canvas", ...Drag, x, y });
				break;
			case "mouseup":
				// remove class
				APP.els.content.removeClass("cover");
				// unbind event handlers
				Self.doc.off("mousemove mouseup", Self.pan);
				break;
		}
	}
}
