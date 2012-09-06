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

ko.bindingHandlers.scrollIntoViewWhen = {
    update: function (element, valueAccessor, allBindingsAccessor, model, context) {
        if (!ko.utils.unwrapObservable(valueAccessor())) return;
        var $element = $(element),
            top = $element.position().top,
            bottom = top + $element.height(),
            scrollTop = $element.parent().scrollTop(),
            scrollHeight = $element.parent().height();
        if (top < 0 || bottom > scrollHeight) {
            $element.parent().scrollTop(scrollTop + top);
        }
    }
};

function ViewModel(arena) {
    var self = this;
    this.registerNames = RoboCode.registerNames;
    this.arena = arena;
    this.flippedY = ko.observable(true);
    this.selectedRobot = ko.observable();
    this.selectRobot = function (robot, event) {
        self.selectedRobot(robot);
    };
    this.loadRobot = function () {
        var robot = new Robot(Robot.defaults, arena);
        arena.addRobot(robot);
        robot.code(Robot.examplePrograms[robot.number() % Robot.examplePrograms.length]);
        robot.compile();
    };
    this.removeRobot = function () {
        arena.removeRobot(self.selectedRobot());
    };
    this.speedOptions = [
        {label: 'slow', delay: 500},
        {label: 'medium', delay: 100},
        {label: 'fast', delay: 50},
        {label: 'blinding', delay: 0}
        //,{label: '(todo) headless', delay: -1}
    ];
    this.speed = ko.observable(this.speedOptions[0]);
    this.projectiles = ko.observableArray();

    this.running = ko.observable(null);
    this.run = function () {
        if (self.running()) return;
        if (self.speed().delay <= 0) {
            self.selectedRobot(null);
        }
        endDebug();
        self.running(setInterval(doTick, self.speed().delay));
        function doTick() {
            if (arena.tick()) {
                self.pause();
            }
        }
    };
    this.pause = function () {
        if (!self.running()) return;
        clearInterval(self.running());
        self.running(null);
    };
    this.tick = function () {
        endDebug();
        arena.tick();
    };
    this.debugPhase = ko.observable();
    this.debugInstruction = ko.observable(0);
    this.debugStep = function () {
        var context = arena.debugStep(self.selectedRobot());
        self.debugPhase(context.phase);
        self.debugInstruction(context.instruction);
    };
    function endDebug() {
        arena.endDebug();
        self.debugPhase(null);
    }
    this.reset = arena.reset.bind(arena);
}

var arena = new Arena,
    viewModel = new ViewModel(arena);

window.onload = function () {
    ko.applyBindings(viewModel);
};
