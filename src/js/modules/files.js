
const Files = {
	init() {
		// file stack
		this.stack = [];
	},
	open(fsFile) {
		// create file
		let file = new File(fsFile);
		
		// add to stack
		this.stack.push(file);

		// add option to menubar
		window.menuBar.add({
			"parent": "//MenuBar/Menu[@name='Window']",
			"check-group": "selected-file",
			"is-checked": 1,
			"click": "select-file",
			"arg": file._file.id,
			"name": file._file.base,
		});

		// select newly added file
		this.select(file._file.id);
	},
	select(_id) {
		// skip reset if this function is called from "open"
		// if (Projector.file && Projector.file._file.id === _id) return;

		// reference to active file
		this._active = this.stack.find(f => f._file.id === _id);

		Projector.reset(this._active);
		Projector.render({ emit: ["projector-zoom", "projector-pan", "projector-update", "select-file"] });
	},
	get activeFile() {
		return this._active;
	}
};
