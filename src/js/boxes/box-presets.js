
// vermeer.box.presets

{
	els: {},
	toggle(root, state) {
		if (state === "on") {
			// fast references
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
						value = ~~(perc * 100),
						i = step.toString().split(".")[1];

					knob.data({ value });
					el.find(".value").html(data[key].toFixed(i ? i.length : 0));
				});

				// save last preset data
				Self.data = data;
				break;
			// custom events
			case "control-change":
				data = Self.els.root.find(".control").reduce((acc, el) => {
					acc[el.classList[1]] = +$(".value", el).text();
					return acc;
				}, {});

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
