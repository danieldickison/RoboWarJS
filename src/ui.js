ko.bindingHandlers.top = {
	update: function (element, valueAccessor, allBindingsAccessor, model, context) {
		var top = ko.utils.unwrapObservable(valueAccessor());
		$(element).css('top', top + 'px');
	}
};
ko.bindingHandlers.left = {
	update: function (element, valueAccessor, allBindingsAccessor, model, context) {
		var left = ko.utils.unwrapObservable(valueAccessor());
		$(element).css('left', left + 'px');
	}
};

ko.bindingHandlers.tint = {
	update: function (element, valueAccessor, allBindingsAccessor, model, context) {
		var hueDeg = ko.utils.unwrapObservable(valueAccessor()) || 0,
			filter = 'hue-rotate(' + hueDeg + 'deg)';
		$(element)
			.css('-webkit-filter', filter)
			.css('-moz-filter', filter)
			.css('filter', filter);
	}
};

ko.bindingHandlers.rotate = {
	update: function (element, valueAccessor, allBindingsAccessor, model, context) {
		var deg = ko.utils.unwrapObservable(valueAccessor()) || 0,
			transform = 'rotate(' + deg + 'deg)';
		$(element)
			.css('-webkit-transform', transform)
			.css('-moz-transform', transform)
			.css('transform', transform);
	}
};

ko.bindingHandlers.spriteURL = {
	update: function (element, valueAccessor, allBindingsAccessor, model, context) {
		var url = ko.utils.unwrapObservable(valueAccessor());
		$(element).css('background-image', 'url(' + url + ')');
	}
};

function ViewModel(arena) {
	var self = this;
	this.registerNames = RoboCode.registerNames;
	this.arena = arena;
	this.selectedRobot = ko.observable();
	this.selectRobot = function (robot, event) {
		self.selectedRobot(robot);
	};
	this.loadRobot = function () {
		arena.addRobot(new Robot(Robot.defaults, arena));
	};
	this.speedOptions = [
		{label: 'slow', delay: 500},
		{label: 'medium', delay: 100},
		{label: 'fast', delay: 50},
		{label: 'blinding', delay: 0},
		{label: '(todo) headless', delay: -1}
	];
	this.speed = ko.observable(this.speedOptions[0]);
	this.projectiles = ko.observableArray();

	this.running = ko.observable(null);
	this.run = function () {
		if (self.running()) return;
		self.running(setInterval(self.tick.bind(self), self.speed().delay));
	};
	this.pause = function () {
		if (!self.running()) return;
		clearInterval(self.running());
		self.running(null);
	};
	this.tick = arena.tick.bind(arena, 1);
	this.oneInstruction = function () {
		// TODO
	};
	this.reset = arena.reset.bind(arena);
}

var arena = new Arena,
	viewModel = new ViewModel(arena);

window.onload = function () {
	ko.applyBindings(viewModel);
};
