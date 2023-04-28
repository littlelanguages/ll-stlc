import { execute as executeProgram, formatError } from "./Interpreter.ts";
import { Subst, TVar, Type } from "./Typing.ts";

const readline = (): string | null => {
  let result = "";

  while (true) {
    const line = prompt(result === "" ? ">" : ".");

    if (line === null) {
      return null;
    }

    result = (result + "\n" + line).trim();

    if (result.endsWith(";;")) {
      return result.substring(0, result.length - 2);
    }
  }
};

const renameTypeVariables = (type: Type): Type => {
  let i = 0;

  const nextVar = (): string => {
    if (i < 26) {
      return String.fromCharCode(97 + i++);
    } else {
      return `t${i++}`;
    }
  };

  const vars = type.ftv();
  const subst = new Subst(
    new Map([...vars].map((v) => [v, new TVar(nextVar())])),
  );
  return type.apply(subst);
};

const execute = (line: string) => {
  const [value, type] = executeProgram(line);

  console.log(`${value}: ${renameTypeVariables(type)}`);
};

if (Deno.args.length === 0) {
  console.log("Welcome to the REPL of the Lambda Calculus Interpreter!");
  console.log('Type ".quit" to exit.');
  console.log("Enter a multi-line expression with ;; as a terminator.");

  while (true) {
    const line = readline();

    if (line == null) {
      break;
    }

    if (line.trim() === ".quit") {
      console.log("bye...");
      Deno.exit(0);
    } else {
      try {
        execute(line);
      } catch (e) {
        console.log(formatError(e));
      }
    }
  }
} else if (Deno.args.length === 1) {
  try {
    execute(Deno.readTextFileSync(Deno.args[0]));
  } catch (e) {
    console.log(formatError(e));
  }
} else {
  console.error("Invalid arguments");
}
