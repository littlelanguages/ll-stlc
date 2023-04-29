package stlc

import io.littlelanguages.data.Tuple2
import io.littlelanguages.scanpiler.Location
import stlc.parser.*
import java.io.StringReader

sealed class Expression(open val location: Location)

data class AppExpression(val e1: Expression, val e2: Expression, override val location: Location) : Expression(location)

data class IfExpression(val e1: Expression, val e2: Expression, val e3: Expression, override val location: Location) :
    Expression(location)

data class LetExpression(val decls: List<Declaration>, val e: Expression, override val location: Location) :
    Expression(location)

data class LetRecExpression(val decls: List<Declaration>, val e: Expression, override val location: Location) :
    Expression(location)

data class Declaration(val n: String, val e: Expression)

data class LamExpression(val n: String, val e: Expression, override val location: Location) : Expression(location)

data class LBoolExpression(val v: Boolean, override val location: Location) : Expression(location)

data class LIntExpression(val v: Int, override val location: Location) : Expression(location)

data class LTupleExpression(val es: List<Expression>, override val location: Location) : Expression(location)

data class OpExpression(val e1: Expression, val e2: Expression, val op: Op, override val location: Location) :
    Expression(location)

enum class Op { Equals, Plus, Minus, Times, Divide }

data class VarExpression(val name: String, override val location: Location) : Expression(location)

class ParserVisitor :
    Visitor<Expression, Expression, Expression, Expression, Op, Expression, Op, Expression, Declaration> {
    override fun visitProgram(a: Expression): Expression = a

    override fun visitExpression(a1: Expression, a2: List<Expression>): Expression =
        a2.fold(a1) { acc, e -> AppExpression(acc, e, acc.location + e.location) }

    override fun visitRelational(a1: Expression, a2: Tuple2<Token, Expression>?): Expression =
        if (a2 == null) a1 else OpExpression(a1, a2.b, Op.Equals, a1.location + a2.b.location)

    override fun visitMultiplicative(a1: Expression, a2: List<Tuple2<Op, Expression>>): Expression =
        a2.fold(a1) { acc, e -> OpExpression(acc, e.b, e.a, acc.location + e.b.location) }

    override fun visitMultiplicativeOps1(a: Token): Op = Op.Times

    override fun visitMultiplicativeOps2(a: Token): Op = Op.Divide

    override fun visitAdditive(a1: Expression, a2: List<Tuple2<Op, Expression>>): Expression =
        a2.fold(a1) { acc, e -> OpExpression(acc, e.b, e.a, acc.location + e.b.location) }

    override fun visitAdditiveOps1(a: Token): Op = Op.Plus

    override fun visitAdditiveOps2(a: Token): Op = Op.Minus

    override fun visitFactor1(a1: Token, a2: Expression, a3: Token): Expression = a2

    override fun visitFactor2(a: Token): Expression = LIntExpression(a.lexeme.toInt(), a.location)

    override fun visitFactor3(a: Token): Expression = LBoolExpression(true, a.location)

    override fun visitFactor4(a: Token): Expression = LBoolExpression(false, a.location)

    override fun visitFactor5(a1: Token, a2: Token, a3: List<Token>, a4: Token, a5: Expression): Expression =
        composeLambda(listOf(Pair(a2.lexeme, a2.location)) + a3.map { Pair(it.lexeme, it.location) }, a5)

    override fun visitFactor6(
        a1: Token, a2: Token?, a3: Declaration, a4: List<Tuple2<Token, Declaration>>, a5: Token, a6: Expression
    ): Expression {
        val declarations = listOf(a3) + a4.map { it.b }

        return if (a2 == null) LetExpression(declarations, a6, a1.location + a6.location)
        else LetRecExpression(declarations, a6, a1.location + a6.location)
    }

    override fun visitFactor7(
        a1: Token,
        a2: Token,
        a3: Expression,
        a4: Token,
        a5: Expression,
        a6: Token,
        a7: Expression
    ): Expression =
        IfExpression(a3, a5, a7, a1.location + a7.location)


    override fun visitFactor8(a: Token): Expression = VarExpression(a.lexeme, a.location)

    override fun visitDeclaration(a1: Token, a2: List<Token>, a3: Token, a4: Expression): Declaration =
        Declaration(a1.lexeme, composeLambda(a2.map { Pair(it.lexeme, it.location) }, a4))

    private fun composeLambda(names: List<Pair<String, Location>>, e: Expression): Expression =
        names.foldRight(e) { name, acc -> LamExpression(name.first, acc, name.second + acc.location) }
}

fun parse(scanner: Scanner): Expression {
    try {
        return Parser(scanner, ParserVisitor()).program()
    } catch (e: ParsingException) {
        throw SyntaxErrorException(e)
    }
}

fun parse(input: String): Expression =
    parse(Scanner(StringReader(input)))

