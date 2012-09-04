function Arena() {
	var self = this;
	this.robots = ko.observableArray();
	this.reset = function () {
		self.robots().forEach(function (robot) {
			robot.reset();
			robot.origin.x(Math.floor(50 + Math.random() * 300));
			robot.origin.y(Math.floor(50 + Math.random() * 300));
		});
	};
	this.addRobot = function (robot) {
		var number = self.robots.push(robot);
		robot.number(number);
		self.reset();
	};
	this.tick = function (n) {
		if (!n) n = 1;
		for (var i = 0; i < n; i++) {
			self.robots().forEach(function (robot) {
				robot.startTick();
				var cycles = robot.clockSpeed();
				for (var cycle = 0; cycle < cycles; cycle++) {
					robot.executeInstruction();
				}
				robot.endTick();
			});
		}
	};
}
