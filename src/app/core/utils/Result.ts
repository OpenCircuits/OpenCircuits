import {MultiError} from "./MultiError";

//
// Result
//

export type Result<T = void, E = MultiError> = ResultVariants<T, E> & RInterface<T, E>;

type ResultRepOk<T> = { ok: true, value: T };
type ResultRepErr<E> = { ok: false, error: E };
type ResultRep<T, E> = ResultRepOk<T> | ResultRepErr<E>;

type ResultVariants<T, E> =
    | (ResultRepOk<T> & { cast<F>(): Result<T, F>})
    | (ResultRepErr<E> & { cast<U>(): Result<U, E>});

interface RInterface<T, E> {
    // Extracting values
    expect(errMsg: string): T;
    unwrap(): T;
    unwrapOr(d: T): T;
    unwrapOrElse(f: (e: E) => T): T;

    // Transformations (omisssions: "transpose")
    errToOption(): Option<E>;
    okToOption(): Option<T>;
    map<U>(f: (t: T) => U): Result<U, E>;
    mapErr<F>(f: (e: E) => F): Result<T, F>;
    mapOr<U>(f: (t: T) => U, u: U): U;
    mapOrElse<U>(f: (t: T) => U, g: (e: E) => U): U;

    // Boolean operators
    and<U>(o: Result<U, E>): Result<U, E>;
    andThen<U>(f: (t: T) => Result<U, E>): Result<U, E>;

    or<F>(o: Result<T, F>): Result<T, F>;
    orElse<F>(f: (e: E) => Result<T, F>): Result<T, F>;

    // Extensions
    uponErr(f: (e: E) => unknown): Result<T, E>;
    uponOk(f: (t: T) => unknown): Result<T, E>;
    match(f: (t: T) => unknown, g: (e: E) => unknown): Result<T, E>;
}

// Rust-like implementation of "Result" type.  Use equivalent rust names.
// https://doc.rust-lang.org/std/result/
class ResultBase<T, E> implements RInterface<T, E> {
    private readonly r: ResultRep<T, E>;
    protected constructor(r: ResultRep<T, E>) {
        this.r = r;
    }

    // Use for zero-copy cast when we know which variant we are
    // Cast "Err" values to different "Ok" types
    protected unsafeCastErr<U>(): Result<U, E> {
        return this as unknown as Result<U, E>;
    }
    // Cast "Ok" values to different "Err" types
    protected unsafeCastOk<F>(): Result<T, F> {
        return this as unknown as Result<T, F>;
    }

    protected asResult(): Result<T, E> {
        return this as unknown as Result<T, E>;
    }

    // Queries
    public isOk(): boolean {
        return this.r.ok;
    }
    public isErr(): boolean {
        return !this.r.ok;
    }

    // Extracting values
    public expect(errMsg: string): T {
        if (!this.r.ok)
            throw new Error(errMsg);
        return this.r.value;
    }
    public unwrap(): T {
        if (!this.r.ok)
            throw this.r.error;
        return this.r.value;
    }
    public unwrapOr(d: T): T {
        if (!this.r.ok)
            return d;
        return this.r.value;
    }
    public unwrapOrElse(f: (e: E) => T): T {
        if (!this.r.ok)
            return f(this.r.error);
        return this.r.value;
    }


    // Transformations (omisssions: "transpose")
    public errToOption(): Option<E> {
        return this.r.ok ? None() : Some(this.r.error);
    }
    public okToOption(): Option<T> {
        return this.r.ok ? Some(this.r.value) : None();
    }
    public map<U>(f: (t: T) => U): Result<U, E> {
        return this.r.ok ? Ok(f(this.r.value)) : this.unsafeCastErr();
    }
    public mapErr<F>(f: (e: E) => F): Result<T, F> {
        return this.r.ok ? this.unsafeCastOk() : Err(f(this.r.error));
    }
    public mapOr<U>(f: (t: T) => U, u: U): U {
        return this.r.ok ? f(this.r.value) : u;
    }
    public mapOrElse<U>(f: (t: T) => U, g: (e: E) => U): U {
        return this.r.ok ? f(this.r.value) : g(this.r.error);
    }

    // Boolean operators
    public and<U>(o: Result<U, E>): Result<U, E> {
        return this.r.ok ? o : this.unsafeCastErr();
    }
    public andThen<U>(f: (t: T) => Result<U, E>): Result<U, E> {
        return this.r.ok ? f(this.r.value) : this.unsafeCastErr();
    }

    public or<F>(o: Result<T, F>): Result<T, F> {
        return this.r.ok ? this.unsafeCastOk() : o;
    }
    public orElse<F>(f: (e: E) => Result<T, F>): Result<T, F> {
        return this.r.ok ? this.unsafeCastOk() : f(this.r.error);
    }

    // Extensions
    public uponErr(f: (e: E) => unknown): Result<T, E> {
        return this.match(() => {}, f);
    }
    public uponOk(f: (t: T) => unknown): Result<T, E> {
        return this.match(f, () => {});
    }
    public match(f: (t: T) => unknown, g: (e: E) => unknown): Result<T, E> {
        if (this.r.ok)
            f(this.r.value);
        else
            g(this.r.error);
        return this.asResult();
    }
}

class ResultOk<T, E> extends ResultBase<T, E> {
    public constructor(t: T) {
        super({ ok: true, value: t });
        this.value = t;
    }
    public readonly ok = true;
    public readonly value: T;

    public cast<F>(): Result<T, F> {
        return this.unsafeCastOk();
    }
}
class ResultErr<T, E> extends ResultBase<T, E> {
    public constructor(e: E) {
        super({ ok: false, error: e });
        this.error = e;
    }
    public readonly ok = false;
    public readonly error: E;

    public cast<U>(): Result<U, E> {
        return this.unsafeCastErr();
    }
}

export function Ok<T, E>(t: T): ResultOk<T, E> {
    return new ResultOk(t);
}
export function Err<T, E>(e: E): ResultErr<T, E> {
    return new ResultErr(e);
}

export function WrapResOr<T, E>(t: T | undefined, e: E): Result<T, E> {
    return t === undefined ? Err(e) : Ok(t);
}
export function WrapResOrE<T>(t: T | undefined, e: string): Result<T, MultiError> {
    // We need to be careful to only every construct a new JS-`Error` when there an actual
    //  error. It is a very expensive operation as it captures a stack trace on construction.
    return t === undefined ? Err(new MultiError([new Error(e)])) : Ok(t);
}

const OK_VOID = Ok<void, unknown>(undefined);
export function OkVoid<E>(): ResultOk<void, E> {
    return OK_VOID as ResultOk<void, E>;
}
export function ErrE<T>(e: string): ResultErr<T, MultiError> {
    return Err(new MultiError([new Error(e)]));
}

//
// Option
//

export type Option<T> = OptionVariants<T> & OInterface<T>;

type OptionRepSome<T> = { some: true, value: T };
type OptionRepNone = { some: false };
type OptionRep<T> = OptionRepSome<T> | OptionRepNone;

// See ResultVariants def for using "any" here.
type OptionVariants<T> =
    | OptionRepSome<T>
    | (OptionRepNone & { cast<U>(): Option<U> });

interface OInterface<T> {
    // Queries
    isSome(): boolean;
    isNone(): boolean;

    // Extracting values
    expect(errMsg: string): T;
    unwrap(): T;
    unwrapOr(d: T): T;
    unwrapOrElse(f: () => T): T;

    // Transformations (omissions: transpose, flatten)
    okOr<E>(err: E): Result<T, E>;
    okOrElse<E>(f: () => E): Result<T, E>;
    filter(f: (t: T) => boolean): Option<T>;
    map<U>(f: (t: T) => U): Option<U>;
    mapOr<U>(f: (t: T) => U, u: U): U;
    mapOrElse<U>(f: (t: T) => U, g: () => U): U;
    zip<U>(o: Option<U>): Option<[T,U]>;
    zipWith<U, R>(o: Option<U>, f: (t: T, u: U) => R): Option<R>;

    // Boolean operators
    and<U>(o: Option<U>): Option<U>;
    andThen<U>(f: (t: T) => Option<U>): Option<U>;

    or(o: Option<T>): Option<T>;
    orElse(f: () => Option<T>): Option<T>;

    xor(o: Option<T>): Option<T>;

    // Extensions
    uponNone(f: () => unknown): Option<T>;
    uponSome(f: (t: T) => unknown): Option<T>;
    match(f: (t: T) => unknown, g: () => unknown): Option<T>;
}

// Rust-like implementation of "Option" type.  Use equivalent rust names.
// https://doc.rust-lang.org/std/option/
class OptionBase<T> {
    private readonly r: OptionRep<T>;
    protected constructor(r: OptionRep<T>) {
        this.r = r;
    }

    protected asOption(): Option<T> {
        return this as unknown as Option<T>;
    }

    // Queries
    public isSome(): boolean {
        return this.r.some;
    }
    public isNone(): boolean {
        return !this.r.some;
    }

    // Extracting values
    public expect(errMsg: string): T {
        if (!this.r.some)
            throw new Error(errMsg);
        return this.r.value;
    }
    public unwrap(): T {
        if (!this.r.some)
            throw new Error("Attempted to unwrap \"None\" Option");
        return this.r.value;
    }
    public unwrapOr(d: T): T {
        if (!this.r.some)
            return d;
        return this.r.value;
    }
    public unwrapOrElse(f: () => T): T {
        if (!this.r.some)
            return f();
        return this.r.value;
    }

    // Transformations (omissions: transpose, flatten)
    public okOr<E>(err: E): Result<T, E> {
        return this.r.some ? Ok(this.r.value) : Err(err);
    }
    public okOrElse<E>(f: () => E): Result<T, E> {
        return this.r.some ? Ok(this.r.value) : Err(f());
    }
    public filter(f: (t: T) => boolean): Option<T> {
        return this.r.some && f(this.r.value) ? this.asOption() : None();
    }
    public map<U>(f: (t: T) => U): Option<U> {
        return this.r.some ? Some(f(this.r.value)) : None();
    }
    public mapOr<U>(f: (t: T) => U, u: U): U {
        return this.r.some ? f(this.r.value) : u;
    }
    public mapOrElse<U>(f: (t: T) => U, g: () => U): U {
        return this.r.some ? f(this.r.value) : g();
    }
    public zip<U>(o: Option<U>): Option<[T,U]> {
        return this.r.some && o.some ? Some([this.r.value, o.value]) : None();
    }
    public zipWith<U, R>(o: Option<U>, f: (t: T, u: U) => R): Option<R> {
        return this.r.some && o.some ? Some(f(this.r.value, o.value)) : None();
    }

    // Boolean operators
    public and<U>(o: Option<U>): Option<U> {
        return this.r.some ? o : None();
    }
    public andThen<U>(f: (t: T) => Option<U>): Option<U> {
        return this.r.some ? f(this.r.value) : None();
    }

    public or(o: Option<T>): Option<T> {
        return this.r.some ? this.asOption() : o;
    }
    public orElse(f: () => Option<T>): Option<T> {
        return this.r.some ? this.asOption() : f();
    }

    public xor(o: Option<T>): Option<T> {
        return this.r.some ? (o.some ? None() : this.asOption()) : (o.some ? o : None());
    }

    // Extensions
    public uponNone(f: () => unknown): Option<T> {
        return this.match(() => {}, f);
    }
    public uponSome(f: (t: T) => unknown): Option<T> {
        return this.match(f, () => {});
    }
    public match(f: (t: T) => unknown, g: () => unknown): Option<T> {
        if (this.r.some)
            f(this.r.value);
        else
            g();
        return this.asOption();
    }
}

class OptionSome<T> extends OptionBase<T> {
    public constructor(t: T) {
        super({ some: true, value: t });
        this.value = t;
    }
    public readonly some = true;
    public readonly value: T;
}
class OptionNone<T> extends OptionBase<T> {
    public constructor() {
        super({ some: false });
    }
    public readonly some = false;

    public cast<U>(): Option<U> {
        return None();
    }
}

export function Some<T>(t: T): OptionSome<T> {
    return new OptionSome(t);
}
const NONE = new OptionNone();
export function None<T>(): OptionNone<T> {
    return NONE as OptionNone<T>;
}

export function WrapOpt<T>(t: T | undefined): Option<T> {
    return t === undefined ? None() : Some(t);
}

// Helper functions that don't work with Result as the receiver
export const ResultUtil = {
    // Like map, but stops after the first item returns an Err.
    mapIter: <T, U, E>(it: IterableIterator<T>, f: (t: T) => Result<U, E>): Result<U[], E> => {
        const res: U[] = [];
        for (const v of it) {
            const a = f(v);
            if (!a.ok)
                return a.cast();
            res.push(a.value);
        }
        return Ok(res);
    },

    // Like reduce, but stops after the first step returns an Err.
    reduceIter: <T, U, E>(u: U, it: IterableIterator<T>, f: (u: U, t: T) => Result<U, E>): Result<U, E> => {
        for (const v of it) {
            const a = f(u, v);
            if (!a.ok)
                return a;
            u = a.value;
        }
        return Ok(u);
    },

    reduceIterU: <T, E>(it: IterableIterator<T>, f: (t: T) => Result<void, E>): Result<void, E> =>
        ResultUtil.reduceIter<T, void, E>(undefined, it, (_, t) => f(t)),
}

export const OptionUtil = {
    mapIter: <T, U>(it: IterableIterator<T>, f: (t: T) => Option<U>): Option<U[]> =>
        ResultUtil.mapIter(it, (t) => f(t).okOr(undefined)).okToOption(),

    reduceIter: <T, U>(u: U, it: IterableIterator<T>, f: (u: U, t: T) => Option<U>): Option<U> =>
        ResultUtil.reduceIter(u, it, (u, t) => f(u, t).okOr(undefined)).okToOption(),
}
