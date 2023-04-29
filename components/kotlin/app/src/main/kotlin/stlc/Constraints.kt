package stlc

typealias Constraint = Pair<Type, Type>

data class Constraints(private val constraints: MutableList<Constraint> = mutableListOf()) {
    fun add(t1: Type, t2: Type) {
        constraints.add(Pair(t1, t2))
    }

    fun solve(): Subst =
        solver(constraints)

    override fun toString(): String = constraints.joinToString(", ") { "${it.first} ~ ${it.second}" }
}

private data class Unifier(val subst: Subst, val constraints: List<Constraint>)

private val emptyUnifier = Unifier(nullSubst, emptyList())

private fun bind(name: Var, type: Type): Unifier =
    Unifier(Subst(mapOf(Pair(name, type))), emptyList())

private fun unifies(t1: Type, t2: Type): Unifier =
    when {
        t1 == t2 -> emptyUnifier
        t1 is TVar -> bind(t1.name, if (t1.location == null || t2.location != null) t2 else t2.atLocation(t1.location))
        t2 is TVar -> bind(t2.name, if (t2.location == null || t1.location != null) t1 else t1.atLocation(t2.location))
        t1 is TArr && t2 is TArr -> unifyMany(listOf(t1.domain, t1.range), listOf(t2.domain, t2.range))
        t1 is TTuple && t2 is TTuple ->
            if (t1.types.size != t2.types.size)
                throw UnificationMismatchException(t1, t2)
            else
                unifyMany(t1.types, t2.types)

        else -> throw UnificationMismatchException(t1, t2)
    }

private fun applyTypes(s: Subst, ts: List<Type>): List<Type> =
    ts.map { it.apply(s) }

private fun unifyMany(ta: List<Type>, tb: List<Type>): Unifier =
    if (ta.isEmpty() && tb.isEmpty()) emptyUnifier
    else if (ta.isEmpty() || tb.isEmpty()) throw UnificationManyMismatchException(ta, tb)
    else {
        val t1 = ta[0]
        val ts1 = ta.drop(1)

        val t2 = tb[0]
        val ts2 = tb.drop(1)

        val (su1, cs1) = unifies(t1, t2)
        val (su2, cs2) = unifyMany(applyTypes(su1, ts1), applyTypes(su1, ts2))

        Unifier(su2 compose su1, cs1 + cs2)
    }

private fun solver(constraints: List<Constraint>): Subst {
    var su = nullSubst
    var cs = constraints.toList()

    while (cs.isNotEmpty()) {
        val (t1, t2) = cs[0]
        val cs0 = cs.drop(1)

        val (su1, cs1) = unifies(t1, t2)

        su = su1 compose su
        cs = cs1 + cs0.map { Pair(it.first.apply(su1), it.second.apply(su1)) }
    }

    return su
}
