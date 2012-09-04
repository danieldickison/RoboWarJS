function deg2rad(deg) {
    return Math.PI * deg / 180;
}

function rad2deg(rad) {
    return rad / Math.PI * 180;
}

function normalizeDegree(deg) {
    return ((360 + (deg % 360)) % 360);
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
    this.collisionTest = function (other) {
        var radius1 = self.radius,
            radius2 = other.radius,
            totalRadius = radius1 + radius2,
            dx = self.origin.x() - other.origin.x(),
            dy = self.origin.y() - other.origin.y();
        return (dx*dx + dy*dy) < (totalRadius * totalRadius);
    };
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

function Robot(init, arena) {
    var self = this;
    this.arena = arena;
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
    this.dead = ko.computed(function () {
        return self.damage() <= 0;
    });
    this.collidingRobots = [];
    this.collidingWalls = {left: 0, right: 0, top: 0, bottom: 0};
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
Robot.prototype.radius = 16;

// At the beginning of the tick, regenerate energy/damage and set all of the auto-updating registers.
Robot.prototype.startTick = function () {
    this.energy(Math.min(this.energyCapacity(), this.energy() + this.energyRegeneration()));
    this.setRegister('engy', this.energy());
    this.setRegister('dmg', this.damage());
    this.setRegister('posx', Math.round(this.origin.x()));
    this.setRegister('posy', Math.round(this.origin.y()));
    this.setRegister('hdg', this.heading());
    this.setRegister('spd', this.speed());
    this.setRegister('aim', normalizeDegree(this.turretAngle() - this.heading()));
    this.setRegister('bllt', 0);
    this.setRegister('mssl', 0);
};
// At the end of the tick, we read out the register values and commit the actions to hardware.
Robot.prototype.endTick = function () {
    var self = this;
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

    this.heading(normalizeDegree(this.getRegister('hdg')));
    this.turretAngle(normalizeDegree(this.getRegister('aim') + this.heading()));

    // We can't move if we're heading into a colliding wall or robot.
    var collision =
            (this.collidingWalls.top && this.heading() > 180) ||
            (this.collidingWalls.bottom && this.heading() < 180) ||
            (this.collidingWalls.left && this.heading() > 90 && this.heading() < 270) ||
            (this.collidingWalls.right && (this.heading() < 90 || this.heading() > 270));
    this.collidingRobots.forEach(function (robot) {
        var dx = robot.origin.x() - self.origin.x(),
            dy = robot.origin.y() - self.origin.y(),
            da = normalizeDegree(self.heading() - rad2deg(Math.atan2(dy, dx)));
        if (da < 90 || da > 270) collision = true;
    });
    this.speed(collision ? 0 : expendEnergy(this.getRegister('spd')));

    var bullet = this.getRegister('bllt'),
        missile = this.getRegister('mssl');
    if (bullet > 0) this.fireProjectile(Bullet, expendEnergy(bullet));
    if (missile > 0) this.fireProjectile(Missile, expendEnergy(missile));

    this.energy(remainingEnergy);
    this.move();

    // Reset collisions so arena can recalculate after each robot moves.
    this.collidingRobots = [];
};
Robot.prototype.fireProjectile = function(type, energy) {
    var projectile = new type(this, this.turretAngle(), energy);
    this.arena.addProjectile(projectile);
};

Robot.prototype.takeProjectileDamage = function (projectile) {
    this.damage(this.damage() - projectile.damage);
    if (this.dead()) {
        projectile.shooter.kills.push(this);
    }
};
Robot.prototype.takeCollisionDamage = function () {
    if (this.collidingWalls.left || this.collidingWalls.right ||
        this.collidingWalls.top || this.collidingWalls.bottom ||
        this.collidingRobots.length > 0) {
        this.damage(this.damage() - Robot.collisionDamage);
    }
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
    if (name === 'rand') {
        return Math.floor(Math.random() * 360);
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
    this.energy(this.energyCapacity());
    this.damage(this.damageCapacity());
    if (this.instructions().length === 0) {
        this.compile();
    }
};
Robot.prototype.highlightInstruction = function (ptr) {
    var lineNumber = findLineNumber(this.lineRanges, ptr);
    console.log('TODO: highlight source line ' + lineNumber);
};

Robot.collisionDamage = 2;

Robot.defaults = {
    name: 'new robot',
    damage: 100,
    energy: 100,
    energyRegeneration: 5,
    stackSize: 100,
    clockSpeed: 5,
    spriteURL: 'img/default-robot.png',
    code: "# I run in circles\nLoop: \n  10 spd' store\n  aim 5 + aim' store\n  hdg rand 6 / - hdg' store\n  Loop jump\n"
};


function makeProjectile(shooter, speed, heading, damage) {
    this.shooter = shooter;
    this.damage = damage;
    var x = shooter.origin.x(),
        y = shooter.origin.y();
    makeMovable.call(this, speed, heading, x, y);
    // Move the projectile away from the shooter's center.
    this.origin.move(heading, shooter.radius);
}

function Bullet(shooter, heading, energy) {
    makeProjectile.call(this, shooter, 10, heading, energy);
}
Bullet.prototype.type = 'bullet';
Bullet.prototype.width = 5;
Bullet.prototype.height = 5;
Bullet.prototype.radius = 2;

function Missile(shooter, heading, energy) {
    makeProjectile.call(this, shooter, 5, heading, 2*energy);
}
Missile.prototype.type = 'missile';
Missile.prototype.width = 8;
Missile.prototype.height = 8;
Missile.prototype.radius = 2;
