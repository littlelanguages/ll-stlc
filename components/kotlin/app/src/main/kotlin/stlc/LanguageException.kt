package stlc

import io.littlelanguages.scanpiler.Location
import io.littlelanguages.scanpiler.LocationCoordinate
import io.littlelanguages.scanpiler.LocationRange
import stlc.parser.ParsingException
import stlc.parser.TToken

abstract class LanguageException : Exception() {
    abstract fun formatMessage(): String
}


private fun TToken.asString(): String {
    when (this) {
        TToken.TEqual -> return "'='"
        TToken.TElse -> return "else"
        TToken.TIf -> return "if"
        TToken.TIn -> return "in"
        TToken.TSemicolon -> return "';'"
        TToken.TRec -> return "rec"
        TToken.TLet -> return "let"
        TToken.TDashGreaterThan -> return "'->'"
        TToken.TBackslash -> return "'\\'"
        TToken.TFalse -> return "False"
        TToken.TTrue -> return "True"
        TToken.TRParen -> return "')'"
        TToken.TLParen -> return "'('"
        TToken.TSlash -> return "'/'"
        TToken.TStar -> return "'*'"
        TToken.TDash -> return "'-'"
        TToken.TPlus -> return "'+'"
        TToken.TEqualEqual -> return "'=='"
        TToken.TLiteralInt -> return "literal int"
        TToken.TIdentifier -> return "identifier"
        TToken.TEOS -> return "<end-of-stream>"
        TToken.TERROR -> return "<error>"
    }
}

fun Location.asString(): String =
    when (this) {
        is LocationCoordinate ->
            "${this.line}:${this.column}"

        is LocationRange ->
            if (this.start.line == this.end.line)
                "${this.start.line}:${this.start.column}-${this.end.column}"
            else
                "${this.start.line}:${this.start.column}-${this.end.line}:${this.end.column}"
    }

data class SyntaxErrorException(private val e: ParsingException) : LanguageException() {
    override fun formatMessage(): String =
        "Syntax Error: expected ${e.expected.joinToString(", ") { it.asString() }} but found ${e.found.tToken.asString()} at ${e.found.location.asString()}"
}

data class UnificationMismatchException(val t1: Type, val t2: Type) : LanguageException() {
    override fun formatMessage(): String =
        "Unification Mismatch: unable to unify ${t1.prettyPrint()} with $t2"
}

data class UnificationManyMismatchException(val t1: List<Type>, val t2: List<Type>) : LanguageException() {
    override fun formatMessage(): String =
        "Unification Mismatch: unable to unify ${t1.joinToString(", ") { it.prettyPrint() }} with ${t2.joinToString(", ") { it.prettyPrint() }}"
}

data class UnknownNameException(val name: String, val location: Location) : LanguageException() {
    override fun formatMessage(): String =
        "Unknown Name: $name at ${location.asString()}"
}
