
const api = require('@jscad/csg/api')
// api workaround for now you would use
// const {measureBounds} = require('@jscad/csg/api').measurements

const getBounds = shape => {
  let bounds
  // we have vtree api if true
  if (api.measurements) {
    // console.log('using api for measurebounds')
    bounds = api.measurements.measureBounds(shape)
  } else {
    bounds = shape.getBounds()
  }

  const min = [bounds[0]._x, bounds[0]._y, bounds[0]._z]
  const max = [bounds[1]._x, bounds[1]._y, bounds[1]._z]
  console.log('sdfsdf', min, max)
  return [
    min,
    max,
    // precomputed
    max.map((x, i) => x - min[i])
  ]
}

module.exports = getBounds
