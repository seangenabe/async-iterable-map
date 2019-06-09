import { Semaphore } from "@seangenabe/semaphore"

class AsyncIterableMapper<T, U>
  implements AsyncIterableIterator<U>, PromiseLike<U[]> {
  private semaphore: Semaphore
  private sourceIterator: AsyncIterator<T> | Iterator<T>

  constructor(
    source: AsyncIterable<T> | Iterable<T>,
    private transform: (element: T) => Promise<U> | U,
    { concurrency = Infinity }: AMapOptions = {}
  ) {
    this.semaphore = new Semaphore(concurrency)
    this.sourceIterator = isAsyncIterable(source)
      ? source[Symbol.asyncIterator]()
      : source[Symbol.iterator]()
  }

  async next(): Promise<IteratorResult<U>> {
    const { done, value } = await this.sourceIterator.next()
    if (done) {
      return { done: true } as IteratorResult<U>
    }
    const release = await this.semaphore.wait()
    const result = await this.transform(value)
    release()
    return { done: false, value: result }
  }

  [Symbol.asyncIterator]() {
    return this
  }

  private async toArray() {
    const out: U[] = []
    for await (const element of this) {
      out.push(element)
    }
    return out
  }

  then<TResult1 = U[], TResult2 = never>(
    onfulfilled?:
      | ((value: U[]) => TResult1 | PromiseLike<TResult1>)
      | null
      | undefined,
    onrejected?:
      | ((reason: any) => TResult2 | PromiseLike<TResult2>)
      | null
      | undefined
  ): PromiseLike<TResult1 | TResult2> {
    return this.toArray().then(onfulfilled, onrejected)
  }
}

export function map<T = unknown, U = unknown>(
  source: AsyncIterable<T> | Iterable<T>,
  transform: (element: T) => Promise<U> | U,
  options: AsyncIterableMapperOptions = {}
): AsyncIterableIterator<U> & PromiseLike<U[]> {
  return new AsyncIterableMapper(source, transform, options)
}

export interface AsyncIterableMapperOptions {
  concurrency?: number
}

function isAsyncIterable(x: any): x is AsyncIterable<unknown> {
  return typeof x[Symbol.asyncIterator] === "function"
}
