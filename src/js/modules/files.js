
const Files = {
	init() {
		// file stack
		this.stack = [];
	},
	getUniqId() {
		let ids = this.stack.map(f => f._id);
		return Math.max.apply({}, [0, ...ids]) + 1;
	},
	open(path) {
		let _id =  this.getUniqId(),
			opt = { _id, path };

		// add to stack
		let file = new File(opt);
		this.stack.push(file);

		// select newly added file
		//this.select(_id);
	},
	select(_id) {
		// skip rest if this function is called from "open"
		if (Projector.file && Projector.file._id === _id) return;

		// reference to active file
		let file = this.stack.find(f => f._id === _id);
		Projector.reset(file);
		Projector.render({ emit: ["projector-zoom", "projector-pan", "projector-update"] });
	}
};
