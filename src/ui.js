/* jshint browser: true */
'use strict';

var Arena = require('./arena'),
    Robot = require('./robot'),
    RoboCode = require('./code'),
    World = require('./client/world');

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

/* Animated visibility toggle.
    Optional additional properties: animationType ('slide' or 'fade') and animationSpeed (ms or 'slow' or 'fast')
    Example: data-bind='animateVisible: showMe, animationType: "slide", animationSpeed: "slow"'
*/
ko.bindingHandlers.animateVisible = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        $(element).css('display', value ? null : 'none');
    },
    update: function (element, valueAccessor, allBindingsAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor()),
            allBindings = allBindingsAccessor(),
            animation = ko.utils.unwrapObservable(allBindings.animationType) || 'fade',
            speed = ko.utils.unwrapObservable(allBindings.animationSpeed) || 'fast';
        switch (animation) {
            case 'fade':
                $(element)[value ? 'fadeIn' : 'fadeOut'](speed);
                break;
            case 'slide':
                $(element).slideToggleBool(!!value, speed);
                break;
            case 'toggle':
                $(element)[value ? 'show' : 'hide'](speed);
                break;
            default:
                throw 'Unknown animation type ' + animation;
        }
    }
};

function ViewModel(arena, world) {
    var self = this;
    this.RoboCode = RoboCode;
    this.arena = arena;
    this.world = world;
    this.flippedY = ko.observable(true);
    this.selectedRobot = ko.observable();
    this.selectRobot = function (robot, event) {
        arena.robots().forEach(function (otherBot) {
            otherBot.viewModel = null;
        });
        robot.viewModel = self;
        self.selectedRobot(robot);
    };
    this.loadRobot = function () {
        world.showOpenDialog();
    };
    this.removeRobot = function () {
        arena.removeRobot(self.selectedRobot());
    };
    this.saveRobot = function () {
        self.selectedRobot().compile();
        world.saveRobot(self.selectedRobot());
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

    this.editorTab = ko.observable('code');
    this.showCode = function () {self.editorTab('code');};
    this.showHardware = function () {self.editorTab('hardware');};
    this.showStats = function () {self.editorTab('stats');};

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
    this.currentOperator = ko.computed(function () {
        var robot = self.selectedRobot();
        if (robot) {
            var instruction = robot.currentInstruction();
            if (instruction & RoboCode.OP_TAG) {
                return RoboCode.operators[instruction & RoboCode.VAL_MASK];
            }
        }
        return null;
    });
    // currentStack reverses the order for debug display purposes (robot's stack order is more efficient with pop/push).
    this.currentStack = ko.computed(function () {
        var robot = self.selectedRobot();
        if (!robot) return null;
        else {
            var stack = robot.stack(),
                reversed = [];
            for (var i = stack.length-1; i >= 0; i--) {
                reversed.push(stack[i]);
            }
            return reversed;
        }
    });
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

var arena = new Arena(),
    world = new World('/api', arena),
    viewModel = new ViewModel(arena, world);

exports.viewModel = viewModel;

$(document).ready(function () {
    window.viewModel = viewModel;
    ko.applyBindings(viewModel);
});
