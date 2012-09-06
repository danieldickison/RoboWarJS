function Arena() {
    var self = this;
    this.width = 400;
    this.height = 400;
    this.maxRobots = 6;
    this.time = ko.observable(0);
    this.robots = ko.observableArray();
    this.projectiles = ko.observableArray();
    this.livingRobots = ko.computed(function () {
        return self.robots().filter(function (robot) {
            return !robot.dead();
        });
    });
    this.reset = function () {
        self.time(0);
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
        self.time(self.time() + 1);
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
            var robots = self.livingRobots();
            for (var i = 0; i < robots.length; i++) {
                var robot = robots[i];
                if (robot.collisionTest(projectile)) {
                    robot.takeProjectileDamage(projectile);
                    return true;
                }
            }
            if (projectile.origin.x() < 0 || projectile.origin.x() > self.width ||
                projectile.origin.y() < 0 || projectile.origin.y() > self.height) {
                return true;
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
        self.livingRobots().forEach(function (robot) {
            try {
                robot.executeOneCycle();
            }
            catch (e) {
                robot.runtimeError(e);
            }
        });
        return postTickPhase();
    };


    var debugContext;
    this.debugStep = function (robot) {
        if (debugContext && debugContext.robot !== robot) {
            self.endDebug();
        }
        if (!debugContext) {
            debugContext = {
                robot: robot,
                phase: 'pre-tick',
                instruction: 0
            }
        }
        switch (debugContext.phase) {
            case 'pre-tick':
                preTickPhase();
                debugContext.phase = 'execute-robot';
                break;
            case 'execute-robot':
                if (debugOneInstruction()) {
                    debugContext.instruction = 0;
                    debugContext.phase = 'execute-others';
                }
                break;
            case 'execute-others':
                self.livingRobots().forEach(function (other) {
                    if (other === robot) return;
                    try {
                        other.executeOneCycle();
                    }
                    catch (e) {
                        other.runtimeError(e);
                    }
                });
                debugContext.phase = 'post-tick';
                break;
            case 'post-tick':
                postTickPhase();
                debugContext.phase = 'pre-tick';
                break;
        }
        return debugContext;
    };
    this.endDebug = function () {
        if (!debugContext) return;
        while (debugContext.phase !== 'pre-tick') {
            self.debugStep(debugContext.robot);
        }
        debugContext = null;
    };
    function debugOneInstruction() {
        try {
            debugContext.robot.executeOneInstruction();
            debugContext.instruction++;
        }
        catch (e) {
            debugContext.robot.runtimeError(e);
        }
        return debugContext.instruction >= debugContext.robot.clockSpeed();
    }
}
