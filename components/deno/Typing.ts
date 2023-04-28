import * as Sets from "./Set.ts";
import * as Maps from "./Map.ts";
import {
  Location,
  toString,
} from "https://raw.githubusercontent.com/littlelanguages/scanpiler-deno-lib/0.1.1/location.ts";

export type Var = string;

export interface Type {
  location: Location | undefined;
  equals: (other: Type) => boolean;
  apply: (s: Subst) => Type;
  ftv: () => Set<Var>;
  prettyPrint: () => string;
  atLocation: (location: Location) => Type;
}

const prettyPrint = (t: Type): string => {
  return (t.location === undefined)
    ? t.toString()
    : `${t.toString()} from ${toString(t.location)}`;
};

export class TVar implements Type {
  name: Var;
  location: Location | undefined;

  constructor(name: Var, location: Location | undefined = undefined) {
    this.name = name;
    this.location = location;
  }

  equals(other: Type): boolean {
    return other instanceof TVar && other.name === this.name;
  }

  apply(s: Subst): Type {
    return s.get(this.name) || this;
  }

  ftv(): Set<Var> {
    return new Set([this.name]);
  }

  toString(): string {
    return this.name;
  }

  prettyPrint(): string {
    return prettyPrint(this);
  }

  atLocation(location: Location): Type {
    return new TVar(this.name, location);
  }
}

export class TCon implements Type {
  name: string;
  location: Location | undefined;

  constructor(name: string, location: Location | undefined = undefined) {
    this.name = name;
    this.location = location;
  }

  equals(other: Type): boolean {
    return other instanceof TCon && other.name === this.name;
  }

  apply(_s: Subst): Type {
    return this;
  }
  ftv(): Set<Var> {
    return new Set();
  }

  toString(): string {
    return this.name;
  }

  prettyPrint(): string {
    return prettyPrint(this);
  }

  atLocation(location: Location): Type {
    return new TCon(this.name, location);
  }
}

export class TArr implements Type {
  domain: Type;
  range: Type;
  location: Location | undefined;

  constructor(
    domain: Type,
    range: Type,
    location: Location | undefined = undefined,
  ) {
    this.domain = domain;
    this.range = range;
    this.location = location;
  }

  equals(other: Type): boolean {
    return other instanceof TArr && this.domain.equals(other.domain) &&
      this.range.equals(other.range);
  }

  apply(s: Subst): Type {
    return new TArr(this.domain.apply(s), this.range.apply(s));
  }

  ftv(): Set<Var> {
    return new Set([...this.domain.ftv(), ...this.range.ftv()]);
  }

  toString(): string {
    if (this.domain instanceof TArr) {
      return `(${this.domain}) -> ${this.range}`;
    } else {
      return `${this.domain} -> ${this.range}`;
    }
  }

  prettyPrint(): string {
    return prettyPrint(this);
  }

  atLocation(location: Location): Type {
    return new TArr(this.domain, this.range, location);
  }
}

export class TTuple implements Type {
  types: Type[];
  location: Location | undefined;

  constructor(types: Type[], location: Location | undefined = undefined) {
    this.types = types;
    this.location = location;
  }

  equals(other: Type): boolean {
    return other instanceof TTuple &&
      this.types.length === other.types.length &&
      this.types.map((v, i) => [v, other.types[i]]).every(([t1, t2]) =>
        t1.equals(t2)
      );
  }

  apply(s: Subst): Type {
    return new TTuple(this.types.map((t) => t.apply(s)));
  }

  ftv(): Set<Var> {
    return new Set(this.types.flatMap((t) => [...t.ftv()]));
  }

  toString(): string {
    return `(${this.types.join(" * ")})`;
  }

  prettyPrint(): string {
    return prettyPrint(this);
  }

  atLocation(location: Location): Type {
    return new TTuple(this.types, location);
  }
}

export const typeError = new TCon("Error");
export const typeInt = new TCon("Int");
export const typeBool = new TCon("Bool");

export class Subst {
  protected items: Map<Var, Type>;

  constructor(items: Map<Var, Type>) {
    this.items = items;
  }

  compose(s: Subst): Subst {
    return new Subst(
      Maps.union(Maps.map(s.items, (v) => v.apply(this)), this.items),
    );
  }

  get(v: Var): Type | undefined {
    return this.items.get(v);
  }

  entries(): Array<[Var, Type]> {
    return [...this.items.entries()];
  }

  remove(names: Array<Var>): Subst {
    return new Subst(Maps.removeKeys(this.items, names));
  }
}

export const nullSubs = new Subst(new Map());

export class Scheme {
  names: Array<Var>;
  type: Type;

  constructor(names: Array<Var>, type: Type) {
    this.names = names;
    this.type = type;
  }

  apply(s: Subst): Scheme {
    return new Scheme(this.names, this.type.apply(s.remove(this.names)));
  }

  ftv(): Set<Var> {
    return Sets.difference(this.type.ftv(), new Set(this.names));
  }

  instantiate(pump: Pump): Type {
    const subst = new Subst(new Map(this.names.map((n) => [n, pump.next()])));

    return this.type.apply(subst);
  }
}

export class TypeEnv {
  protected items: Map<string, Scheme>;

  constructor(items: Map<string, Scheme>) {
    this.items = items;
  }

  extend(name: string, scheme: Scheme): TypeEnv {
    const result = Maps.clone(this.items);

    result.set(name, scheme);

    return new TypeEnv(result);
  }

  apply(s: Subst): TypeEnv {
    return new TypeEnv(Maps.map(this.items, (scheme) => scheme.apply(s)));
  }

  ftv(): Set<Var> {
    return Sets.flatUnion([...this.items.values()].map((v) => v.ftv()));
  }

  scheme(name: string): Scheme | undefined {
    return this.items.get(name);
  }

  generalise(t: Type): Scheme {
    return new Scheme(Sets.toArray(Sets.difference(t.ftv(), this.ftv())), t);
  }
}

export const emptyTypeEnv = new TypeEnv(new Map());

export type Pump = { next: () => TVar; nextN: (n: number) => Array<TVar> };

export const createFresh = (): Pump => {
  let count = 0;

  return {
    next: (): TVar => new TVar("V" + ++count),
    nextN: (n: number): Array<TVar> =>
      Array(n).fill(0).map(() => new TVar("V" + ++count)),
  };
};
