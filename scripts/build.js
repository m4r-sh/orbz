build()

async function build(){
  let res
  res = await Bun.build({
    entrypoints: ['./src/index.js'],
    outdir: './dist',
    target: 'browser',
    minify: false,
    naming: '[dir]/[name].[ext]'
  })
  if(!res.success) console.log(res)
  res = await Bun.build({
    entrypoints: ['./src/index.js'],
    outdir: './dist',
    target: 'browser',
    minify: true,
    naming: '[dir]/[name].min.[ext]'
  })
  if(!res.success) console.log(res)
  res = await Bun.build({
    entrypoints: ['./src/index.js'],
    outdir: './dist/bun',
    target: 'bun',
    naming: '[dir]/[name].[ext]'
  })
  if(!res.success) console.log(res)
  res = await Bun.build({
    entrypoints: ['./src/index.js'],
    outdir: './dist/node',
    target: 'node',
    naming: '[dir]/[name].[ext]'
  })
  if(!res.success) console.log(res)
}