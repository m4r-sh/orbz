import { MODEL_SELF, Z_DEFS, Z_MODEL_IDS } from "./symbols.js";
import { Model } from "./Model.js";


export function inspect(model){
  return {
    def: model[Z_DEFS],
    models: model[Z_MODEL_IDS]
  }
}