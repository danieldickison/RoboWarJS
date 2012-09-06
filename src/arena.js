function Arena() {
    var self = this;
    this.width = 400;
    this.height = 400;
    this.maxRobots = 6;
    this.robots = ko.observableArray();
    this.projectiles = ko.observableArray();
    this.livingRobots = ko.computed(function () {
        return self.robots().filter(function (robot) {
            return !robot.dead();
        });
    });
    this.reset = function () {
        self.robots().forEach(function (robot) {
            robot.reset();
            robot.origin.x(Math.floor(50 + Math.random() * 300));
            robot.origin.y(Math.floor(50 + Math.random() * 300));
        });
        self.projectiles([]);
    };
    this.addRobot = function (robot) {
        var number = self.robots.push(robot);
        robot.number(number - 1);
        self.reset();
    };
    this.removeRobot = function (robot) {
        self.robots.remove(robot);
    };
    this.addProjectile = function (projectile) {
        self.projectiles.push(projectile);
    };

    // Do collisions and damage assessment.
    function preTickPhase() {
        var robots = self.livingRobots();

        // Initialize robots for the tick and calculate collisions.
        robots.forEach(function (robot) {
            robot.startTick();
        });

        // Assess collision damage.
        robots.forEach(function (robot) {
            robot.takeCollisionDamage();
        });

        // Do collision testing of projectiles to the remaining robots.
        self.projectiles.remove(function (projectile) {
            if (projectile.origin.x() < 0 || projectile.origin.x() > self.width ||
                projectile.origin.y() < 0 || projectile.origin.y() > self.height) {
                return true;
            }

            var robots = self.livingRobots();
            for (var i = 0; i < robots.length; i++) {
                var robot = robots[i];
                if (robot.collisionTest(projectile)) {
                    robot.takeProjectileDamage(projectile);
                    return true;
                }
            }
            return false;
        });

        // Update robot registers, which should reflect the new and collisions.
        self.livingRobots().forEach(function (robot) {
            robot.updateRegisters();
        });
    }

    // Move everything and check to see if there's a winner.
    function postTickPhase() {
        self.livingRobots().forEach(function (robot) {
            robot.endTick();
        });
        self.projectiles().forEach(function (projectile) {
            projectile.move();
        });

        // Declare a victor or a tie.
        if (self.livingRobots().length <= 1) {
            return self.livingRobots()[0] || 'tie';
        }
        else {
            return null;
        }
    }

    this.tick = function () {
        preTickPhase();

        // Process robots.
        self.livingRobots().forEach(function (robot) {
            try {
                var cycles = robot.clockSpeed();
                for (var cycle = 0; cycle < cycles; cycle++) {
                    robot.executeInstruction();
                }
            }
            catch (e) {
                robot.runtimeError(e);
            }
        });

        return postTickPhase();
    };
}
