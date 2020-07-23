
defiant.require("classes/file.js")

defiant.require("modules/misc.js")
defiant.require("modules/ui.js")
defiant.require("modules/files.js")
defiant.require("modules/projector.js");
defiant.require("modules/exif.min.js");

import { loadImage } from "./modules/image-helpers";
import { Editor } from "./classes/editor";

const vermeer = {
	init() {
		// fast references
		this.content = window.find("content");

		// init objects
		UI.init();
		Files.init();
		Projector.init();

		// init sidebar initial boxes
		["navigator", "presets"].map(item => {
			let box = window.store(`boxes/box-${item}.htm`, `div[data-box="${item}"]`);
			this.box[item].toggle(box, "on");
		});

		// initate editor
		this.editor = new Editor();
		
		// temp
		//this.dispatch({ type: "open-file", path: "~/images/pilatus.jpg" });
		//this.dispatch({ type: "open-file", path: "~/images/cup.jpg" });
		this.dispatch({ type: "open-file", path: "~/images/svetlana-pochatun.jpg" });
	},
	dispatch(event) {
		let Self = vermeer,
			name,
			el;
		switch (event.type) {
			case "open-file":
				Files.open(event.path);
				break;
			case "set-clut":
				console.log(event);
				break;
		}
	},
	box: {
		navigator: defiant.require("boxes/box-navigator.js"),
		adjust:    defiant.require("boxes/box-adjust.js"),
		info:      defiant.require("boxes/box-info.js"),
		presets:   defiant.require("boxes/box-presets.js")
	}
};

window.exports = vermeer;
