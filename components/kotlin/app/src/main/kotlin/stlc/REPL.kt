package stlc

import stlc.bci.compileTo
import java.io.File
import kotlin.system.exitProcess

fun main(args: Array<String>) {
    if (args.isEmpty()) {
        println("Welcome to the REPL of the Lambda Calculus Interpreter!")
        println("Type \".quit\" to exit.")
        println("Enter a multi-line expression with ;; as a terminator.")

        while (true) {
            val input = readline().trim()

            if (input == ".quit") {
                println("bye")
                break
            }

            try {
                executeInput(input)
            } catch (e: LanguageException) {
                println(e.formatMessage())
            }
        }
    } else if (args.size == 1) {
        val input = File(args[0]).readText()
        try {
            executeInput(input)
        } catch (e: LanguageException) {
            println(e.formatMessage())
            exitProcess(1)
        }
    } else if (args.size == 2) {
        println("Compiling ${args[0]} to ${args[1]}")
        try {
            compileTo(File(args[0]).readText(), args[1])
        } catch (e: LanguageException) {
            println(e.formatMessage())
            exitProcess(1)
        }
    } else {
        println("Usage: tlca [file-name] [output-file]")
    }
}

private fun renameTypeVariables(t: Type): Type {
    var i = 0

    fun nextVar(): String =
        if (i < 26)
            ('a' + i++).toString()
        else
            "t${i++ - 26}"

    val vars = t.ftv().toList()
    val subst = Subst(vars.zip(vars.map { TVar(nextVar()) }).toMap())
    return t.apply(subst)
}

private fun executeInput(input: String) {
    val (value, type) = execute(input)

    if (type is TArr) {
        println("function: ${renameTypeVariables(type)}")
    } else {
        println("$value: ${renameTypeVariables(type)}")
    }
}

private fun readline(): String {
    var result = ""

    while (true) {
        if (result.isEmpty())
            print("> ")
        else
            print(". ")

        val s = readln()
        result = result + "\n" + s.trimEnd()

        if (result.endsWith(";;"))
            return result.dropLast(2)
    }
}
