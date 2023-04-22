import {
  Either,
  left,
  right,
} from "https://raw.githubusercontent.com/littlelanguages/deno-lib-data-either/0.1.2/mod.ts";
import { mkScanner, Scanner, Token, TToken } from "./Scanner.ts";

export interface Visitor<
  T_Program,
  T_Expression,
  T_Relational,
  T_Additive,
  T_AdditiveOps,
  T_Multiplicative,
  T_MultiplicativeOps,
  T_Factor,
  T_Declaration,
> {
  visitProgram(a: T_Expression): T_Program;
  visitExpression(a1: T_Relational, a2: Array<T_Relational>): T_Expression;
  visitRelational(
    a1: T_Additive,
    a2: [Token, T_Additive] | undefined,
  ): T_Relational;
  visitAdditive(
    a1: T_Multiplicative,
    a2: Array<[T_AdditiveOps, T_Multiplicative]>,
  ): T_Additive;
  visitAdditiveOps1(a: Token): T_AdditiveOps;
  visitAdditiveOps2(a: Token): T_AdditiveOps;
  visitMultiplicative(
    a1: T_Factor,
    a2: Array<[T_MultiplicativeOps, T_Factor]>,
  ): T_Multiplicative;
  visitMultiplicativeOps1(a: Token): T_MultiplicativeOps;
  visitMultiplicativeOps2(a: Token): T_MultiplicativeOps;
  visitFactor1(a1: Token, a2: T_Expression, a3: Token): T_Factor;
  visitFactor2(a: Token): T_Factor;
  visitFactor3(a: Token): T_Factor;
  visitFactor4(a: Token): T_Factor;
  visitFactor5(
    a1: Token,
    a2: Token,
    a3: Array<Token>,
    a4: Token,
    a5: T_Expression,
  ): T_Factor;
  visitFactor6(
    a1: Token,
    a2: Token | undefined,
    a3: T_Declaration,
    a4: Array<[Token, T_Declaration]>,
    a5: Token,
    a6: T_Expression,
  ): T_Factor;
  visitFactor7(
    a1: Token,
    a2: Token,
    a3: T_Expression,
    a4: Token,
    a5: T_Expression,
    a6: Token,
    a7: T_Expression,
  ): T_Factor;
  visitFactor8(a: Token): T_Factor;
  visitDeclaration(
    a1: Token,
    a2: Array<Token>,
    a3: Token,
    a4: T_Expression,
  ): T_Declaration;
}

export const parseProgram = <
  T_Program,
  T_Expression,
  T_Relational,
  T_Additive,
  T_AdditiveOps,
  T_Multiplicative,
  T_MultiplicativeOps,
  T_Factor,
  T_Declaration,
>(
  input: string,
  visitor: Visitor<
    T_Program,
    T_Expression,
    T_Relational,
    T_Additive,
    T_AdditiveOps,
    T_Multiplicative,
    T_MultiplicativeOps,
    T_Factor,
    T_Declaration
  >,
): Either<SyntaxError, T_Program> => {
  try {
    return right(mkParser(mkScanner(input), visitor).program());
  } catch (e) {
    return left(e);
  }
};

export const mkParser = <
  T_Program,
  T_Expression,
  T_Relational,
  T_Additive,
  T_AdditiveOps,
  T_Multiplicative,
  T_MultiplicativeOps,
  T_Factor,
  T_Declaration,
>(
  scanner: Scanner,
  visitor: Visitor<
    T_Program,
    T_Expression,
    T_Relational,
    T_Additive,
    T_AdditiveOps,
    T_Multiplicative,
    T_MultiplicativeOps,
    T_Factor,
    T_Declaration
  >,
) => {
  const matchToken = (ttoken: TToken): Token => {
    if (isToken(ttoken)) {
      return nextToken();
    } else {
      throw {
        tag: "SyntaxError",
        found: scanner.current(),
        expected: [ttoken],
      };
    }
  };

  const isToken = (ttoken: TToken): boolean => currentToken() === ttoken;

  const isTokens = (ttokens: Array<TToken>): boolean =>
    ttokens.includes(currentToken());

  const currentToken = (): TToken => scanner.current()[0];

  const nextToken = (): Token => {
    const result = scanner.current();
    scanner.next();
    return result;
  };

  return {
    program: function (): T_Program {
      return visitor.visitProgram(this.expression());
    },
    expression: function (): T_Expression {
      const a1: T_Relational = this.relational();
      const a2: Array<T_Relational> = [];

      while (
        isTokens([
          TToken.LParen,
          TToken.LiteralInt,
          TToken.True,
          TToken.False,
          TToken.Backslash,
          TToken.Let,
          TToken.If,
          TToken.Identifier,
        ])
      ) {
        const a2t: T_Relational = this.relational();
        a2.push(a2t);
      }
      return visitor.visitExpression(a1, a2);
    },
    relational: function (): T_Relational {
      const a1: T_Additive = this.additive();
      let a2: [Token, T_Additive] | undefined = undefined;

      if (isToken(TToken.EqualEqual)) {
        const a2t1: Token = matchToken(TToken.EqualEqual);
        const a2t2: T_Additive = this.additive();
        const a2t: [Token, T_Additive] = [a2t1, a2t2];
        a2 = a2t;
      }
      return visitor.visitRelational(a1, a2);
    },
    additive: function (): T_Additive {
      const a1: T_Multiplicative = this.multiplicative();
      const a2: Array<[T_AdditiveOps, T_Multiplicative]> = [];

      while (isTokens([TToken.Plus, TToken.Dash])) {
        const a2t1: T_AdditiveOps = this.additiveOps();
        const a2t2: T_Multiplicative = this.multiplicative();
        const a2t: [T_AdditiveOps, T_Multiplicative] = [a2t1, a2t2];
        a2.push(a2t);
      }
      return visitor.visitAdditive(a1, a2);
    },
    additiveOps: function (): T_AdditiveOps {
      if (isToken(TToken.Plus)) {
        return visitor.visitAdditiveOps1(matchToken(TToken.Plus));
      } else if (isToken(TToken.Dash)) {
        return visitor.visitAdditiveOps2(matchToken(TToken.Dash));
      } else {
        throw {
          tag: "SyntaxError",
          found: scanner.current(),
          expected: [TToken.Plus, TToken.Dash],
        };
      }
    },
    multiplicative: function (): T_Multiplicative {
      const a1: T_Factor = this.factor();
      const a2: Array<[T_MultiplicativeOps, T_Factor]> = [];

      while (isTokens([TToken.Star, TToken.Slash])) {
        const a2t1: T_MultiplicativeOps = this.multiplicativeOps();
        const a2t2: T_Factor = this.factor();
        const a2t: [T_MultiplicativeOps, T_Factor] = [a2t1, a2t2];
        a2.push(a2t);
      }
      return visitor.visitMultiplicative(a1, a2);
    },
    multiplicativeOps: function (): T_MultiplicativeOps {
      if (isToken(TToken.Star)) {
        return visitor.visitMultiplicativeOps1(matchToken(TToken.Star));
      } else if (isToken(TToken.Slash)) {
        return visitor.visitMultiplicativeOps2(matchToken(TToken.Slash));
      } else {
        throw {
          tag: "SyntaxError",
          found: scanner.current(),
          expected: [TToken.Star, TToken.Slash],
        };
      }
    },
    factor: function (): T_Factor {
      if (isToken(TToken.LParen)) {
        const a1: Token = matchToken(TToken.LParen);
        const a2: T_Expression = this.expression();
        const a3: Token = matchToken(TToken.RParen);
        return visitor.visitFactor1(a1, a2, a3);
      } else if (isToken(TToken.LiteralInt)) {
        return visitor.visitFactor2(matchToken(TToken.LiteralInt));
      } else if (isToken(TToken.True)) {
        return visitor.visitFactor3(matchToken(TToken.True));
      } else if (isToken(TToken.False)) {
        return visitor.visitFactor4(matchToken(TToken.False));
      } else if (isToken(TToken.Backslash)) {
        const a1: Token = matchToken(TToken.Backslash);
        const a2: Token = matchToken(TToken.Identifier);
        const a3: Array<Token> = [];

        while (isToken(TToken.Identifier)) {
          const a3t: Token = matchToken(TToken.Identifier);
          a3.push(a3t);
        }
        const a4: Token = matchToken(TToken.DashGreaterThan);
        const a5: T_Expression = this.expression();
        return visitor.visitFactor5(a1, a2, a3, a4, a5);
      } else if (isToken(TToken.Let)) {
        const a1: Token = matchToken(TToken.Let);
        let a2: Token | undefined = undefined;

        if (isToken(TToken.Rec)) {
          const a2t: Token = matchToken(TToken.Rec);
          a2 = a2t;
        }
        const a3: T_Declaration = this.declaration();
        const a4: Array<[Token, T_Declaration]> = [];

        while (isToken(TToken.Semicolon)) {
          const a4t1: Token = matchToken(TToken.Semicolon);
          const a4t2: T_Declaration = this.declaration();
          const a4t: [Token, T_Declaration] = [a4t1, a4t2];
          a4.push(a4t);
        }
        const a5: Token = matchToken(TToken.In);
        const a6: T_Expression = this.expression();
        return visitor.visitFactor6(a1, a2, a3, a4, a5, a6);
      } else if (isToken(TToken.If)) {
        const a1: Token = matchToken(TToken.If);
        const a2: Token = matchToken(TToken.LParen);
        const a3: T_Expression = this.expression();
        const a4: Token = matchToken(TToken.RParen);
        const a5: T_Expression = this.expression();
        const a6: Token = matchToken(TToken.Else);
        const a7: T_Expression = this.expression();
        return visitor.visitFactor7(a1, a2, a3, a4, a5, a6, a7);
      } else if (isToken(TToken.Identifier)) {
        return visitor.visitFactor8(matchToken(TToken.Identifier));
      } else {
        throw {
          tag: "SyntaxError",
          found: scanner.current(),
          expected: [
            TToken.LParen,
            TToken.LiteralInt,
            TToken.True,
            TToken.False,
            TToken.Backslash,
            TToken.Let,
            TToken.If,
            TToken.Identifier,
          ],
        };
      }
    },
    declaration: function (): T_Declaration {
      const a1: Token = matchToken(TToken.Identifier);
      const a2: Array<Token> = [];

      while (isToken(TToken.Identifier)) {
        const a2t: Token = matchToken(TToken.Identifier);
        a2.push(a2t);
      }
      const a3: Token = matchToken(TToken.Equal);
      const a4: T_Expression = this.expression();
      return visitor.visitDeclaration(a1, a2, a3, a4);
    },
  };
};

export type SyntaxError = {
  tag: "SyntaxError";
  found: Token;
  expected: Array<TToken>;
};
