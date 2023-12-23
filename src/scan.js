import { MODEL_SELF, Z_MODEL_IDS } from "./symbols";


export function scan(model){
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
      // TODO: handle lone setter
    } else {
      def = value
      if(typeof value == 'function'){
        // equivalent to value instanceof Model
        if(Object.hasOwn(value,Z_MODEL_IDS)){
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