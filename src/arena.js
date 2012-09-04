function Arena() {
    var self = this;
    this.width = 400;
    this.height = 400;
    this.robots = ko.observableArray();
    this.projectiles = ko.observableArray();
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
            self.projectiles().forEach(function (projectile) {
                projectile.move();
            });
            self.projectiles.remove(function (projectile) {
                return (projectile.origin.x() < 0 || projectile.origin.x() > self.width ||
                    projectile.origin.y() < 0 || projectile.origin.y() > self.height);
            });
        }
    };
}
