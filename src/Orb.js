import { $Z } from "./symbols.js"
import { OrbCore } from "./OrbCore.js"
import { Model } from "./Model.js"

function Orb(def){
  return Model(def)()
}

Object.defineProperty(Orb,Symbol.hasInstance,{
  value(o){
    return (o && o[$Z] && o[$Z] instanceof OrbCore)
  }
})

export { Orb }