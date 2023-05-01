const std = @import("std");
const Instructions = @import("instructions.zig");

// Design decisions:
// - The stack is used for calculations and for passing arguments to functions.
// - The activation record is a stack used to keep track of function calls.  Variables are
//   stored in the data secion of the action record.  These variables are made up of
//   parameters and local bindings.
// - A closure points to the address of where execution is to commence when the closure is
//   invoked and to the activation record that describes the environment in which the closure
//   can execute.

const Colour = enum(u2) {
    Black = 0,
    White = 1,
};

const Value = struct {
    colour: Colour,
    next: ?*Value,

    v: ValueValue,

    pub fn activationDepth(self: *Value) !u32 {
        switch (self.v) {
            .n => return 0,
            .b => return 0,
            .c => return 1,
            .a => return 1 + if (self.v.a.parentActivation == null) 0 else try self.v.a.parentActivation.?.activationDepth(),
        }
    }

    pub fn toString(self: *Value, allocator: std.mem.Allocator) ![]u8 {
        switch (self.v) {
            .n => return std.fmt.allocPrint(allocator, "{}", .{self.v.n}),
            .b => return std.fmt.allocPrint(allocator, "{}", .{self.v.b}),
            .c => return std.fmt.allocPrint(allocator, "c{d}#{d}", .{ self.v.c.ip, try self.activationDepth() }),
            .a => return std.fmt.allocPrint(allocator, "a{d}#{d}", .{ self.v.a.nextIP, try self.activationDepth() }),
        }
    }

    pub fn deinit(self: *Value, allocator: std.mem.Allocator) void {
        switch (self.v) {
            .n, .b, .c => {},
            .a => {
                if (self.v.a.data != null) {
                    allocator.free(self.v.a.data.?);
                    self.v.a.data = null;
                }
            },
        }
    }
};

const ValueValue = union(enum) {
    n: i32,
    b: bool,
    c: Closure,
    a: Activation,
};

const Closure = struct {
    previousActivation: ?*Value,
    ip: u32,
};

const Activation = struct {
    parentActivation: ?*Value,
    closure: ?*Value,
    nextIP: u32,
    data: ?[]?*Value,
};

const MemoryState = struct {
    allocator: std.mem.Allocator,
    ip: u32,
    memory: []const u8,
    stack: std.ArrayList(*Value),
    activation: *Value,
    colour: Colour,
    root: ?*Value,
    memory_size: u32,
    memory_capacity: u32,

    fn attach_value(self: *MemoryState, value: *Value) void {
        self.memory_size += 1;
        value.colour = self.colour;
        value.next = self.root;
        self.root = value;
    }

    pub fn newActivation(self: *MemoryState, parentActivation: ?*Value, closure: ?*Value, nextIP: u32) !*Value {
        gc(self);

        const v = try self.allocator.create(Value);
        v.v = ValueValue{ .a = Activation{ .parentActivation = parentActivation, .closure = closure, .nextIP = nextIP, .data = null } };
        try self.stack.append(v);

        attach_value(self, v);

        return v;
    }

    pub fn newBool(self: *MemoryState, b: bool) !*Value {
        gc(self);

        const v = try self.allocator.create(Value);
        v.v = ValueValue{ .b = b };
        try self.stack.append(v);

        attach_value(self, v);

        return v;
    }

    pub fn newClosure(self: *MemoryState, parentActivation: ?*Value, targetIP: u32) !*Value {
        gc(self);

        const v = try self.allocator.create(Value);
        v.v = ValueValue{ .c = Closure{ .previousActivation = parentActivation, .ip = targetIP } };
        try self.stack.append(v);

        attach_value(self, v);

        return v;
    }

    pub fn newInt(self: *MemoryState, i: i32) !*Value {
        gc(self);

        const v = try self.allocator.create(Value);
        v.v = ValueValue{ .n = i };
        try self.stack.append(v);

        attach_value(self, v);

        return v;
    }

    pub fn pop(self: *MemoryState) *Value {
        return self.stack.pop();
    }

    pub fn peek(self: *MemoryState, n: u32) *Value {
        return self.stack.items[self.stack.items.len - n - 1];
    }

    pub fn readU8(self: *MemoryState) u8 {
        const value = self.memory[self.ip];
        self.ip += 1;
        return value;
    }

    pub fn readI32(self: *MemoryState) i32 {
        const value = readI32FromBuffer(self.memory, self.ip);
        self.ip += 4;
        return value;
    }

    pub fn deinit(self: *MemoryState) void {
        // var count: u32 = 0;
        // for (self.stack.items) |v| {
        //     count += 1;
        //     _ = v;
        // }
        // if (self.activation.v.a.data != null) {
        //     self.allocator.free(self.activation.v.a.data.?);
        //     self.activation.v.a.data = null;
        // }
        // force_gc(self);
        // var number_of_values: u32 = 0;
        // {
        //     var runner: ?*Value = self.root;
        //     while (runner != null) {
        //         const next = runner.?.next;
        //         number_of_values += 1;
        //         runner = next;
        //     }
        // }
        // std.log.info("gc: memory state stack length: {d} vs {d}: values: {d} vs {d}", .{ self.stack.items.len, count, self.memory_size, number_of_values });
        // self.stack.deinit();
        // self.stack = std.ArrayList(*Value).init(self.allocator);
        // self.activation = &Value{ .colour = self.colour, .next = null, .v = ValueValue{ .n = 0 } };
        // self.stack.deinit();

        self.stack.deinit();
        var runner: ?*Value = self.root;
        while (runner != null) {
            const next = runner.?.next;
            runner.?.deinit(self.allocator);
            self.allocator.destroy(runner.?);
            runner = next;
        }
    }
};

fn mark(state: *MemoryState, possible_value: ?*Value, colour: Colour) void {
    if (possible_value == null) {
        return;
    }

    const v = possible_value.?;

    if (v.colour == colour) {
        return;
    }

    v.colour = colour;

    switch (v.v) {
        .n, .b => {},
        .c => {
            mark(state, v.v.c.previousActivation, colour);
        },
        .a => {
            mark(state, v.v.a.parentActivation, colour);
            mark(state, v.v.a.closure, colour);
            if (v.v.a.data != null) {
                for (v.v.a.data.?) |data| {
                    mark(state, data, colour);
                }
            }
        },
    }
}

fn sweep(state: *MemoryState, colour: Colour) void {
    var runner: *?*Value = &state.root;
    while (runner.* != null) {
        if (runner.*.?.colour != colour) {
            // std.log.info("gc: sweep: {*}", .{runner.*.?});
            const next = runner.*.?.next;
            runner.*.?.deinit(state.allocator);
            state.allocator.destroy(runner.*.?);
            state.memory_size -= 1;
            runner.* = next;
        } else {
            runner = &(runner.*.?.next);
        }
    }
}

fn force_gc(state: *MemoryState) void {
    const new_colour = if (state.colour == Colour.Black) Colour.White else Colour.Black;

    mark(state, state.activation, new_colour);
    for (state.stack.items) |value| {
        mark(state, value, new_colour);
    }

    sweep(state, new_colour);

    state.colour = new_colour;
}

fn gc(state: *MemoryState) void {
    const threshold_rate = 0.75;

    if (state.memory_size > state.memory_capacity) {
        const old_size = state.memory_size;
        const start_time = std.time.milliTimestamp();
        force_gc(state);
        const end_time = std.time.milliTimestamp();
        std.log.info("gc: time={d}ms, nodes freed={d},  heap size: {d}", .{ end_time - start_time, old_size - state.memory_size, state.memory_size });

        if (@intToFloat(f32, state.memory_size) / @intToFloat(f32, state.memory_capacity) > threshold_rate) {
            state.memory_capacity *= 2;
            std.log.info("gc: double heap capacity to {}", .{state.memory_capacity});
        }
    }
}

fn readI32FromBuffer(buffer: []const u8, ip: u32) i32 {
    return buffer[ip] + @as(i32, 8) * buffer[ip + 1] + @as(i32, 65536) * buffer[ip + 2] + @as(i32, 16777216) * buffer[ip + 3];
}

fn logInstruction(state: *MemoryState) !void {
    var ip = state.ip;
    const instruction = state.memory[ip];

    std.debug.print("{d}: {s}", .{ ip, Instructions.instructions[instruction].name });
    ip += 1;
    for (Instructions.instructions[instruction].parameters) |parameter| {
        _ = parameter;
        const value = readI32FromBuffer(state.memory, ip);

        std.debug.print(" {}", .{value});
        ip += 4;
    }
    std.debug.print(": [", .{});
    var i = state.stack.items.len;
    while (i > 0) {
        if (i != state.stack.items.len) {
            std.debug.print(", ", .{});
        }
        const str = try state.stack.items[i - 1].toString(state.allocator);
        std.debug.print("{s}", .{str});
        state.allocator.free(str);
        // std.debug.print(" {}", .{});
        i -= 1;
    }
    std.debug.print("]", .{});

    var a: ?*Value = state.activation;
    while (a != null) {
        if (a.?.v.a.data == null) {
            std.debug.print(" -", .{});
        } else {
            const vs: []?*Value = a.?.v.a.data.?;

            std.debug.print(" <", .{});
            var first = true;
            for (vs) |v| {
                if (first) {
                    first = false;
                } else {
                    std.debug.print(" ", .{});
                }
                if (v == null) {
                    std.debug.print(".", .{});
                } else {
                    const str = try v.?.toString(state.allocator);
                    std.debug.print("{s}", .{str});
                    state.allocator.free(str);
                }
            }
            std.debug.print(">", .{});
        }
        a = a.?.v.a.parentActivation;
    }
    std.debug.print("\n", .{});
}

fn initMemoryState(allocator: std.mem.Allocator, buffer: []const u8) !MemoryState {
    const default_colour = Colour.White;

    var activation = try allocator.create(Value);
    activation.colour = default_colour;
    activation.next = null;
    activation.v = ValueValue{ .a = Activation{ .parentActivation = null, .closure = null, .nextIP = 0, .data = null } };

    return MemoryState{
        .allocator = allocator,
        .ip = 0,
        .memory = buffer,
        .stack = std.ArrayList(*Value).init(allocator),
        .activation = activation,
        .colour = default_colour,
        .root = activation,
        .memory_size = 1, // initialised to 1 to accomodate the root activation record
        .memory_capacity = 32,
    };
}

fn processInstruction(state: *MemoryState) !bool {
    const instruction = state.readU8();

    switch (@intToEnum(Instructions.InstructionOpCode, instruction)) {
        Instructions.InstructionOpCode.PUSH_TRUE => {
            _ = try state.newBool(true);
        },
        Instructions.InstructionOpCode.PUSH_FALSE => {
            _ = try state.newBool(false);
        },
        Instructions.InstructionOpCode.PUSH_INT => {
            const value = state.readI32();
            _ = try state.newInt(value);
        },
        Instructions.InstructionOpCode.PUSH_VAR => {
            var index = state.readI32();
            const offset = state.readI32();

            var a: ?*Value = state.activation;
            while (index > 0) {
                a = a.?.v.a.closure.?.v.c.previousActivation;
                index -= 1;
            }
            if (a.?.v.a.data == null) {
                std.log.err("Run: PUSH_VAR: activation has not been initialised\n", .{});
                unreachable;
            }
            if (offset >= a.?.v.a.data.?.len) {
                std.log.err("Run: PUSH_VAR: offset {d} is out of bounds for activation with {d} items\n", .{ offset, a.?.v.a.data.?.len });
                unreachable;
            }
            _ = try state.stack.append(a.?.v.a.data.?[@intCast(u32, offset)].?);
        },
        Instructions.InstructionOpCode.PUSH_CLOSURE => {
            var targetIP = state.readI32();
            _ = try state.newClosure(state.activation, @intCast(u32, targetIP));
        },
        Instructions.InstructionOpCode.ADD => {
            const b = state.pop();
            const a = state.pop();
            if (a.v != ValueValue.n or b.v != ValueValue.n) {
                std.log.err("Run: ADD: expected two integers on the stack, got {} and {}\n", .{ a, b });
                unreachable;
            }
            _ = try state.newInt(a.v.n + b.v.n);
        },
        Instructions.InstructionOpCode.SUB => {
            const b = state.pop();
            const a = state.pop();
            if (a.v != ValueValue.n or b.v != ValueValue.n) {
                std.log.err("Run: SUB: expected two integers on the stack, got {} and {}\n", .{ a, b });
                unreachable;
            }
            _ = try state.newInt(a.v.n - b.v.n);
        },
        Instructions.InstructionOpCode.MUL => {
            const b = state.pop();
            const a = state.pop();
            if (a.v != ValueValue.n or b.v != ValueValue.n) {
                std.log.err("Run: MUL: expected two integers on the stack, got {} and {}\n", .{ a, b });
                unreachable;
            }
            _ = try state.newInt(a.v.n * b.v.n);
        },
        Instructions.InstructionOpCode.DIV => {
            const b = state.pop();
            const a = state.pop();
            if (a.v != ValueValue.n or b.v != ValueValue.n) {
                std.log.err("Run: DIV: expected two integers on the stack, got {} and {}\n", .{ a, b });
                unreachable;
            }
            _ = try state.newInt(@divTrunc(a.v.n, b.v.n));
        },
        Instructions.InstructionOpCode.EQ => {
            const b = state.pop();
            const a = state.pop();
            if (a.v != ValueValue.n or b.v != ValueValue.n) {
                std.log.err("Run: EQ: expected two integers on the stack, got {} and {}\n", .{ a, b });
                unreachable;
            }
            _ = try state.newBool(a.v.n == b.v.n);
        },
        Instructions.InstructionOpCode.JMP => {
            const targetIP = state.readI32();
            state.ip = @intCast(u32, targetIP);
        },
        Instructions.InstructionOpCode.JMP_TRUE => {
            const targetIP = state.readI32();
            const v = state.pop();
            if (v.v != ValueValue.b) {
                std.log.err("Run: JMP_TRUE: expected a boolean on the stack, got {}\n", .{v});
                unreachable;
            }
            if (v.v.b) {
                state.ip = @intCast(u32, targetIP);
            }
        },
        Instructions.InstructionOpCode.SWAP_CALL => {
            const new_activation = try state.newActivation(state.activation, state.peek(1), state.ip);
            state.ip = state.peek(2).v.c.ip;
            state.activation = new_activation;

            state.stack.items[state.stack.items.len - 3] = state.stack.items[state.stack.items.len - 2];
            _ = state.pop();
            _ = state.pop();
        },
        Instructions.InstructionOpCode.ENTER => {
            const num_items = state.readI32();

            if (state.activation.v.a.data != null) {
                std.log.err("Run: ENTER: activation has already been initialised\n", .{});
                unreachable;
            }
            const s: []?*Value = try state.allocator.alloc(?*Value, @intCast(u32, num_items));
            var u: usize = 0;
            while (u < num_items) {
                s[u] = null;
                u += 1;
            }

            state.activation.v.a.data = s;
        },
        Instructions.InstructionOpCode.RET => {
            if (state.activation.v.a.parentActivation == null) {
                const v = state.pop();
                const stdout = std.io.getStdOut().writer();
                switch (v.v) {
                    ValueValue.n => try stdout.print("{d}: Int\n", .{v.v.n}),
                    ValueValue.b => try stdout.print("{}: Bool\n", .{v.v.b}),
                    ValueValue.c => try stdout.print("c{d}#{d}\n", .{ v.v.c.ip, try v.activationDepth() }),
                    else => try stdout.print("{}\n", .{v}),
                }
                return true;
            }
            state.ip = state.activation.v.a.nextIP;
            state.activation = state.activation.v.a.parentActivation.?;
        },
        Instructions.InstructionOpCode.STORE_VAR => {
            const index = state.readI32();

            const v = state.pop();
            if (state.activation.v.a.data == null) {
                std.log.err("Run: STORE_VAR: activation has not been initialised\n", .{});
                unreachable;
            }
            if (index >= state.activation.v.a.data.?.len) {
                std.log.err("Run: STORE_VAR: index {d} is out of bounds for activation with {d} items\n", .{ index, state.activation.v.a.data.?.len });
                unreachable;
            }
            state.activation.v.a.data.?[@intCast(u32, index)] = v;
        },
        else => {
            std.log.err("Unknown instruction: {s}\n", .{Instructions.instructions[instruction].name});
            unreachable;
        },
    }

    return false;
}

pub fn execute(buffer: []const u8) !void {
    // const allocator = std.heap.page_allocator;

    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    const allocator = gpa.allocator();

    var state = try initMemoryState(allocator, buffer);

    while (true) {
        // try logInstruction(&state);

        if (try processInstruction(&state)) {
            state.deinit();

            // _ = gpa.detectLeaks();
            if (gpa.deinit()) {
                std.log.err("Failed to deinit allocator\n", .{});
                std.process.exit(1);
            }
            return;
        }
    }
}
