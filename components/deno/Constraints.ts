import { nullSubs, Subst, TArr, TTuple, TVar, Type, Var } from "./Typing.ts";

type Constraint = [Type, Type];
type Unifier = [Subst, Array<Constraint>];

const emptyUnifier: Unifier = [nullSubs, []];

const bind = (
  name: Var,
  type: Type,
): Unifier => [new Subst(new Map([[name, type]])), []];

const unifies = (t1: Type, t2: Type): Unifier => {
  if (t1.equals(t2)) return emptyUnifier;
  if (t1 instanceof TVar) {
    return bind(
      t1.name,
      t1.location === undefined || t2.location !== undefined
        ? t2
        : t2.atLocation(t1.location),
    );
  }
  if (t2 instanceof TVar) {
    return bind(
      t2.name,
      t2.location === undefined || t1.location !== undefined
        ? t1
        : t1.atLocation(t2.location),
    );
  }
  if (t1 instanceof TArr && t2 instanceof TArr) {
    return unifyMany([t1.domain, t1.range], [t2.domain, t2.range]);
  }
  if (t1 instanceof TTuple && t2 instanceof TTuple) {
    if (t1.types.length !== t2.types.length) {
      throw { tag: "UnificationMismatchError", type1: t1, type2: t2 };
    }

    return unifyMany(t1.types, t2.types);
  }

  throw { tag: "UnificationMismatchError", type1: t1, type2: t2 };
};

const applyTypes = (s: Subst, ts: Array<Type>): Array<Type> =>
  ts.map((t) => t.apply(s));

const unifyMany = (ta: Array<Type>, tb: Array<Type>): Unifier => {
  if (ta.length === 0 && tb.length === 0) return emptyUnifier;
  if (ta.length === 0 || tb.length === 0) {
    throw { tag: "UnificationMismatchError", type1: ta, type2: tb };
  }

  const [t1, ...ts1] = ta;
  const [t2, ...ts2] = tb;

  const [su1, cs1] = unifies(t1, t2);
  const [su2, cs2] = unifyMany(applyTypes(su1, ts1), applyTypes(su1, ts2));

  return [su2.compose(su1), cs1.concat(cs2)];
};

const solver = (constraints: Array<Constraint>): Subst => {
  let su = nullSubs;
  let cs = [...constraints];

  while (cs.length > 0) {
    const [[t1, t2], ...cs0] = cs;
    const [su1, cs1] = unifies(t1, t2);
    su = su1.compose(su);
    cs = cs1.concat(
      cs0.map(
        (constraint) => [
          constraint[0].apply(su1),
          constraint[1].apply(su1),
        ],
      ),
    );
  }

  return su;
};

export class Constraints {
  constraints: Array<Constraint>;

  constructor(constraints: Array<Constraint> = []) {
    this.constraints = constraints;
  }

  add(t1: Type, t2: Type): void {
    this.constraints.push([t1, t2]);
  }

  solve(): Subst {
    return solver(this.constraints);
  }

  toString(): string {
    return this.constraints.map((a) =>
      `${a[0].toString()} ~ ${a[1].toString()}`
    ).join(", ");
  }

  clone(): Constraints {
    return new Constraints([...this.constraints]);
  }
}
