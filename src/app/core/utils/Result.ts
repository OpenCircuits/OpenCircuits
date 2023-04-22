import {MultiError} from "./MultiError";

//
// Result
//

// Rust-like implementation of "Result" type.  Use equivalent rust names.
// https://doc.rust-lang.org/std/result/
export type Result<T = void, E = MultiError> = (ResultOk<T> | ResultErr<E>) & RInterface<T, E>;

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
    asUnion(): T | E;
}

class ResultOk<T> {
    public constructor(t: T) {
        this.value = t;
    }
    public readonly ok = true as const;
    public readonly value: T;

    // Queries
    public isOk(): boolean {
        return this.ok;
    }
    public isErr(): boolean {
        return !this.ok;
    }

    // Extracting values
    public expect(_errMsg: string): T {
        return this.value;
    }
    public unwrap(): T {
        return this.value;
    }
    public unwrapOr(_d: T): T {
        return this.value;
    }
    public unwrapOrElse(_f: (e: never) => T): T {
        return this.value;
    }


    // Transformations (omisssions: "transpose")
    public errToOption(): OptionNone {
        return None;
    }
    public okToOption(): OptionSome<T> {
        return Some(this.value);
    }
    public map<U>(f: (t: T) => U): ResultOk<U> {
        return Ok(f(this.value));
    }
    public mapErr(_f: (e: never) => never): ResultOk<T> {
        return this;
    }
    public mapOr<U>(f: (t: T) => U, _u: U): U {
        return f(this.value);
    }
    public mapOrElse<U>(f: (t: T) => U, _g: (e: never) => U): U {
        return f(this.value);
    }

    // Boolean operators
    public and<U, E>(o: Result<U, E>): Result<U, E> {
        return o;
    }
    public andThen<U, E>(f: (t: T) => Result<U, E>): Result<U, E> {
        return f(this.value);
    }

    public or(_o: Result<T, never>): ResultOk<T> {
        return this;
    }
    public orElse(_f: (e: never) => Result<T, never>): ResultOk<T> {
        return this;
    }

    // Extensions
    public uponErr(_f: (e: never) => unknown): ResultOk<T> {
        return this;
    }
    public uponOk(f: (t: T) => unknown): ResultOk<T> {
        f(this.value);
        return this;
    }
    public match(f: (t: T) => unknown, _g: (e: never) => unknown): ResultOk<T> {
        return this.uponOk(f);
    }
    public asUnion(): T {
        return this.value;
    }
}

class ResultErr<E> {
    public constructor(e: E) {
        this.error = e;
    }
    public readonly ok = false as const;
    public readonly error: E;

    // Queries
    public isOk(): boolean {
        return this.ok;
    }
    public isErr(): boolean {
        return !this.ok;
    }

    // Extracting values
    public expect(errMsg: string): never {
        throw new Error(errMsg);
    }
    public unwrap(): never {
        throw this.error;
    }
    public unwrapOr<T>(d: T): T {
        return d;
    }
    public unwrapOrElse<T>(f: (e: E) => T): T {
        return f(this.error);
    }


    // Transformations (omisssions: "transpose")
    public errToOption(): OptionSome<E> {
        return Some(this.error);
    }
    public okToOption(): OptionNone {
        return None;
    }
    public map(_f: (t: never) => never): ResultErr<E> {
        return this;
    }
    public mapErr<F>(f: (e: E) => F): ResultErr<F> {
        return Err(f(this.error));
    }
    public mapOr<U>(_f: (t: never) => U, u: U): U {
        return u;
    }
    public mapOrElse<U>(_f: (t: never) => U, g: (e: E) => U): U {
        return g(this.error);
    }

    // Boolean operators
    public and(_o: Result<never, E>): ResultErr<E> {
        return this;
    }
    public andThen(_f: (t: never) => Result<never, E>): ResultErr<E> {
        return this;
    }

    public or<T, F>(o: Result<T, F>): Result<T, F> {
        return o;
    }
    public orElse<T, F>(f: (e: E) => Result<T, F>): Result<T, F> {
        return f(this.error);
    }

    // Extensions
    public uponErr(f: (e: E) => unknown): ResultErr<E> {
        f(this.error);
        return this;
    }
    public uponOk(_f: (t: never) => unknown): ResultErr<E> {
        return this;
    }
    public match(_f: (t: never) => unknown, g: (e: E) => unknown): ResultErr<E> {
        return this.uponErr(g);
    }
    public asUnion(): E {
        return this.error;
    }
}

export function Test<T, E>(t: T): Result<T, E> {
    return Ok(t);
}

export function Ok<T>(t: T): ResultOk<T> {
    return new ResultOk(t);
}
export function Err<E>(e: E): ResultErr<E> {
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

export const OkVoid = Ok<void>(undefined);
export function ErrE(e: string): ResultErr<MultiError> {
    return Err(new MultiError([new Error(e)]));
}

//
// Option
//

// Rust-like implementation of "Option" type.  Use equivalent rust names.
// https://doc.rust-lang.org/std/option/
export type Option<T> = (OptionSome<T> | OptionNone) & OInterface<T>;

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
    asUnion(): T | undefined;
}

class OptionSome<T> {
    public constructor(t: T) {
        this.value = t;
    }
    public readonly some = true as const;
    public readonly value: T;

    // Queries
    public isSome(): boolean {
        return true;
    }
    public isNone(): boolean {
        return false;
    }

    // Extracting values
    public expect(_errMsg: string): T {
        return this.value;
    }
    public unwrap(): T {
        return this.value;
    }
    public unwrapOr(_d: T): T {
        return this.value;
    }
    public unwrapOrElse(_f: () => T): T {
        return this.value;
    }

    // Transformations (omissions: transpose, flatten)
    public okOr(_err: never): ResultOk<T> {
        return Ok(this.value);
    }
    public okOrElse(_f: () => never): ResultOk<T> {
        return Ok(this.value);
    }
    public filter(f: (t: T) => boolean): Option<T> {
        return f(this.value) ? this : None;
    }
    public map<U>(f: (t: T) => U): OptionSome<U> {
        return Some(f(this.value));
    }
    public mapOr<U>(f: (t: T) => U, _u: U): U {
        return f(this.value);
    }
    public mapOrElse<U>(f: (t: T) => U, _g: () => U): U {
        return f(this.value);
    }
    public zip<U>(o: Option<U>): Option<[T,U]> {
        return o.some ? Some([this.value, o.value]) : None;
    }
    public zipWith<U, R>(o: Option<U>, f: (t: T, u: U) => R): Option<R> {
        return o.some ? Some(f(this.value, o.value)) : None;
    }

    // Boolean operators
    public and<U>(o: Option<U>): Option<U> {
        return o;
    }
    public andThen<U>(f: (t: T) => Option<U>): Option<U> {
        return f(this.value);
    }

    public or(_o: Option<T>): OptionSome<T> {
        return this;
    }
    public orElse(_f: () => Option<T>): OptionSome<T> {
        return this;
    }

    public xor(o: Option<T>): Option<T> {
        return o.some ? None : this;
    }

    // Extensions
    public uponNone(_f: () => unknown): OptionSome<T> {
        return this;
    }
    public uponSome(f: (t: T) => unknown): OptionSome<T> {
        f(this.value);
        return this;
    }
    public match(f: (t: T) => unknown, _g: () => unknown): OptionSome<T> {
        return this.uponSome(f);
    }
    public asUnion(): T {
        return this.value;
    }
}

class OptionNone {
    public constructor() {}
    public readonly some = false as const;

    // Queries
    public isSome(): boolean {
        return false;
    }
    public isNone(): boolean {
        return true;
    }

    // Extracting values
    public expect(errMsg: string): never {
        throw new Error(errMsg);
    }
    public unwrap(): never {
        throw new Error("Attempted to unwrap \"None\" Option");
    }
    public unwrapOr(d: T): T {
        return d;
    }
    public unwrapOrElse(f: () => T): T {
        return f();
    }

    // Transformations (omissions: transpose, flatten)
    public okOr<E>(err: E): ResultErr<E> {
        return Err(err);
    }
    public okOrElse<E>(f: () => E): ResultErr<E> {
        return Err(f());
    }
    public filter(_f: (t: never) => boolean): OptionNone {
        return this;
    }
    public map(_f: (t: never) => never): OptionNone {
        return this;
    }
    public mapOr<U>(_f: (t: never) => U, u: U): U {
        return u
    }
    public mapOrElse<U>(_f: (t: never) => U, g: () => U): U {
        return g();
    }
    public zip(_o: Option<never>): OptionNone {
        return this;
    }
    public zipWith(_o: Option<never>, _f: (t: never, u: never) => never): OptionNone {
        return this;
    }

    // Boolean operators
    public and(_o: Option<never>): OptionNone {
        return this;
    }
    public andThen(_f: (t: never) => Option<never>): OptionNone {
        return this;
    }

    public or<T>(o: Option<T>): Option<T> {
        return o;
    }
    public orElse<T>(f: () => Option<T>): Option<T> {
        return f();
    }

    public xor<T>(o: Option<T>): Option<T> {
        return o;
    }

    // Extensions
    public uponNone(f: () => unknown): OptionNone {
        f();
        return this;
    }
    public uponSome(_f: (t: never) => unknown): OptionNone {
        return this;
    }
    public match(_f: (t: never) => unknown, g: () => unknown): Option<T> {
        return this.uponNone(g);
    }
    public asUnion(): undefined {
        return undefined;
    }
}

export function Some<T>(t: T): OptionSome<T> {
    return new OptionSome(t);
}
export const None = new OptionNone();

export function WrapOpt<T>(t: T | undefined): Option<T> {
    return t === undefined ? None : Some(t);
}

// Helper functions that don't work with Result as the receiver
export const ResultUtil = {
    // Like map, but stops after the first item returns an Err.
    mapIter: <T, U, E>(it: IterableIterator<T>, f: (t: T) => Result<U, E>): Result<U[], E> =>
        ResultUtil.reduceIter([], it, (res: U[], t: T) =>
            f(t).map((a) => {
                    res.push(a);
                    return res;
                })),

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
