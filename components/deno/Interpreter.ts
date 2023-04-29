// deno-lint-ignore-file no-explicit-any
import { Constraints } from "./Constraints.ts";
import { AnError } from "./Errors.ts";
import { inferExpression } from "./Infer.ts";
import { Expression, Op, parse } from "./Parser.ts";
import { createFresh, emptyTypeEnv, Type } from "./Typing.ts";
import { TToken } from "./parser/Scanner.ts";
import { toString } from "https://raw.githubusercontent.com/littlelanguages/scanpiler-deno-lib/0.1.1/location.ts";

const solve = (expression: Expression): Type => {
  const [constraints, type] = inferExpression(
    emptyTypeEnv,
    expression,
    new Constraints(),
    createFresh(),
  );

  const subst = constraints.solve();

  return type.apply(subst);
};

const binaryOps = new Map<number, (v1: any, v2: any) => any>([
  [Op.Equals, (a, b) => a === b],
  [Op.Plus, (a, b) => (a + b) | 0],
  [Op.Minus, (a, b) => (a - b) | 0],
  [Op.Times, (a, b) => (a * b) | 0],
  [Op.Divide, (a, b) => (a / b) | 0],
]);

const evaluate = (expr: Expression, env: any): any => {
  if (expr.type === "App") {
    return evaluate(expr.e1, env)(evaluate(expr.e2, env));
  }
  if (expr.type === "If") {
    return evaluate(expr.guard, env)
      ? evaluate(expr.then, env)
      : evaluate(expr.else, env);
  }
  if (expr.type === "Lam") {
    return (x: any) => {
      const newEnv = { ...env };
      newEnv[expr.name] = x;
      return evaluate(expr.expr, newEnv);
    };
  }
  if (expr.type === "Let" || expr.type === "LetRec") {
    const newEnv = { ...env };
    expr.declarations.forEach((d) => {
      newEnv[d.name] = evaluate(d.expr, newEnv);
    });
    return evaluate(expr.expr, newEnv);
  }
  if (expr.type === "LBool") {
    return expr.value;
  }
  if (expr.type === "LInt") {
    return expr.value;
  }
  if (expr.type === "LTuple") {
    return expr.values.map((v) => evaluate(v, env));
  }
  if (expr.type === "Op") {
    return binaryOps.get(expr.op)!(
      evaluate(expr.left, env),
      evaluate(expr.right, env),
    );
  }
  if (expr.type === "Var") {
    return env[expr.name];
  }
};

export const execute = (t: string): [any, Type] => {
  const ast = parse(t);

  return [evaluate(ast, {}), solve(ast)];
};

const ttokenToString = (ttoken: TToken): string => {
  switch (ttoken) {
    case TToken.Equal:
      return "'='";
    case TToken.Else:
      return "else";
    case TToken.If:
      return "if";
    case TToken.In:
      return "in";
    case TToken.Semicolon:
      return "';''";
    case TToken.Rec:
      return "rec";
    case TToken.Let:
      return "let";
    case TToken.DashGreaterThan:
      return "'->''";
    case TToken.Backslash:
      return "'\\'";
    case TToken.False:
      return "False";
    case TToken.True:
      return "True";
    case TToken.RParen:
      return "')'";
    case TToken.LParen:
      return "'('";
    case TToken.Slash:
      return "'/'";
    case TToken.Star:
      return "'*'";
    case TToken.Dash:
      return "'-'";
    case TToken.Plus:
      return "'+'";
    case TToken.EqualEqual:
      return "'=='";
    case TToken.LiteralInt:
      return "literal int";
    case TToken.Identifier:
      return "identifier";
    case TToken.EOS:
      return "<end-of-stream>";
    case TToken.ERROR:
      return "<error>";
  }
};

export const formatError = (e: AnError): string => {
  switch (e.tag) {
    case "SyntaxError":
      return `Syntax Error: expected ${
        e.expected.map(ttokenToString).join(", ")
      } but found ${ttokenToString(e.found[0])} at ${toString(e.found[1])}`;
    case "UnificationMismatchError":
      return `Unification Mismatch Error: unable to unify ${e.type1.prettyPrint()} with ${e.type2.prettyPrint()}`;
    case "UnknownNameError":
      return `Unknown Name: ${e.name} at ${toString(e.location)}`;
    default:
      return e;
  }
};
