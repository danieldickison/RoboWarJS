/* jshint boss: true, debug: true */
'use strict';

function findLineNumber(lineRanges, ptr) {
    var start = 0,
        end = lineRanges.length,
        line = Math.floor((start + end) / 2),
        range = lineRanges[line];
    while (range && (ptr < range.start || ptr >= range.end)) {
        if (ptr < range.start) end = line;
        else start = line + 1;
        line = Math.floor((start + end) / 2);
        range = lineRanges[line];
    }
    return range ? line : -1;
}

function deg2rad(deg) {
    return Math.PI * deg / 180;
}

function rad2deg(rad) {
    return rad / Math.PI * 180;
}

function normalizeDegree(deg) {
    return ((360 + (deg % 360)) % 360);
}


var RoboCode = {
    OP_TAG  : 0x80000000,
    REG_TAG : 0x40000000,
    VAL_MASK: 0x0000ffff,
    NEG_BIT : 0x00008000,

    registers: [
        {
            sym: 'engy'
        },
        {
            sym: 'dmg'
        },
        {
            sym: 'hdg',
            doc: "The heading in degrees counter-clockwise from 3 o'clock"
        },
        {
            sym: 'spd'
        },
        {
            sym: 'aim',
            doc: "The angle of the turret relative to hdg"
        },
        {
            sym: 'posx'
        },
        {
            sym: 'posy'
        },
        {
            sym: 'rng'
        },
        {
            sym: 'wall'
        },
        {
            sym: 'bump'
        },
        {
            sym: 'bllt'
        },
        {
            sym: 'mssl'
        },
        {
            sym: 'rand'
        },
        {
            sym: 'a'
        },
        {
            sym: 'b'
        },
        {
            sym: 'c'
        },
        {
            sym: 'd'
        },
        {
            sym: 'e'
        },
        {
            sym: 'f'
        },
        {
            sym: 'g'
        },
        {
            sym: 'h'
        },
        {
            sym: 'i'
        },
        {
            sym: 'j'
        },
        {
            sym: 'k'
        },
        {
            sym: 'l'
        },
        {
            sym: 'm'
        },
        {
            sym: 'n'
        },
        {
            sym: 'o'
        },
        {
            sym: 'p'
        },
        {
            sym: 'q'
        },
        {
            sym: 'r'
        },
        {
            sym: 's'
        },
        {
            sym: 't'
        },
        {
            sym: 'u'
        },
        {
            sym: 'v'
        },
        {
            sym: 'w'
        },
        {
            sym: 'x'
        },
        {
            sym: 'y'
        },
        {
            sym: 'z'
        }
    ],

    operators: [
        // Math
        {
            sym: '+',
            args: ['addend1', 'addend2'],
            doc: 'adds <addend1> and <addend2> and leaves the result on the stack.',
            exec: function (robot) {
                robot.push(robot.pop() + robot.pop());
            }
        },
        {
            sym: '-',
            args: ['subtrahend', 'minuend'],
            doc: 'subtracts <subtrahend> from <minuend> and leaves the result on the stack.',
            exec: function (robot) {
                robot.push(-robot.pop() + robot.pop());
            }
        },
        {
            sym: '*',
            args: ['factor1', 'factor2'],
            doc: 'multiplies <factor1> and <factor2> and leaves the result on the stack.',
            exec: function (robot) {
                robot.push(robot.pop() * robot.pop());
            }
        },
        {
            sym: '/',
            args: ['denominator', 'numerator'],
            doc: 'divides <numerator> by <denominator> and leaves the result on the stack.',
            exec: function (robot) {
                robot.push(Math.floor(1/robot.pop() * robot.pop()));
            }
        },
        {
            sym: 'sqrt',
            args: ['number'],
            doc: 'puts the square root of <number> on the stack.',
            exec: function (robot) {
                robot.push(Math.floor(Math.sqrt(robot.pop())));
            }
        },
        {
            sym: 'max',
            args: ['number1', 'number2'],
            doc: 'leaves the greater of <number1> and <number2> on the stack.',
            exec: function (robot) {
                robot.push(Math.max(robot.pop(), robot.pop()));
            }
        },
        {
            sym: 'min',
            args: ['number1', 'number2'],
            doc: 'leaves the lesser of <number1> and <number2> on the stack.',
            exec: function (robot) {
                robot.push(Math.min(robot.pop(), robot.pop()));
            }
        },

        // Trigonometry
        {
            sym: 'sin',
            args: ['hypotenuse', 'degrees'],
            doc: 'puts the length of the opposite leg of a right triangle with the given <hypotenuse> and <degrees>, i.e. hypotenuse * sin(degrees).',
            exec: function (robot) {
                var hyp = robot.pop(),
                    deg = robot.pop();
                robot.push(Math.floor(hyp * Math.sin(deg2rad(deg))));
            }
        },
        {
            sym: 'cos',
            args: ['hypotenuse', 'degrees'],
            doc: 'puts the length of the adjacent leg of a right triangle with the given <hypotenuse> and <degrees>, i.e. hypotenuse * cos(degrees).',
            exec: function (robot) {
                var hyp = robot.pop(),
                    deg = robot.pop();
                robot.push(Math.floor(hyp * Math.cos(deg2rad(deg))));
            }
        },
        {
            sym: 'tan',
            args: ['adjacent', 'degrees'],
            doc: 'puts the length of the opposite leg of a right triangle with the given <adjacent> leg and <degrees>, i.e. adjacent * tan(degrees).',
            exec: function (robot) {
                var adj = robot.pop(),
                    deg = robot.pop();
                robot.push(Math.floor(adj * Math.tan(deg2rad(deg))));
            }
        },
        {
            sym: 'asin',
            args: ['opposite', 'hypotenuse'],
            doc: 'puts the angle of a right triangle with the given <opposite> leg and <hypotenuse>, i.e. arcsin(opposite/hypotenuse), range [-90, 90].',
            exec: function (robot) {
                var opp = robot.pop(),
                    hyp = robot.pop();
                robot.push(Math.floor(rad2deg(Math.asin(opp/hyp))));
            }
        },
        {
            sym: 'acos',
            args: ['adjacent', 'hypotenuse'],
            doc: 'puts the angle of a right triangle with the given <adjacent> leg and <hypotenuse>, i.e. arccos(adjacent/hypotenuse), range [0, 180].',
            exec: function (robot) {
                var adj = robot.pop(),
                    hyp = robot.pop();
                robot.push(Math.floor(rad2deg(Math.acos(adj/hyp))));
            }
        },
        {
            sym: 'atan',
            args: ['opposite', 'adjacent'],
            doc: 'puts the angle of a right triangle with the given <opposite> and <adjacent> legs, i.e. arctan(opposite/adjacent), range (-180, 180].',
            exec: function (robot) {
                var opp = robot.pop(),
                    adj = robot.pop();
                robot.push(Math.floor(rad2deg(Math.atan2(opp, adj))));
            }
        },

        // Boolean
        {
            sym: 'and',
            args: ['bool1', 'bool2'],
            doc: 'puts <bool2> on the stack if both <bool1> and <bool2> are non-zero; puts 0 otherwise.',
            exec: function (robot) {
                robot.push((robot.pop() && robot.pop()) || 0);
            }
        },
        {
            sym: 'or',
            args: ['bool1', 'bool2'],
            doc: 'puts <bool1> on the stack if either <bool1> or <bool2> is non-zero; puts 0 otherwise.',
            exec: function (robot) {
                robot.push(robot.pop() || robot.pop() || 0);
            }
        },
        {
            sym: 'not',
            args: ['bool'],
            doc: 'puts 1 on the stack if <bool> is 0; puts 0 otherwise.',
            exec: function (robot) {
                robot.push(robot.pop() || robot.pop() ? 1 : 0);
            }  
        },

        // Misc.
        {
            sym: 'drop',
            args: ['value'],
            doc: 'discards the top <value> on the stack.',
            exec: function (robot) {
                robot.pop();
            }
        },
        {
            sym: 'dropall',
            args: [],
            doc: 'discards all values on the stack.',
            exec: function (robot) {
                robot.stack.removeAll();
            }
        },
        {
            sym: 'dup',
            args: ['value'],
            doc: 'duplicates <value> on the stack.',
            exec: function (robot) {
                var value = robot.pop();
                robot.push(value);
                robot.push(value);
            }
        },
        {
            sym: 'swap',
            args: ['value1', 'value2'],
            doc: 'swaps <value1> and <value2> on the stack.',
            exec: function (robot) {
                var value1 = robot.pop(),
                    value2 = robot.pop();
                robot.push(value1);
                robot.push(value2);
            }
        },
        {
            sym: 'noop',
            args: [],
            doc: 'does nothing.',
            exec: function (robot) {}
        },
        {
            sym: 'sync',
            args: [],
            doc: 'sleeps until the end of the tick.',
            exec: function (robot) { throw 'robot should handle sync instruction'; }
        },
        {
            sym: 'debug',
            args: [],
            doc: 'pauses the game and invokes the debugger at the beginning of the next tick.',
            exec: function (robot) { throw 'robot should handle debug instruction'; }
        },

        // Working with registers.
        {
            sym: 'store',
            args: ['register', 'value'],
            doc: 'stores <value> in <register>.',
            exec: function (robot) {
                var register = robot.pop(),
                    value = robot.pop();
                robot.setRegister(register, value);
            }
        },
        {
            sym: 'recall',
            args: ['register'],
            doc: 'retrieves the value in <register> and puts it on the stack.',
            exec: function (robot) {
                var register = robot.pop();
                robot.push(robot.getRegister(register));
            }
        },

        // Branching and jumping.
        {
            sym: 'ifg',
            args: ['ptr', 'cond'],
            doc: 'jumps to <ptr> if <cond> is not 0.',
            exec: function (robot) {
                var ptr = robot.pop(),
                    cond = robot.pop();
                if (cond) {
                    robot.gotoInstruction(ptr);
                }
            }
        },
        {
            sym: 'ifeg',
            args: ['no-ptr', 'yes-ptr', 'cond'],
            doc: 'jumps to <no-ptr> if <cond> is 0 and to <yes-ptr> otherwise.',
            exec: function (robot) {
                var noptr = robot.pop(),
                    yesptr = robot.pop(),
                    cond = robot.pop();
                robot.gotoInstruction(cond ? yesptr : noptr);
            }
        },
        {
            sym: 'if',
            args: ['ptr', 'cond'],
            doc: 'if <cond> is not 0, calls <ptr>, leaving a return address on the stack.',
            exec: function (robot) {
                var ptr = robot.pop(),
                    cond = robot.pop();
                if (cond) {
                    robot.push(robot.ptr());
                    robot.gotoInstruction(ptr);
                }
            }
        },
        {
            sym: 'ife',
            args: ['no-ptr', 'yes-ptr', 'cond'],
            doc: 'calls <no-ptr> if <cond> is 0 and <yes-ptr> otherwise, leaving a return address on the stack.',
            exec: function (robot) {
                var noptr = robot.pop(),
                    yesptr = robot.pop(),
                    cond = robot.pop();
                robot.push(robot.ptr());
                robot.gotoInstruction(cond ? yesptr : noptr);
            }
        },
        {
            sym: 'jump',
            args: ['ptr'],
            doc: 'jumps to the <ptr> instruction in the program.',
            exec: function (robot) {
                var ptr = robot.pop();
                robot.gotoInstruction(ptr);
            }
        },
        {
            sym: 'call',
            args: ['ptr'],
            doc: 'jumps to <ptr> after leaving a return address on the stack.',
            exec: function (robot) {
                var ptr = robot.pop();
                robot.push(robot.ptr());
                robot.gotoInstruction(ptr);
            }
        }
    ],

    findRegister: function (symOrIndex) {
        var register;
        if ('string' === typeof symOrIndex) {
            register = RoboCode.registersBySym[symOrIndex];
        }
        else if ('number' === typeof symOrIndex) {
            register = RoboCode.registers[symOrIndex & RoboCode.VAL_MASK];
        }
        else {
            throw 'Invalid register specifier: ' + symOrIndex;
        }

        if (!register) {
            throw 'Unknown register: ' + symOrIndex;
        }
        return register;
    },

    formatCode: function (code) {
        if (code & RoboCode.OP_TAG) {
            return RoboCode.operators[code & RoboCode.VAL_MASK].sym;
        }
        else if (code & RoboCode.REG_TAG) {
            return RoboCode.registers[code & RoboCode.VAL_MASK].sym + "'";
        }
        else return code;
    },

    compile: function (source) {
        var lines = source.split('\n'),
            instructions = [],
            labels = {},
            labelLookups = [],
            lineRanges = [],
            errors = [],
            i;


        function markError(msg, lineNumber, line, token) {
            if (DEBUG) debugger;
            errors.push({
                lineNumber: lineNumber,
                line: line,
                token: token,
                msg: msg
            });
        }

        for (i = 0; i < lines.length; i++) {
            var line = lines[i],
                tokens = line.trim().split(/\s+/),
                lineRange = {start: instructions.length, end: instructions.length},
                register, op;
            lineRanges.push(lineRange);

            // Skip empty and comment lines.
            if (tokens.length === 0 || tokens[0][0] === '#') continue;

            for (var j = 0; j < tokens.length; j++) {
                var token = tokens[j];
                if (!token) continue;

                token = token.toLowerCase();

                // Mark position of labels.
                if (token[token.length-1] === ':') {
                    labels[token.substr(0, token.length-1)] = instructions.length;
                }
                // Verify names of quoted registers.
                else if (token[token.length-1] === "'") {
                    var sym = token.substr(0, token.length-1);
                    register = RoboCode.registersBySym[sym];
                    if (!register) {
                        markError('Unknown register', i, line, token);
                    }
                    else {
                        instructions.push(register.index | RoboCode.REG_TAG);
                    }
                }
                else {
                    // Check if it's a numeric literal.
                    var number = parseInt(token);
                    if (!isNaN(number)) {
                        instructions.push(number);
                    }
                    else {
                        // Check if it's an operator.
                        if (op = RoboCode.operatorsBySym[token]) {
                            instructions.push(op.index | RoboCode.OP_TAG);
                        }
                        // Check if it's a register retrieval, which becomes 2 instructions.
                        else if (register = RoboCode.registersBySym[token]) {
                            instructions.push(register.index | RoboCode.REG_TAG);
                            instructions.push(RoboCode.operatorsBySym.recall.index | RoboCode.OP_TAG);
                        }
                        // Otherwise, it should be a jump label. Stash these for resolving later.
                        else {
                            labelLookups.push(instructions.length);
                            instructions.push(token);
                        }
                    }
                }
            } // End token loop.
            lineRange.end = instructions.length;
        } // End line loop.

        // Resolve labels.
        for (i = 0; i < labelLookups.length; i++) {
            var ptr = labelLookups[i],
                label = instructions[ptr],
                labelPtr = labels[label];
            if (typeof labelPtr === 'number') {
                instructions[ptr] = labelPtr;
            }
            else {
                var lineNumber = findLineNumber(lineRanges, ptr);
                markError('Unknown label', lineNumber, lines[lineNumber], label);
            }
        }

        return {
            instructions: instructions,
            labels: labels,
            lineRanges: lineRanges,
            errors: errors
        };
    }
};
RoboCode.operatorsBySym = {};
RoboCode.operators.forEach(function (op, index) {
    op.index = index;
    RoboCode.operatorsBySym[op.sym] = op;
});
RoboCode.registersBySym = {};
RoboCode.registers.forEach(function (reg, index) {
    reg.index = index;
    reg.doc = reg.doc || null;
    RoboCode.registersBySym[reg.sym] = reg;
});

module.exports = RoboCode;
