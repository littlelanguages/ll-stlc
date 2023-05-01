pub const InstructionOpCode = enum { PUSH_TRUE, PUSH_FALSE, PUSH_INT, PUSH_VAR, PUSH_CLOSURE, PUSH_TUPLE, ADD, SUB, MUL, DIV, EQ, JMP, JMP_TRUE, SWAP_CALL, ENTER, RET, STORE_VAR };
pub const OpParameter = enum { OP_INT, OP_LABEL };

pub const Instruction = struct {
    name: []const u8,
    opCode: InstructionOpCode,
    parameters: []const OpParameter,
};

pub const instructions = [_]Instruction{
    .{ .name = "PUSH_TRUE", .opCode = InstructionOpCode.PUSH_TRUE, .parameters = &[_]OpParameter{} },
    .{ .name = "PUSH_FALSE", .opCode = InstructionOpCode.PUSH_FALSE, .parameters = &[_]OpParameter{} },
    .{ .name = "PUSH_INT", .opCode = InstructionOpCode.PUSH_INT, .parameters = &[_]OpParameter{OpParameter.OP_INT} },
    .{ .name = "PUSH_VAR", .opCode = InstructionOpCode.PUSH_VAR, .parameters = &[_]OpParameter{ OpParameter.OP_INT, OpParameter.OP_INT } },
    .{ .name = "PUSH_CLOSURE", .opCode = InstructionOpCode.PUSH_CLOSURE, .parameters = &[_]OpParameter{OpParameter.OP_LABEL} },
    .{ .name = "PUSH_TUPLE", .opCode = InstructionOpCode.PUSH_TUPLE, .parameters = &[_]OpParameter{OpParameter.OP_INT} },
    .{ .name = "ADD", .opCode = InstructionOpCode.ADD, .parameters = &[_]OpParameter{} },
    .{ .name = "SUB", .opCode = InstructionOpCode.SUB, .parameters = &[_]OpParameter{} },
    .{ .name = "MUL", .opCode = InstructionOpCode.MUL, .parameters = &[_]OpParameter{} },
    .{ .name = "DIV", .opCode = InstructionOpCode.DIV, .parameters = &[_]OpParameter{} },
    .{ .name = "EQ", .opCode = InstructionOpCode.EQ, .parameters = &[_]OpParameter{} },
    .{ .name = "JMP", .opCode = InstructionOpCode.JMP, .parameters = &[_]OpParameter{OpParameter.OP_LABEL} },
    .{ .name = "JMP_TRUE", .opCode = InstructionOpCode.JMP_TRUE, .parameters = &[_]OpParameter{OpParameter.OP_LABEL} },
    .{ .name = "SWAP_CALL", .opCode = InstructionOpCode.SWAP_CALL, .parameters = &[_]OpParameter{} },
    .{ .name = "ENTER", .opCode = InstructionOpCode.ENTER, .parameters = &[_]OpParameter{OpParameter.OP_INT} },
    .{ .name = "RET", .opCode = InstructionOpCode.RET, .parameters = &[_]OpParameter{} },
    .{ .name = "STORE_VAR", .opCode = InstructionOpCode.STORE_VAR, .parameters = &[_]OpParameter{OpParameter.OP_INT} },
};
