
import { createCanvas, loadImage } from "./modules/image-helpers";
import { Editor } from "./classes/editor";

@import "./modules/exif.min.js"
@import "./classes/file.js"
@import "./modules/color.new.js"
@import "./modules/misc.js"
@import "./modules/ui.js"
@import "./modules/files.js"
@import "./modules/projector.js"


const TOOLS = {
	_active : false,
	move    : @import "./tools/move.js",
};


const vermeer = {
	init() {
		// fast references
		this.els = {
			content: window.find("content"),
			blankView: window.find(".blank-view"),
			toolbar: {
				sidebar: window.find(`.toolbar-tool_[data-click="toggle-sidebar"]`),
			}
		};

		// init objects
		UI.init();
		Files.init();
		Projector.init();
		Object.keys(TOOLS).filter(t => TOOLS[t].init).map(t => TOOLS[t].init());

		// init all sub-objects
		Object.keys(this)
			.filter(i => typeof this[i].init === "function")
			.map(i => this[i].init(this));

		// initate editor
		this.editor = new Editor(Projector);
		// default tool; move
		this.dispatch({ type: "select-tool", arg: "move" });
	},
	dispatch(event) {
		let Self = vermeer,
			el;
		switch (event.type) {
			// system events
			case "window.init":
				// reset app by default - show initial view
				Self.dispatch({ type: "show-blank-view" });
				break;
			case "window.resize":
				Projector.reset();
				Projector.file.dispatch({ type: "set-scale" });
				break;
			case "window.close":
				// save recents list to settings
				window.settings.setItem("recents", Self.blankView.xRecent);
				// send "kill" signal to workers
				if (Self.editor) Self.editor.dispose();
				break;
			case "open.file":
				// Files.open(event.path);
				event.open({ responseType: "blob" })
					.then(file => Self.dispatch({ type: "prepare-file", file }));
				break;

			// custom events
			case "load-samples":
				// opening image file from application package
				event.names.map(async name => {
					// forward event to app
					let file = await Files.openLocal(`~/samples/${name}`);
					Self.dispatch({ type: "prepare-file", isSample: true, file });
				});
				break;
			case "prepare-file":
				if (!event.isSample) {
					// add file to "recent" list
					Self.blankView.dispatch({ ...event, type: "add-recent-file" });
				}
				// set up workspace
				Self.dispatch({ type: "setup-workspace" });
				// open file with Files
				Files.open(event.file);
				break;
			case "setup-workspace":
				// hide blank view
				Self.els.content.removeClass("show-blank-view");
				// enable & click on show sidebar
				Self.els.toolbar.sidebar
					.removeClass("tool-disabled_")
					.trigger("click");
				break;
			case "show-blank-view":
				// show blank view
				Self.els.content.addClass("show-blank-view");
				break;
			case "save-file":
				file = Files.activeFile;
				// create blob and save file
				file.toBlob(file._file.blob.type, .95)
					.then(blob => window.dialog.save(file._file, blob));
				break;
			case "save-file-as":
				file = Files.activeFile;
				// pass on available file types
				window.dialog.saveAs(file._file, {
					png: () => file.toBlob("image/png"),
					jpg: () => file.toBlob("image/jpeg", .95),
					webp: () => file.toBlob("image/webp"),
				});
				break;
			case "close-file":
				// close file + prepare workspace
				Files.close();
				// show blank view
				Self.els.content.addClass("show-blank-view");
				// hide sidebar, if needed
				if (Self.els.tools.sidebar.hasClass("tool-active_")) {
					Self.els.tools.sidebar.trigger("click");
				}
				break;
			case "open-help":
				karaqu.shell("fs -u '~/help/index.md'");
				break;
				
			case "select-tool":
				if (TOOLS._active === event.arg) return;
				
				if (TOOLS._active) {
					// disable active tool
					TOOLS[TOOLS._active].dispatch({ type: "disable" });
				}
				if (TOOLS[event.arg]) {
					// enable tool
					TOOLS._active = event.arg;
					TOOLS[TOOLS._active].dispatch({ type: "enable" });
				}
				break;
			// proxy events
			case "toggle-sidebar":
				return Self.sidebar.dispatch(event);
			case "set-clut":
				Self.sidebar.box.presets.dispatch(event);
			default:
				if (event.el) {
					let pEl = event.el.parents(`div[data-area]`);
					if (pEl.length) {
						let name = pEl.data("area");
						Self[name].dispatch(event);
					}
				}
		}
	},
	blankView: @import "modules/blankView.js",
	sidebar: @import "sidebar/sidebar.js"
};

window.exports = vermeer;
