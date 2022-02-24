
const UI = {
	init() {
		// fast references
		this.doc = $(document);
		this.content = window.find("content");

		// bind event handlers
		//this.content.on("click", ".option .value", this.dispatch);
		this.content.on("mousedown", ".knob, .pan-knob", this.doKnob);

		// temp
		// setTimeout(() =>
		// 	this.content.find(".option[data-options='brush-tips'] .value").trigger("click"), 200);
	},
	dispatch(event) {

	},
	doKnob(event) {
		let APP = vermeer,
			Self = UI,
			Drag = Self.drag,
			name,
			value,
			type,
			el;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();

				el = $(event.target);
				value = +el.data("value");

				Self.drag = {
					el,
					value,
					clientY: event.clientY,
					clientX: event.clientX,
					min: el.hasClass("pan-knob") ? -50 : 0,
					max: el.hasClass("pan-knob") ? 50 : 100,
					val: {
						el: el.parent().find(".value"),
						min: el.hasClass("pan-knob") ? 0 : +el.data("min"),
						max: +el.data("max") - +el.data("min"),
						step: +el.data("step") || 1,
					}
				};

				// bind event handlers
				Self.content.addClass("no-cursor");
				Self.doc.on("mousemove mouseup", Self.doKnob);
				break;
			case "mousemove":
				value = (Drag.clientY - event.clientY) + Drag.value;
				value = Math.min(Math.max(value, Drag.min), Drag.max);
				Drag.el.data({ value });

				let i = Drag.val.step.toString().split(".")[1],
					val = (Drag.val.max * (value / 100)) + Drag.val.min;

				Drag.val.el.html(val.toFixed(i ? i.length : 0));
				break;
			case "mouseup":
				// unbind event handlers
				Self.content.removeClass("no-cursor");
				Self.doc.off("mousemove mouseup", Self.doKnob);

				// emit change event
				name = Drag.el.parents("[data-box]").data("box");
				type = Drag.el.data("emit");
				if (name && type) {
					APP.sidebar.box[name].dispatch({ type });
				}
				break;
		}
	}
};
