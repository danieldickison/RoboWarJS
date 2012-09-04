function Arena() {
    var self = this;
    this.width = 400;
    this.height = 400;
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
        robot.number(number);
        self.reset();
    };
    this.addProjectile = function (projectile) {
        self.projectiles.push(projectile);
    };

    this.tick = function () {
        // Process robots.
        self.livingRobots().forEach(function (robot) {
            robot.startTick();
            var cycles = robot.clockSpeed();
            for (var cycle = 0; cycle < cycles; cycle++) {
                robot.executeInstruction();
            }
            robot.endTick();
        });

        // Move projectiles and do collision testing of projectiles to robots.
        self.projectiles.remove(function (projectile) {
            projectile.move();

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

        // Do collision testing of robots with other robots.
        var robots = self.livingRobots();
        for (var i = 0; i < robots.length-1; i++) {
            var robot1 = robots[i];
            for (var j = i+1; j < robots.length; j++) {
                var robot2 = robots[j];
                if (robot1.collisionTest(robot2)) {
                    robot1.collidingRobots.push(robot2);
                    robot2.collidingRobots.push(robot1);
                }
            }
        }

        // Assess collision damage.
        robots.forEach(function (robot) {
            robot.collidingWalls.left = robot.origin.x() < robot.radius;
            robot.collidingWalls.right = robot.origin.x() > self.width - robot.radius;
            robot.collidingWalls.top = robot.origin.y() < robot.radius;
            robot.collidingWalls.bottom = robot.origin.y() > self.height - robot.radius;
            robot.takeCollisionDamage();
        });
    };
}
