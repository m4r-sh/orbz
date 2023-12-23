import { Model } from "./Model.js"



// set(key,value) or add(value)
// get(key)
// delete(key)

// $map, $filter -> derived (links)
// $each -> apply effect to each item (and remove) in the list automatically
// $({ items, size, keys }) -> aggregate effects

// [Symbol.iterator]
// .foreach()
// get items
// get size
// get keys


let DictModel = Model({

})

export function Dict(item_model){
  return new DictModel({
    _item_model = item_model,
  })
}

Object.defineProperty(Dict,Symbol.hasInstance,{
  value(o){
    return (o && o instanceof DictModel)
  }
})


let DictModel = Model({
  _item_model: null,
  _items: new Set(),
  get size(){

  },
  get items(){

  },
  add(v){
    let { _item_model, _items } = this
    if(v instanceof _item_model){
      this._items.add(v)
      v.$
      this.$invalidate('_items')
    } else {
      console.log("INVALID ADD TO LIST")
    }
  },
  delete(v){
    this._items.delete(v)
    this.$invalidate('_items')
  },
  map(txform){
    if(this._map_cache.has(txform)){
      // look for changed values and re-run changed values while returning cached values for others
    } else {
      let derived_list = Dict(this._item_model)
      // fill derived_list with these values
      // trigger updates s/t .map's enclosing function is marked for re-execution,
      // but the updated callbacks are not called until .map is directly called again.
      // this requires maintaining a cache memory for each .map() callback
    }
  },
})

// foreach & reduce 



let PagesBuilds = Model({
  pages: Dict(Page),
  get sitemap(){
    // retriggers on every single item change
    
    let concat = this.pages.reduce((agg,v) => agg + v,'')
    return concat
  },
  get render_transpilation_list(){
    // retriggers on every item change, but most .map results are cached
    return this.pages.map()
  }
})

