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
	this.energyRegeneration = ko.observable(init.energyRegeneration);
	this.damage = ko.observable(init.damage);
	this.energy = ko.observable(init.energy);
	this.stackSize = ko.observable(init.stackSize);
	this.clockSpeed = ko.observable(init.clockSpeed);
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

// At the beginning of the tick, regenerate energy/damage and set all of the auto-updating registers.
Robot.prototype.startTick = function () {
	this.energy(Math.min(this.energyCapacity(), this.energy() + this.energyRegeneration()));
	this.setRegister('engy', this.energy());
	this.setRegister('dmg', this.damage());
	this.setRegister('posx', Math.round(this.origin.x()));
	this.setRegister('posy', Math.round(this.origin.y()));
	this.setRegister('hdg', this.heading());
	this.setRegister('spd', this.speed());
	this.setRegister('aim', (this.turretAngle() - this.heading()) % 360);
};
// At the end of the tick, we read out the register values and commit the actions to hardware.
Robot.prototype.endTick = function () {
	var remainingEnergy = this.energy();
	function expendEnergy(amount) {
		if (amount === 0) return 0;
		var abs = Math.abs(amount);
		if (abs > remainingEnergy) {
			amount = (amount > 0 ? 1 : -1) * remainingEnergy;
			remainingEnergy = 0;
		}
		else {
			remainingEnergy -= abs;
		}
		return amount;
	}

	this.heading(this.getRegister('hdg') % 360);
	this.turretAngle((this.getRegister('aim') + this.heading()) % 360);
	this.speed(expendEnergy(this.getRegister('spd')));

	this.energy(remainingEnergy);
	this.move();
};

Robot.prototype.executeInstruction = function () {
	var instruction = this.instructions()[this.ptr()];
	this.ptr(this.ptr() + 1);
	if (typeof instruction === 'number') {
		this.push(instruction);
	}
	else {
		var op = RoboCode.operators[instruction];
		if (op) {
			op.exec(this);
		}
		else {
			this.push(RoboCode.unquoteRegister(instruction));
		}
	}
};
Robot.prototype.gotoInstruction = function (ptr) {
	this.ptr(ptr);
};
Robot.prototype.pop = function () {
	var value = this.stack.pop();
	if (typeof value === 'undefined') {
		throw 'Stack underflow';
	}
	return value;
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
Robot.prototype.reset = function () {
	var self = this;
	RoboCode.registerNames.forEach(function (name) {
		self.setRegister(name, 0);
	});
	this.stack([]);
	this.ptr(0);
	this.speed(0);
	this.heading(0);
	this.turretAngle(0);
	if (this.instructions().length === 0) {
		this.compile();
	}
};
Robot.prototype.highlightInstruction = function (ptr) {
	var lineNumber = findLineNumber(this.lineRanges, ptr);
	console.log('TODO: highlight source line ' + lineNumber);
};

Robot.defaults = {
	name: 'new robot',
	damage: 100,
	energy: 100,
	energyRegeneration: 10,
	stackSize: 100,
	clockSpeed: 3,
	spriteURL: 'img/default-robot.png',
	code: "# new robot\n11 spd' store\nLoop:\n  aim 5 + aim' store\n  hdg 30 - hdg' store\n  Loop jump\n"
};

function makeProjectile(shooter, angle, speed, heading) {
	this.shooter = shooter;
	makeMovable.call(this);
}
