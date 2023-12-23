import { Model } from "./Model.js"
import { $L, $Z } from "./symbols.js"


// SET-LIKE (maybe a set tho)
let ListModel = Model({
  _item_model: null,
  _length: 0,
  _items: [],
  // CRUD ---
  add(v){
    let { _item_model, _items } = this
    if(v instanceof _item_model || item_model == null){
      this._items.add(v)
      // TODO: attach .$each listener
      this.$invalidate('_items')
    } else {
      console.log("INVALID ADD TO LIST")
    }
  },
  set(v,i){
    
  },
  get(i){

  },
  delete(v){
    this._items.delete(v)
    this.$invalidate('_items')
  },

  // aggregate
  get items(){
    
  },
  get length(){

  },
})


function List(item_model){
  // force constructor
  if(!new.target){ return new List(item_model) }

  this[$L] = new ListModel({
    _item_model: item_model
  })
}

List.prototype.$ = function(cb,watchlist){
  if(typeof cb == 'function'){
    return this[$Z].add_sub(cb,watchlist)
  } else if(typeof cb == 'string'){
    return this[$Z].add_link(cb,watchlist)
  }
}

List.prototype.$each = function(cb){
  this[$L].each_subs.add(cb)
}

// Return a new list that's auto-mapped by the cb
// Doesn't have to be same shape as OG list
List.prototype.$map = function(cb){
  let new_list = new List()
  function wrapped_cb(input,i){
    let output = cb(input)
    if(output != new_list[i]){
      new_list.set(output,i)
    }
  }
  this.forEach(item => {
    new_list.add(cb(item))
  });
  this.$each(wrapped_cb)
  return new_list
}

// Return a new list that's auto-filtered by the cb
// Must have same shape as og list
List.prototype.$filter = function(cb){
  let new_list = new List(this[$L]._item_model)
}

List.prototype.toString = function(){
  return 'list toString'
}

List.prototype[Symbol.toPrimitive] = function(){
  return 'list toPrimitive'
}

List.prototype[Symbol.toStringTag] = function(){
  return 'list toStringTag'
}

Object.defineProperty(List,Symbol.hasInstance,{
  value(o){
    return (o && o instanceof ListModel)
  }
})

export { List }