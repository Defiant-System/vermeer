
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

		UI.init();
		Files.init();
		Projector.init();

		/*
		let cvs = window.find("canvas");
		cvs.prop({ width: window.innerWidth, height: window.innerHeight });

		this.editor = new Editor();

		let img = await loadImage("");
		this.editor.setImage(img);
		*/
		// temp
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
		}
	}
};

window.exports = vermeer;
