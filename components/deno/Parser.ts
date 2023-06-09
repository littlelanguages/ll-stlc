import { parseProgram, SyntaxError, Visitor } from "./parser/Parser.ts";
import { Token } from "./parser/Scanner.ts";
import {
  combine,
  Location,
} from "https://raw.githubusercontent.com/littlelanguages/scanpiler-deno-lib/0.1.1/location.ts";

export type Program = Expression;

export type Expression =
  | AppExpression
  | IfExpression
  | LamExpression
  | LetExpression
  | LetRecExpression
  | LBoolExpression
  | LIntExpression
  | LTupleExpression
  | OpExpression
  | VarExpression;

export type AppExpression = {
  type: "App";
  e1: Expression;
  e2: Expression;
  location: Location;
};

export type IfExpression = {
  type: "If";
  guard: Expression;
  then: Expression;
  else: Expression;
  location: Location;
};

export type LetExpression = {
  type: "Let";
  declarations: Array<Declaration>;
  expr: Expression;
  location: Location;
};

export type LetRecExpression = {
  type: "LetRec";
  declarations: Array<Declaration>;
  expr: Expression;
  location: Location;
};

export type Declaration = {
  type: "Declaration";
  name: string;
  expr: Expression;
  location: Location;
};

export type LamExpression = {
  type: "Lam";
  name: string;
  expr: Expression;
  location: Location;
};

export type LBoolExpression = {
  type: "LBool";
  value: boolean;
  location: Location;
};

export type LIntExpression = {
  type: "LInt";
  value: number;
  location: Location;
};

export type LTupleExpression = {
  type: "LTuple";
  values: Array<Expression>;
  location: Location;
};

export type OpExpression = {
  type: "Op";
  left: Expression;
  op: Op;
  right: Expression;
  location: Location;
};

export enum Op {
  Equals,
  Plus,
  Minus,
  Times,
  Divide,
}

export type VarExpression = {
  type: "Var";
  name: string;
  location: Location;
};

export const parse = (input: string): Program =>
  parseProgram(input, visitor).either((l: SyntaxError): Program => {
    throw l;
  }, (r: Expression): Program => r);

const visitor: Visitor<
  Expression,
  Expression,
  Expression,
  Expression,
  string,
  Expression,
  string,
  Expression,
  Declaration
> = {
  visitProgram: (a: Expression): Expression => a,

  visitExpression: (a1: Expression, a2: Array<Expression>): Expression =>
    a2.reduce((acc: Expression, e: Expression): Expression => ({
      type: "App",
      e1: acc,
      e2: e,
      location: combine(acc.location, e.location),
    }), a1),

  visitRelational: (
    a1: Expression,
    a2: [Token, Expression] | undefined,
  ): Expression =>
    a2 === undefined ? a1 : {
      type: "Op",
      left: a1,
      right: a2[1],
      op: Op.Equals,
      location: combine(a1.location, a2[1].location),
    },

  visitMultiplicative: (
    a1: Expression,
    a2: Array<[string, Expression]>,
  ): Expression =>
    a2 === undefined ? a1 : a2.reduce(
      (acc: Expression, e: [string, Expression]): Expression => ({
        type: "Op",
        left: acc,
        right: e[1],
        op: e[0] === "*" ? Op.Times : Op.Divide,
        location: combine(acc.location, e[1].location),
      }),
      a1,
    ),

  visitMultiplicativeOps1: (a: Token): string => a[2],
  visitMultiplicativeOps2: (a: Token): string => a[2],

  visitAdditive: (
    a1: Expression,
    a2: Array<[string, Expression]>,
  ): Expression =>
    a2 === undefined ? a1 : a2.reduce(
      (acc: Expression, e: [string, Expression]): Expression => ({
        type: "Op",
        left: acc,
        right: e[1],
        op: e[0] === "+" ? Op.Plus : Op.Minus,
        location: combine(acc.location, e[1].location),
      }),
      a1,
    ),

  visitAdditiveOps1: (a: Token): string => a[2],
  visitAdditiveOps2: (a: Token): string => a[2],

  visitFactor1: (a1: Token, a2: Expression, a3: Token): Expression => {
    a2.location = combine(a1[1], a3[1]);

    return a2;
  },

  visitFactor2: (a: Token): Expression => ({
    type: "LInt",
    value: parseInt(a[2]),
    location: a[1],
  }),

  visitFactor3: (a: Token): Expression => ({
    type: "LBool",
    value: true,
    location: a[1],
  }),

  visitFactor4: (a: Token): Expression => ({
    type: "LBool",
    value: false,
    location: a[1],
  }),

  visitFactor5: (
    _a1: Token,
    a2: Token,
    a3: Array<Token>,
    _a4: Token,
    a5: Expression,
  ): Expression =>
    composeLambda([a2].concat(a3).map((n: Token): string => n[2]), a5),

  visitFactor6: (
    a1: Token,
    a2: Token | undefined,
    a3: Declaration,
    a4: Array<[Token, Declaration]>,
    _a5: Token,
    a6: Expression,
  ): Expression => ({
    type: a2 === undefined ? "Let" : "LetRec",
    declarations: [a3].concat(a4.map((a) => a[1])),
    expr: a6,
    location: combine(a1[1], a6.location),
  }),

  visitFactor7: (
    a1: Token,
    _a2: Token,
    a3: Expression,
    _a4: Token,
    a5: Expression,
    _a6: Token,
    a7: Expression,
  ): Expression => ({
    type: "If",
    guard: a3,
    then: a5,
    else: a7,
    location: combine(a1[1], a7.location),
  }),

  visitFactor8: (a: Token): Expression => ({
    type: "Var",
    name: a[2],
    location: a[1],
  }),

  visitDeclaration: (
    a1: Token,
    a2: Array<Token>,
    _a3: Token,
    a4: Expression,
  ): Declaration => ({
    type: "Declaration",
    name: a1[2],
    expr: composeLambda(a2.map((n) => n[2]), a4),
    location: combine(a1[1], a4.location),
  }),
};

const composeLambda = (names: Array<string>, expr: Expression): Expression =>
  names.reduceRight((acc, name) => ({
    type: "Lam",
    name,
    expr: acc,
    location: acc.location,
  }), expr);

// console.log(JSON.stringify(parse("let compose f g x = f(g x) in compose"), null, 2));
