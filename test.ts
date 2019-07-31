import { run, test } from "t0"
import { map } from "./"

test("map single", async () => {
  const source = create([{ a: 2 }])
  const output = map(source, x => x.a)
  await asyncEqual(output, [2])
})

test("map properties", async () => {
  const source = create([{ a: 1 }, { a: 2 }, { a: 3 }])
  const output = map(source, x => x.a)
  await asyncEqual(output, [1, 2, 3])
})

test("empty", async () => {
  const source = create<{ a: number }>([])
  const output = map(source, x => x.a)
  await asyncEqual(output, [])
})

run()

function create<T = unknown>(x: Iterable<T>) {
  return (async function*() {
    yield* x
  })()
}

async function asyncEqual<T = unknown>(
  a: AsyncIterable<T>,
  b: AsyncIterable<T> | Iterable<T>
) {
  const i = a[Symbol.asyncIterator]()
  const j = isAsyncIterable(b)
    ? b[Symbol.asyncIterator]()
    : b[Symbol.iterator]()
  do {
    const x = await i.next()
    const y = await j.next()
    if (x.done != y.done) {
      return false
    }
    if (x.done && y.done) {
      return true
    }
    if (x.value !== y.value) {
      return false
    }
  } while (true)
}

function isAsyncIterable<T = unknown>(x: any): x is AsyncIterable<T> {
  return typeof x[Symbol.asyncIterator] === "function"
}

async function* empty<T = unknown>(): AsyncIterable<T> {}
