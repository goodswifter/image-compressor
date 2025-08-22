/**
 * 任意类型的异步函数
 */
type AnyPromiseFunction<T extends any[] = any[], R = void> = (...arg: T) => PromiseLike<R>

/**
 * 任意类型的普通函数
 */
type AnyNormalFunction<T extends any[] = any[], R = void> = (...arg: T) => R

/**
 * 任意类型的函数
 */
type AnyFunction<T extends any[] = any[], R = void> =
  | AnyNormalFunction<T, R>
  | AnyPromiseFunction<T, R>

/**
 *  T | null 包装
 */
type Nullable<T = any> = null | T

/**
 * 字符串类型对象
 */
type Recordable<T = any> = Record<string, T>
