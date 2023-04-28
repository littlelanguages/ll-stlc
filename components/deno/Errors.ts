import { Type } from "./Typing.ts";
import { SyntaxError } from "./parser/Parser.ts";
import {
  Location,
} from "https://raw.githubusercontent.com/littlelanguages/scanpiler-deno-lib/0.1.1/location.ts";

export type AnError = SyntaxError | UnificationMismatchError | UnknownNameError;

export type UnificationMismatchError = {
  tag: "UnificationMismatchError";
  type1: Type;
  type2: Type;
};

export type UnknownNameError = {
  tag: "UnknownNameError";
  name: string;
  location: Location;
};
