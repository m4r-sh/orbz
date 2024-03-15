<p align="center">
  <img src="https://raw.githubusercontent.com/m4r-sh/orbz/main/docs/orbz-sticker.png" alt="Logo" height=100>
</p>
<h1 align="center">orbz</h1>
<h3 align="center">reactive objects</h3>

<p align="center">
<a href="https://bundlephobia.com/package/orbz" target="_new"><img height=20 src="https://img.shields.io/bundlephobia/minzip/orbz" /></a>
<a href="https://www.npmjs.com/package/orbz" target="_new"><img height=20 src="https://img.shields.io/npm/v/orbz" /></a>
</p>


---

> **Note**: orbz is actively being built out. Recursive reactivity and performance improvements need to be finished before public adoption.

---

# Overview

- define behavior with an object literal
- read/write values like a normal object
- subscribe to changes with smart callbacks

# Writing Models

### Terminology

- **State**: normal values (sufficient for serialization)
- **Getters**: computed values that depend on state or other getters (only recomputed when necessary)
- **Methods**: functions that update state (effects are batched once method is finished)

**Example**:

```js
import { Model } from 'orbz'

export const Counter({
  // STATE
  count: 0,
  multiplier: 1,
  // DERIVED
  get total(){
    let { count, multiplier } = this
    return count * multiplier
  } 
  // METHODS
  inc(){
    this.count++
  },
  dec(){
    this.count--
  },
})
```

### Additional Features

- **Local-only keys**: Prefix a key with _ to only allow access from internal getters and methods
