
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
			Proj = Projector,
			File = Proj.file,
			_round = Math.round,
			_max = Math.max,
			_min = Math.min,
			data = {},
			zoom,
			value,
			width,
			height,
			top,
			left;

		if (!Self.els.root) return;

		switch (event.type) {
			// subscribed events
			case "projector-update":
				// calc ratio
				Self.ratio = File.h / File.w;
				if (isNaN(Self.ratio)) return;

				// available width
				Self.navWidth = _round(Self.navHeight / Self.ratio);
				if (Self.navWidth > Self.maxWidth) {
					Self.navWidth = Self.maxWidth;
					Self.navHeight = Self.ratio * Self.navWidth;
				}

				data.top = (((Proj.aY - File.oY) / File.h) * Self.navHeight);
				data.left = (((Proj.aX - File.oX) / File.w) * Self.navWidth);
				data.height = _min(((Proj.aH / File.h) * Self.navHeight), Self.navHeight - data.top);
				data.width = _min(((Proj.aW / File.w) * Self.navWidth), Self.navWidth - data.left);
				
				if (data.top < 0) data.height = _min(data.height + data.top, data.height);
				if (data.left < 0) data.width = _min(data.width + data.left, data.width);
				data.top = _max(data.top, 0);
				data.left = _max(data.left, 0);

				for (let key in data) data[key] = _round(data[key]) +"px";
				Self.els.zoomRect.css(data);

				Self.els.wrapper.css({ width: Self.navWidth +"px" });
				Self.cvs.prop({ width: Self.navWidth, height: Self.navHeight });
				Self.ctx.drawImage(File.cvs[0], 0, 0, Self.navWidth, Self.navHeight);
				Self.els.wrapper.removeClass("hidden");
				break;
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
						w: Proj.aW - File.w,
						h: Proj.aH - File.h,
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
