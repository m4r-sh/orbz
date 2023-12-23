import { OrbCore } from "./OrbCore.js";
import { $Z, MODEL_SELF, Z_DEFS, Z_MODEL_IDS, MODEL_IMPLEMENTS } from './symbols.js'

// TODO: Model.self()
// TODO: Model.save()
// TODO: Model.load()
// TODO: Model.inspect()

let shared_proto = {
  $: { value: function(cb,watchlist){
    if(typeof cb == 'function'){
      return this[$Z].add_sub(cb,watchlist)
    } else if(typeof cb == 'string'){
      return this[$Z].add_link(cb,watchlist)
    }
  }},
  $invalidate: { value: function(str){
    this[$Z].inval(str)
  }},
  toString: { value: function(){ 
    return 'orb toString'
  }},
  [Symbol.toPrimitive]: { value: function(){
    return 'orb toPrimitive'
  }},
  [Symbol.toStringTag]: { value: function(){ 
    return 'orb string tag'
  }}
}



function Model(){
  let { defs, types } = scan(arguments[arguments.length-1])
  let model_id = Symbol('unique-model-id')
  let ids = [model_id]
  for(let i = arguments.length - 2; i >= 0; i--){
    defs = deepMerge(arguments[i][Z_DEFS], defs)
    ids.push(...arguments[i][Z_MODEL_IDS])
  }


  function ModelConstructor(state={}){
    if(!new.target){ return new ModelConstructor(state) }
    Object.defineProperty(this,$Z,{ value: new OrbCore(defs,state,this) })
    Object.defineProperty(this,MODEL_IMPLEMENTS,{ value: ids })
    Object.preventExtensions(this)
  }


  Object.defineProperty(ModelConstructor,Symbol.hasInstance,{
    value: function(o){
      return (o && o[MODEL_IMPLEMENTS] && o[MODEL_IMPLEMENTS].includes(model_id))
    }
  })

  ModelConstructor[Z_DEFS] = defs
  ModelConstructor[Z_MODEL_IDS] = ids

  // create a prototype chain for every inherited model
  // if(arguments.length >= 2){
  //   Object.setPrototypeOf(ModelConstructor.prototype,arguments[0])
  // }

  // assign self to values with placeholder
  Object.keys(defs.orbs).forEach(k => {
    if(defs.orbs[k] == MODEL_SELF){
      defs.orbs[k] = ModelConstructor
    }
  })

  Object.keys(defs.entry).forEach(k => {
    Object.defineProperty(ModelConstructor.prototype,k,{
      value: function(){
        return this[$Z].run_entrypoint(k,arguments,{async: false})
      },
      // enumerable: !k.startsWith('_')
    })
  })

  Object.keys(defs.async).forEach(k => {
    Object.defineProperty(ModelConstructor.prototype,k,{
      value: function(){
        return this[$Z].run_entrypoint(k,arguments,{async: true})
      },
      // enumerable: !k.startsWith('_')
    })
  })

  Object.keys(defs.derived).forEach(k => {
    Object.defineProperty(ModelConstructor.prototype,k,{
      get(){
        return this[$Z].get_derived(k)
      },
      enumerable: !k.startsWith('_')
    })
  })

  Object.keys(defs.getset).forEach(k => {
    Object.defineProperty(ModelConstructor.prototype,k,{
      get(){
        return this[$Z].get_derived(k)
      },
      set(v){
        return this[$Z].run_entrypoint(k,[v])
      },
      enumerable: !k.startsWith('_')
    })
  })

  Object.keys(defs.state).forEach(k => {
    Object.defineProperty(ModelConstructor.prototype,k,{
      get(){
        return this[$Z].get_state(k)
      },
      set(v){
        this[$Z].set_state(k,v)
      },
      enumerable: !k.startsWith('_')
    })
  })

  Object.keys(defs.orbs).forEach(k => {
    Object.defineProperty(ModelConstructor.prototype,k,{
      get(){
        return this[$Z].get_orb(k)
      },
      set(v){
        this[$Z].set_orb(k,v)
      },
      enumerable: !k.startsWith('_')
    })
  })

  Object.defineProperties(ModelConstructor.prototype, shared_proto);

  return ModelConstructor
}

Model.self = () => MODEL_SELF

Object.defineProperty(Model,Symbol.hasInstance,{
  value(o){
    return (o && Object.hasOwn(o,Z_MODEL_IDS))
  }
})

export { Model }

function scan(model){
  // let internal = {}, overrides = {}, models = {}, orbs = {}
  let defs = {
    state: {},
    derived: {},
    entry: {},
    orbs: {},
    getset: {},
    async: {}
  }
  let types = {}
  let prop_descs = Object.getOwnPropertyDescriptors(model)
  Object.keys(prop_descs).forEach(key => {
    let type, def
    let { value, get, set } = prop_descs[key]
    if(get && set){
      type = 'getset'
      def = { get, set }
    } else if(get){
      def = get
      type = 'derived'
    } else if(set){
      console.log('TODO: lone setter')
    } else {
      def = value
      if(typeof value == 'function'){
        if(value instanceof Model){
          type = 'orbs'
        } else if(value.constructor.name == 'AsyncFunction') {
          type = 'async'
        } else {
          type = 'entry'
        }
      } else {
        if (value == MODEL_SELF){
          type = 'orbs'
        } else {
          type = 'state'
        }
      }
    }
    types[key] = type
    defs[type][key] = def
  });

  return { types, defs }
}

function deepMerge(target, source) {
  const result = { ...target, ...source };
  for (const key of Object.keys(result)) {
    result[key] =
      typeof target[key] == 'object' && typeof source[key] == 'object'
        ? deepMerge(target[key], source[key])
        : result[key] //structuredClone(result[key]);
  }
  return result;
}