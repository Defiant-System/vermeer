
// vermeer.sidebar.box.presets

{
	els: {},
	toggle(root, state) {
		if (state === "on") {
			// fast references
			this.doc = $(document);
			this.els.selectEl = root.find(".box-tools .option[data-menu='preset-list'] .value");
			this.els.compareIcon = root.find(".icon-compare");
			this.els.compare = vermeer.els.content.find(".compare");
			this.els.root = root;

			// bind event handlers
			this.els.compare.on("mousedown", this.compare);

			// subscribe to events
			karaqu.on("select-file", this.dispatch);
			karaqu.on("projector-zoom", this.dispatch);
			karaqu.on("projector-pan", this.dispatch);

			if (this.data) {
				// dispatch if ratio is calculated
				this.dispatch({ type: "select-file", arg: this.data });
			}

			// temp
			//setTimeout(() => this.els.root.find(".icon-compare").trigger("click"), 300);
		} else {
			// unbind event handlers
			if (this.els.compare) this.els.compare.off("mousedown", this.compare);

			// clean up
			this.els = {};

			// unsubscribe to events
			karaqu.off("select-file", this.dispatch);
			karaqu.off("projector-zoom", this.dispatch);
			karaqu.off("projector-pan", this.dispatch);
		}
	},
	dispatch(event) {
		let APP = vermeer,
			Self = APP.sidebar.box.presets,
			Proj = Projector,
			File = Proj.file,
			data,
			rect,
			isOn,
			el;

		if (!Self.els.root) return;

		switch (event.type) {
			// subscribed events
			case "select-file":
				data = File.config;

				Object.keys(data).map(key => {
					let el = Self.els.root.find(".control."+ key);
					if (!el.length) return;

					let knob = el.find(".knob, .pan-knob"),
						isPan = knob.hasClass("pan-knob"),
						min = +knob.data("min"),
						max = +knob.data("max"),
						step = +knob.data("step"),
						perc = ((data[key] - min) / (max - min)) - (isPan ? .5 : 0),
						value = Math.round(perc * 100),
						i = step.toString().split(".")[1];

					knob.data({ value });
					el.find(".value").html(data[key].toFixed(i ? i.length : 0));
				});
				// save last preset data
				Self.data = data;
				// apply config on file / image
				APP.editor.setFile(File);
				break;
			case "projector-zoom":
			case "projector-pan":
				isOn = Self.els.compareIcon.hasClass("active");
				if (!isOn) return;

				// Projector -> render comparison
				rect = Self.els.compare[0].getBoundingClientRect();
				Proj.comparison = {
					isOn,
					cX: +Self.els.compare.prop("offsetLeft") - File.oX + (rect.width / 2),
				};
				Proj.render();
				break;
			// custom events
			case "compare-image":
				isOn = event.el.hasClass("active");
				event.el.toggleClass("active", isOn);

				Self.els.compare.toggleClass("active", isOn)

				rect = Self.els.compare[0].getBoundingClientRect();
				if (!Proj.comparison.cX) {
					Self.els.compare.css({
						top: (Proj.cY - (rect.height/2)) +"px",
						left: (Proj.cX - (rect.width/2)) +"px",
					});
				}
				// Projector -> render comparison
				Proj.comparison = {
					isOn: !isOn,
					cX: +Self.els.compare.prop("offsetLeft") - File.oX + (rect.width / 2),
				};
				Proj.render();
				break;
			case "save-values":
				break;
			case "reset-values":
				// apply values to file
				File.config = {
					...File.config,
						grain              : 0,
						grainScale         : .5,
						vignette           : 0,
						vignetteRadius     : 0,
						lightLeak          : 0,
						lightLeakIntensity : 0.5,
						lightLeakScale     : 0.5,
						brightness         : 1,
						blacks             : 0,
						contrast           : 0,
						temperature        : 0,
						vibrance           : 0,
						saturation         : 0,
				};
				// dispatch events
				Self.dispatch({ type: "set-clut", arg: "none", noSet: true });
				Self.dispatch({ type: "select-file" });
				break;
			case "set-clut":
				let xEl = window.bluePrint.selectSingleNode(`//Menu[@arg="${event.arg}"]`);
				this.els.selectEl.html(xEl.getAttribute("name"));
				// update file's clut filename
				File.config.clutFile = event.arg === "none" ? false : event.arg;
				// apply config on file / image
				if (!event.noSet) APP.editor.setFile(File);
				break;
			case "control-change":
				data = Self.els.root.find(".control").reduce((acc, el) => {
					acc[el.classList[1]] = +$(".value", el).text();
					return acc;
				}, {});
				// apply values to file
				File.config = {
					...File.config,
					...data,
				};
				// apply config on file / image
				APP.editor.setFile(File);
				break;
		}
	},
	compare(event) {
		let APP = vermeer,
			Self = APP.sidebar.box.presets,
			Drag = Self.drag,
			Proj = Projector,
			File = Proj.file,
			_max = Math.max,
			_min = Math.min,
			rect,
			cX, cY,
			el;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// prepare drag object
				el = $(event.target);
				rect = event.target.getBoundingClientRect();
				Self.drag = {
					el,
					clickX: +el.prop("offsetLeft") - event.clientX,
					clickY: +el.prop("offsetTop") - event.clientY,
					min: {
						x: File.oX - (rect.width / 2),
						y: 10,
					},
					max: {
						x: File.width + File.oX - (rect.width / 2),
						y: Proj.aH - rect.height - 10,
					}
				};
				// prevent mouse from triggering mouseover
				APP.els.content.addClass("cover");
				// bind event handlers
				Self.doc.on("mousemove mouseup", Self.compare);
				break;
			case "mousemove":
				cX = _min(_max(event.clientX + Drag.clickX, Drag.min.x), Drag.max.x);
				cY = _min(_max(event.clientY + Drag.clickY, Drag.min.y), Drag.max.y);
				// moves navigator view rectangle
				Drag.el.css({ top: cY +"px", left: cX +"px" });

				// broadcast event
				karaqu.emit("mouse-move", { cX, cY });

				// Projector -> render comparison
				Proj.comparison.cX = cX - Drag.min.x;
				Proj.render();
				break;
			case "mouseup":
				// remove class
				APP.els.content.removeClass("cover");
				// unbind event handlers
				Self.doc.off("mousemove mouseup", Self.compare);
				break;
		}
	}
}
