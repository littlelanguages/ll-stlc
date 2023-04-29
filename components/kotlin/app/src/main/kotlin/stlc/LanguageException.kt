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

private fun Location.asString(): String =
    when (this) {
        is LocationCoordinate ->
            "${this.line}:${this.column + 1}"

        is LocationRange ->
            if (this.start.line == this.end.line)
                "${this.start.line}:${this.start.column + 1}-${this.end.column + 1}"
            else
                "${this.start.line}:${this.start.column + 1}-${this.end.line}:${this.end.column + 1}"
    }

class SyntaxErrorException(private val e: ParsingException) : LanguageException() {
    override fun formatMessage(): String =
        "Syntax Error: expected ${e.expected.joinToString(", ") { it.asString() }} but found ${e.found.tToken.asString()} at ${e.found.location.asString()}"
}

