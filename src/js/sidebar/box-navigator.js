
// vermeer.sidebar.box.navigator

{
	init() {
		// fast references
		let root = window.find(`.sidebar .box-body > div[data-box="navigator"]`);
		this.doc = $(document);
		this.els = {
			wrapper: root.find(".navigator-wrapper"),
			zoomRect: root.find(".view-rect"),
			zoomValue: root.find(".box-foot .value"),
			zoomSlider: root.find(".zoom-slider input"),
			root,
		};

		this.cvs = root.find(".nav-cvs");
		this.ctx = this.cvs[0].getContext("2d");

		// available height
		this.navHeight = this.els.wrapper.height();
		this.maxWidth = parseInt(this.els.wrapper.css("max-width"), 10);

		// bind event handlers
		this.els.zoomRect.on("mousedown", this.pan);
		this.els.zoomSlider.on("input", this.dispatch);

		// subscribe to events
		karaqu.on("projector-zoom", this.dispatch);
		karaqu.on("projector-pan", this.dispatch);
		karaqu.on("projector-update", this.dispatch);

		if (this.ratio) {
			// dispatch if ratio is calculated
			this.dispatch({ type: "projector-zoom" });
			this.dispatch({ type: "projector-update" });
		}
	},
	dispatch(event) {
		let APP = vermeer,
			Self = APP.sidebar.box.navigator,
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

		// console.log(event);
		switch (event.type) {
			// subscribed events
			case "projector-zoom":
				ZOOM.map((z, i) => {
					if (z.level === File.scale * 100) data = { i, level: z.level }});
				Self.els.zoomSlider.val(data.i);
				Self.els.zoomValue.html(data.level + "%");
				/* falls through */
			case "projector-pan":
				// calc ratio
				Self.ratio = File.height / File.width;
				if (isNaN(Self.ratio)) return;

				// available width
				Self.navWidth = _round(Self.navHeight / Self.ratio);
				if (Self.navWidth > Self.maxWidth) {
					Self.navWidth = Self.maxWidth;
					Self.navHeight = Self.ratio * Self.navWidth;
				}

				data.top = (((Proj.aY - File.oY) / File.height) * Self.navHeight);
				data.left = (((Proj.aX - File.oX) / File.width) * Self.navWidth);
				data.height = _min(((Proj.aH / File.height) * Self.navHeight), Self.navHeight - data.top);
				data.width = _min(((Proj.aW / File.width) * Self.navWidth), Self.navWidth - data.left);
				
				if (data.top < 0) data.height = _min(data.height + data.top, data.height);
				if (data.left < 0) data.width = _min(data.width + data.left, data.width);
				data.top = _max(data.top, 0);
				data.left = _max(data.left, 0);

				for (let key in data) data[key] = _round(data[key]);
				Self.els.zoomRect.css(data);
				break;
			case "projector-update":
				if (!Self.navWidth) return;
				Self.els.wrapper.css({ width: Self.navWidth +"px" });
				Self.cvs.prop({ width: Self.navWidth, height: Self.navHeight });
				Self.ctx.drawImage(File.cvs[0], 0, 0, Self.navWidth, Self.navHeight);
				Self.els.wrapper.removeClass("hidden");
				break;
			// custom events
			case "input":
				Self.zoomValue = ZOOM[Self.els.zoomSlider.val()].level;
				Self.els.zoomValue.html(Self.zoomValue + "%");

				if (event.type === "input") {
					File.dispatch({ type: "set-scale", scale: Self.zoomValue / 100 });
				}
				break;
			case "zoom-out":
				value = _max(+Self.els.zoomSlider.val() - 1, 0);
				Self.els.zoomSlider.val(value.toString()).trigger("input");
				break;
			case "zoom-in":
				value = _min(+Self.els.zoomSlider.val() + 1, ZOOM.length - 1);
				Self.els.zoomSlider.val(value).trigger("input");
				break;
			case "pan-canvas":
				top = _round((event.top / event.max.y) * event.max.h) + Proj.aY;
				left = _round((event.left / event.max.x) * event.max.w) + Proj.aX;
				//if (isNaN(top) || isNaN(left)) return;

				// forward event to canvas
				File.dispatch({ type: "pan-canvas", top, left, noEmit: 1 });
				break;
		}
	},
	pan(event) {
		let APP = vermeer,
			Self = APP.sidebar.box.navigator,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// prepare drag object
				let el = $(event.target),
					Proj = Projector;
				// console.log( el.parent().prop("offsetHeight"), el.prop("offsetHeight") );
				Self.drag = {
					el,
					file: Proj.file,
					clickX: +el.prop("offsetLeft") - event.clientX,
					clickY: +el.prop("offsetTop") - event.clientY,
					min: { x: 0, y: 0 },
					max: {
						x: +el.parent().prop("offsetWidth") - +el.prop("offsetWidth"),
						y: +el.parent().prop("offsetHeight") - +el.prop("offsetHeight"),
						w: Proj.aW - Proj.file.width,
						h: Proj.aH - Proj.file.height,
					},
					_max: Math.max,
					_min: Math.min,
				};
				// prevent mouse from triggering mouseover
				APP.els.content.addClass("cover");
				// bind event handlers
				Self.doc.on("mousemove mouseup", Self.pan);
				break;
			case "mousemove":
				let left = Drag._min(Drag._max(event.clientX + Drag.clickX, Drag.min.x), Drag.max.x),
					top = Drag._min(Drag._max(event.clientY + Drag.clickY, Drag.min.y), Drag.max.y);
				// console.log( top, left );
				// moves navigator view rectangle
				Drag.el.css({ top, left });
				// emit pan-event
				Self.dispatch({ type: "pan-canvas", ...Drag, left, top });
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
