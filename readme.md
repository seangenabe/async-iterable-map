# async-iterable-map

Transforms items of an async iterable concurrently

Like `p-map` but for `AsyncIterable`s.

If you like this package, be sure to star its repo, and please consider [donating](https://seangenabe.netlify.com/donate).

## Usage

```typescript
import { map } from "async-iterable-map"
```

### map(source, transform, options = {})

Generic type parameters:
* `T = unknown` - type of input elements
* `U = unknown` - type of output elements

Parameters:
* `source: AsyncIterable<T> | Iterable<T>` - the iterable to transform
* `transform: (element: T) => Promise<U> | U` - the transform / mapping function from the input to the output
* `options.concurrency: number` - how many elements to transform concurrently. Must be a positive integer or `Infinity`. Default: `Infinity`

Returns:
* `AsyncIterableIterator<U> & PromiseLike<U[]>`
  * Use the `AsyncIterableIterator<U>` interface to iterate through the remaining output elements one by one.
  * Use the `PromiseLike<U[]>` interface to get all of the remaining output elements.

Both interfaces return the output elements in order.

Transforms items of an async iterable concurrently.
