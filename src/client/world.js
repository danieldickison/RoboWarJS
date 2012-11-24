var Robot = require('../robot');

module.exports = World;

function World(apiAddress, arena) {
    var self = this;
    this.apiAddress = apiAddress;
    this.arena = arena;
    this.openDialogVisible = ko.observable();
    this.exampleRobots = ko.observableArray();
    this.selectedRobot = ko.observable();

    this.selectRobot = function (robot) {
        self.selectedRobot(robot);
    };
    this.loadRobot = function () {
        var robot = new Robot(self.selectedRobot(), arena);
        arena.addRobot(robot);
        self.openDialogVisible(false);
    };
    this.showOpenDialog = function () {
        self.openDialogVisible(true);
        self.refreshExampleRobots();
    };
    this.hideOpenDialog = function () {
        self.openDialogVisible(false);
    };
}

World.prototype.refreshExampleRobots = function () {
    var self = this;
    $.getJSON(this.apiAddress + '/examples')
    .done(function (data) {
        var robotData = data.exampleRobots;
        if (!robotData) {
            alert('No example robot data returned');
            return;
        }
        self.exampleRobots(robotData);
    })
    .fail(function () {
        alert('Failed to fetch example robots');
    });
};

World.prototype.saveRobot = function (robot) {
    var self = this;
    $.post(this.apiAddress + '/robot/' + robot.name(), robot.saveData())
    .done(function (data) {
        console.log('save: ', data);
    })
    .fail(function () {
        alert('Failed to save robot');
    });
};
