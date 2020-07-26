
// vermeer.box.presets

{
	els: {},
	toggle(root, state) {
		if (state === "on") {
			// fast references
			this.els.selectEl = root.find(".box-tools .option[data-menu='preset-list'] .value");
			this.els.root = root;

			// subscribe to events
			defiant.on("select-file", this.dispatch);

			if (this.data) {
				// dispatch if ratio is calculated
				this.dispatch({ type: "select-file", arg: this.data });
			}
		} else {
			// clean up
			this.els = {};

			// unsubscribe to events
			defiant.off("select-file", this.dispatch);
		}
	},
	dispatch(event) {
		let APP = vermeer,
			Self = APP.box.presets,
			Proj = Projector,
			File = Proj.file,
			data,
			el;

		if (!Self.els.root) return;

		switch (event.type) {
			// subscribed events
			case "select-file":
				data = event.arg || File.config;

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
			// custom events
			case "save-values":
				break;
			case "reset-values":
				data = {
					grain              : 0,
					grainScale         : .5,
					vignette           : 0,
					vignetteRadius     : 0,
					lightLeak          : 0,
					lightLeakIntensity : 0,
					lightLeakScale     : 0,
					brightness         : 1,
					blacks             : 0,
					contrast           : 0,
					temperature        : 0,
					vibrance           : 0,
					saturation         : 0,
				};
				Self.dispatch({ type: "select-file", arg: data });
				break;
			case "set-clut":
				let xEl = window.bluePrint.selectSingleNode(`//Menu[@arg="${event.arg}"]`);
				this.els.selectEl.html(xEl.getAttribute("name"));
				// update file's clut filename
				File.config.clutFile = event.arg === "none" ? false : event.arg;
				// apply config on file / image
				APP.editor.setFile(File);
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
	}
}
