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

var RoboCode = {
    registerNames: ['engy', 'dmg', 'hdg', 'spd', 'aim', 'posx', 'posy', 'rng', 'wall', 'bump', 'bllt', 'mssl', 'rand', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],

    unquoteRegister: function (name) {
        if (typeof name !== 'string' || name[name.length-1] !== "'") {
            throw 'Invalid register name ' + name;
        }
        return name.substr(0, name.length-1);
    },

    operators: {
        // Math
        '+': {
            args: ['addend1', 'addend2'],
            doc: 'adds <addend1> and <addend2> and leaves the result on the stack.',
            exec: function (robot) {
                robot.push(robot.pop() + robot.pop());
            }
        },
        '-': {
            args: ['subtrahend', 'minuend'],
            doc: 'subtracts <subtrahend> from <minuend> and leaves the result on the stack.',
            exec: function (robot) {
                robot.push(-robot.pop() + robot.pop());
            }
        },
        '*': {
            args: ['factor1', 'factor2'],
            doc: 'multiplies <factor1> and <factor2> and leaves the result on the stack.',
            exec: function (robot) {
                robot.push(robot.pop() * robot.pop());
            }
        },
        '/': {
            args: ['denominator', 'numerator'],
            doc: 'divides <numerator> by <denominator> and leaves the result on the stack.',
            exec: function (robot) {
                robot.push(Math.floor(1/robot.pop() * robot.pop()));
            }
        },
        sqrt: {
            args: ['number'],
            doc: 'puts the square root of <number> on the stack.',
            exec: function (robot) {
                robot.push(Math.floor(Math.sqrt(robot.pop())));
            }
        },

        // Trigonometry
        sin: {
            args: ['hypotenuse', 'degrees'],
            doc: 'puts the length of the opposite leg of a right triangle with the given <hypotenuse> and <degrees>, i.e. hypotenuse * sin(degrees).',
            exec: function (robot) {
                var hyp = robot.pop(),
                    deg = robot.pop();
                robot.push(Math.floor(hyp * Math.sin(deg2rad(deg))));
            }
        },
        cos: {
            args: ['hypotenuse', 'degrees'],
            doc: 'puts the length of the adjacent leg of a right triangle with the given <hypotenuse> and <degrees>, i.e. hypotenuse * cos(degrees).',
            exec: function (robot) {
                var hyp = robot.pop(),
                    deg = robot.pop();
                robot.push(Math.floor(hyp * Math.cos(deg2rad(deg))));
            }
        },
        tan: {
            args: ['adjacent', 'degrees'],
            doc: 'puts the length of the opposite leg of a right triangle with the given <adjacent> leg and <degrees>, i.e. adjacent * tan(degrees).',
            exec: function (robot) {
                var adj = robot.pop(),
                    deg = robot.pop();
                robot.push(Math.floor(adj * Math.tan(deg2rad(deg))));
            }
        },
        asin: {
            args: ['opposite', 'hypotenuse'],
            doc: 'puts the angle of a right triangle with the given <opposite> leg and <hypotenuse>, i.e. arcsin(opposite/hypotenuse), range [-90, 90].',
            exec: function (robot) {
                var opp = robot.pop(),
                    hyp = robot.pop();
                robot.push(Math.floor(rad2deg(Math.asin(opp/hyp))));
            }
        },
        asin: {
            args: ['adjacent', 'hypotenuse'],
            doc: 'puts the angle of a right triangle with the given <adjacent> leg and <hypotenuse>, i.e. arccos(adjacent/hypotenuse), range [0, 180].',
            exec: function (robot) {
                var adj = robot.pop(),
                    hyp = robot.pop();
                robot.push(Math.floor(rad2deg(Math.acos(adj/hyp))));
            }
        },
        atan: {
            args: ['opposite', 'adjacent'],
            doc: 'puts the angle of a right triangle with the given <opposite> and <adjacent> legs, i.e. arctan(opposite/adjacent), range (-180, 180].',
            exec: function (robot) {
                var opp = robot.pop(),
                    adj = robot.pop();
                robot.push(Math.floor(rad2deg(Math.atan2(opp, adj))));
            }
        },

        // Boolean
        and: {
            args: ['bool1', 'bool2'],
            doc: 'puts <bool2> on the stack if both <bool1> and <bool2> are non-zero; puts 0 otherwise.',
            exec: function (robot) {
                robot.push((robot.pop() && robot.pop()) || 0);
            }
        },
        or: {
            args: ['bool1', 'bool2'],
            doc: 'puts <bool1> on the stack if either <bool1> or <bool2> is non-zero; puts 0 otherwise.',
            exec: function (robot) {
                robot.push(robot.pop() || robot.pop() || 0);
            }
        },
        not: {
            args: ['bool'],
            doc: 'puts 1 on the stack if <bool> is 0; puts 0 otherwise.',
            exec: function (robot) {
                robot.push(robot.pop() || robot.pop() ? 1 : 0);
            }  
        },

        // Misc.
        drop: {
            args: ['value'],
            doc: 'discards the top <value> on the stack.',
            exec: function (robot) {
                robot.pop();
            }
        },
        dropall: {
            args: [],
            doc: 'discards all values on the stack.',
            exec: function (robot) {
                robot.stack.removeAll();
            }
        },
        dup: {
            args: ['value'],
            doc: 'duplicates <value> on the stack.',
            exec: function (robot) {
                var value = robot.pop();
                robot.push(value);
                robot.push(value);
            }
        },
        swap: {
            args: ['value1', 'value2'],
            doc: 'swaps <value1> and <value2> on the stack.',
            exec: function (robot) {
                var value1 = robot.pop(),
                    value2 = robot.pop();
                robot.push(value1);
                robot.push(value2);
            }
        },
        noop: {
            args: [],
            doc: 'does nothing.',
            exec: function (robot) {}
        },
        sync: {
            args: [],
            doc: 'sleeps until the end of the tick.',
            exec: function (robot) { throw 'robot should handle sync instruction'; }
        },
        debug: {
            args: [],
            doc: 'pauses the game and invokes the debugger at the beginning of the next tick.',
            exec: function (robot) { throw 'robot should handle debug instruction'; }
        },

        // Working with registers.
        store: {
            args: ['name', 'value'],
            doc: 'stores <value> in the <name> register.',
            exec: function (robot) {
                var name = robot.pop(),
                    value = robot.pop();
                robot.setRegister(name, value);
            }
        },
        recall: {
            args: ['name'],
            doc: 'retrieves the value in the <name> register and puts it on the stack.',
            exec: function (robot) {
                var name = robot.pop();
                robot.push(robot.getRegister(name));
            }
        },

        // Branching and jumping.
        ifg: {
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
        ifeg: {
            args: ['no-ptr', 'yes-ptr', 'cond'],
            doc: 'jumps to <no-ptr> if <cond> is 0 and to <yes-ptr> otherwise.',
            exec: function (robot) {
                var noptr = robot.pop(),
                    yesptr = robot.pop(),
                    cond = robot.pop();
                robot.gotoInstruction(cond ? yesptr : noptr);
            }
        },
        if: {
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
        ife: {
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
        jump: {
            args: ['ptr'],
            doc: 'jumps to the <ptr> instruction in the program.',
            exec: function (robot) {
                var ptr = robot.pop();
                robot.gotoInstruction(ptr);
            }
        },
        call: {
            args: ['ptr'],
            doc: 'jumps to <ptr> after leaving a return address on the stack.',
            exec: function (robot) {
                var ptr = robot.pop();
                robot.push(robot.ptr());
                robot.gotoInstruction(ptr);
            }
        }
    },

    compile: function (source) {
        var lines = source.split('\n'),
            instructions = [],
            labels = {},
            labelLookups = [],
            lineRanges = [],
            errors = [];


        function markError(msg, lineNumber, line, token) {
            if (DEBUG) debugger;
            errors.push({
                lineNumber: i,
                line: line,
                token: token,
                msg: msg
            });
        }

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i],
                tokens = line.trim().split(/\s+/),
                lineRange = {start: instructions.length, end: instructions.length};
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
                    var register = token.substr(0, token.length-1);
                    if (RoboCode.registerNames.indexOf(register) === -1) {
                        markError('Unknown register', i, line, token);
                    }
                    else {
                        instructions.push(token);
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
                        var op = RoboCode.operators[token];
                        if (op) {
                            instructions.push(token);
                        }
                        // Check if it's a register retrieval, which becomes 2 instructions.
                        else if (RoboCode.registerNames.indexOf(token) !== -1) {
                            instructions.push(token + "'");
                            instructions.push('recall');
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
        for (var i = 0; i < labelLookups.length; i++) {
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
