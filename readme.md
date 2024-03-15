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

- Feels like working with objects directly, keeping your codebase clean and simple.
- Effects get re-triggered if and only if the underlying data changes.
- Derived values only get calculated if you need them.

Under the hood, the Model definition creates a prototype that Orbs inherit.
This prototype uses accessors to track usage and coordinate reactive updates.

The magic of Orbz comes from writing Models. Models are similar to classes, but with observability built-in. Their shape is frozen, such that only methods and public state values can alter each orb.
They're defined by an object literal, with the following special rules:
- getters are "derived" - and are only calculated if they're accessed. They keep track of internal state they rely on, and remain cached until one of the underlying values changes.
- methods are batched, meaning effects are paused until the method is finished. This allows bulk edits without spammed effects
- keys prefixed with _ are 'hidden'. only available for internal methods and serialization
- generator methods are semi-batched, with resumability across sessions. *This is in progress*
- values that are Models are guaranteed to be that Model, or else null.
- values that are Orbs are guaranteed to be a unique Orb per instance, or another Orb of the same Model

---

# API

## new Model(definition)

*Returns*: an `Orb` constructor that follows the shape of the definition. This allows for generating N orbs with the same shape (that share a prototype).

## new Orb(definition)

*Returns*: a one-off `Orb` with the shape of the definition

## effect(callback, options)

*Returns*: a function to cancel the effect

The effect callback is called instantly with the current values. Accessed orb values are tracked, and whenever their values change, the effect callback is re-run.

---

# Writing Models

Model definitions are designed to be easy to read while also giving freedom for how data is stored and processed for optimal performance. 

### State

Normal values. Can be primitives (numbers, strings, arrays, objects). These are the values that get serialized to/from JSON when saving/loading to a database.

### Derived values

Computed values that depend on state or other derived values. Derived values aren't calculated until they're requested (lazy). Once computed, the value is cached until its dependencies update. If a derived value is being observed in an effect, it updates eagerly. Derived values are good for reformatting existing state or performing costly calculations based on state.

### Methods

Methods are predefined functions that can mutate state or perform parameterized queries on the Orb. State mutations within a method are batched and trigger effects only once the method is complete. If a single event can update multiple parts of state, it's good to batch them in a method.

### Local keys

State, derived values, and methods are, by default, publicly available to external calls. If you want to keep parts of the orb private, you can prefix the key with an underscore (_). Local keys can be accessed by methods and derived values, but throw an error when accessed outside of the orb. Local state is still serialized like normal state, but local state can only be externally set during orb initialization.

### Internal orbs

Orbs are composable, so one Orb can contain another Orb. When creating a model definition, you can define a specific Model that the ensuing value must be an instance of. If a matching external Orb isn't supplied, an error will be thrown. Alternatively, you can define an instance of a Model, that gets instantiated for every new instance. The first approach "links" an external orb, whereas the second approach creates an "internal" orb that is managed by the parent orb.

### Specialized Methods

To customize Orb behavior, a few methods are available to be overriden. The keys for these specialized methods are Symbols to avoid having name clashing.

- `[Model.Save]`: override default serialization (which stores all state as JSON)
- `[Model.Load]`: override default deserialization (which loads JSON state)

---

# Example

```js
import { Model } from 'orbz'

export const Counter({
  // STATE
  count: 0,
  // STATE (LOCAL)
  _multiplier: 1,
  // DERIVED
  get total(){
    let { count, _multiplier } = this
    return count * _multiplier
  } 
  // METHODS
  inc(){
    this.count++
  },
  double_mode(is_double){
    this._multiplier = is_double ? 2 : 1
  }
})

let c = new Counter({ count: 1 }) // start counter at 1

effect(() => {
  let { count, total } = c
  console.log(`Count: ${count}. Total: ${total}.`)
})
// ~> Count: 1. Total: 1
c.double_mode(true)
// ~> Count: 1. Total: 2
c.inc()
// ~> Count: 2. Total: 4
c.count = 10
// ~> Count: 10. Total: 20

```

---

# Alignment

- COPY PASTE as a first-class citizen. Behavioral code should be visible, easily readable, and quickly edited. Public gallery of copy-pasteable models > a list of npm imports
- Model writers should consider performance: there are plenty of design choices. But, model source code should have as little boilerplate as possible. Perfectable by pros, readable by anyone.
- Orb users should be able to read/write values just like a normal JS object. should feel like magic to get automatic updates with interconnected orbs.
- Orb instances should function like files. easy to download, backup, edit.
