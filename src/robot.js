function deg2rad(deg) {
	return Math.PI * deg / 180;
}

function rad2deg(rad) {
	return rad / Math.PI * 180;
}

function makeMovable(speed, heading, x, y) {
	var self = this;
	this.speed = ko.observable(speed);
	this.heading = ko.observable(heading);
	this.origin = new Point(x, y);
	this.move = function () {
		self.origin.move(self.heading(), self.speed());
	};
	this.top = ko.computed(function () {
		return self.origin.y() - 0.5*self.height;
	});
	this.left = ko.computed(function () {
		return self.origin.x() - 0.5*self.width;
	});
}

function Point(x, y) {
	this.x = ko.observable(x);
	this.y = ko.observable(y);
}
Point.prototype.move = function (heading, distance) {
	var rad = deg2rad(heading),
		dy = distance * Math.sin(rad),
		dx = distance * Math.cos(rad);
	this.x(this.x() + dx);
	this.y(this.y() + dy);
};

function Robot(init) {
	var self = this;
	this.name = ko.observable(init.name);
	this.spriteURL = ko.observable(init.spriteURL);
	this.damageCapacity = ko.observable(init.damage);
	this.energyCapacity = ko.observable(init.energy);
	this.damage = ko.observable(init.damage);
	this.energy = ko.observable(init.energy);
	this.stackSize = ko.observable(init.stackSize);
	this.turretAngle = ko.observable(0);
	this.number = ko.observable(0);
	this.hue = ko.computed(function () {
		return (self.number() * 210) % 360;
	});
	makeMovable.call(this, 0, init.heading || 0, init.x || 50, init.y || 50);

	// RoboCode stuff
	this.ptr = ko.observable(0);
	this.instructions = ko.observable([]);
	this.code = ko.observable(init.code);
	this.stack = ko.observableArray();

	this.registers = {};
	RoboCode.registerNames.forEach(function (name) {
		self.registers[name] = ko.observable(0);
	});

	this.compile = function () {
		var results = RoboCode.compile(self.code());
		if (results.errors.length > 0) {
			console.error('Compilation errors:', results.errors);
			alert('Compilation errors');
		}
		else {
			self.instructions(results.instructions);
			self.lineRanges = results.lineRanges;
		}
	};
}

Robot.prototype.width = 32;
Robot.prototype.height = 32;
Robot.prototype.gotoInstruction = function (ptr) {
	this.ptr(ptr);
};
Robot.prototype.pop = function () {
	return this.stack.pop();
};
Robot.prototype.push = function (value) {
	var size = this.stack.push(value);
	if (size > this.stackSize()) {
		throw 'Stack overflow';
	}
};
Robot.prototype.getRegister = function (name) {
	if (!this.registers.hasOwnProperty(name)) {
		throw 'Unknown register: ' + name;
	}
	return this.registers[name]();
};
Robot.prototype.setRegister = function (name, value) {
	if (!this.registers.hasOwnProperty(name)) {
		throw 'Unknown register: ' + name;
	}
	if (typeof value !== 'number') {
		throw 'Register value must be a number, but got: ' + value;
	}
	this.registers[name](value);
};
Robot.prototype.highlightInstruction = function (ptr) {
	var lineNumber = findLineNumber(this.lineRanges, ptr);
	console.log('TODO: highlight source line ' + lineNumber);
};

Robot.defaults = {
	name: 'new robot',
	damage: 100,
	energy: 100,
	stackSize: 100,
	spriteURL: 'img/default-robot.png',
	code: "# new robot\nLoop:\n  aim 5 + aim' store\n  jump Loop\n"
};

function makeProjectile(shooter, angle, speed, heading) {
	this.shooter = shooter;
	makeMovable.call(this);
}
