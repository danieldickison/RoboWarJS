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

function ViewModel() {
	var self = this;
	this.registerNames = RoboCode.registerNames;
	this.robots = ko.observableArray();
	this.selectedRobot = ko.observable();
	this.selectRobot = function (robot, event) {
		self.selectedRobot(robot);
	};
	this.loadRobot = function () {
		var robot = new Robot(Robot.defaults),
			number = self.robots.push(robot);
		robot.number(number);
	};

	this.projectiles = ko.observableArray();
}

var viewModel = new ViewModel();

window.onload = function () {
	ko.applyBindings(viewModel);
};
