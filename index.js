
const { circle, square } = require('@jscad/csg/api').primitives2d
const { cylinder } = require('@jscad/csg/api').primitives3d
const { color } = require('@jscad/csg/api').color
const { hull } = require('@jscad/csg/api').transformations
const { linear_extrude } = require('@jscad/csg/api').extrusions
const { rotate, translate, mirror } = require('@jscad/csg/api').transformations
const { union, difference } = require('@jscad/csg/api').booleanOps
const getBounds = require('./bounds')

/* const {flatten} = require('../arrays')
const align = require('../utils/align')
const distribute = require('../utils/distribute')
const center = require('../utils/center')
const extractCenterPosition = require('../utils/extractCenterPosition') */

const paramDefaults = {
  every: 100, // frequency of holes, in mm
  clearance: 0.2,
  axisDia: 8,

  //
  wheelThickness: 8,
  wheelHubOd: 30,
  spikeSize: [15, 30],
  spokeBorderThickness: 10,
  spokeWidth: 3,
  spokeCount: 10
}

const getParameterDefinitions = () => {
  return [
    { name: 'every', type: 'float', initial: paramDefaults.every, caption: 'frequency of holes', min: 0.2, max: 3000 },
    { name: 'clearance', type: 'float', initial: paramDefaults.clearance, caption: 'clearance (for 3d printing)', min: 0, max: 1 },

    { name: 'axisDia', type: 'float', initial: paramDefaults.axisDia, caption: 'axis diameter', min: 1, max: 200 },

    // spoked wheel specifics
    // spike's data
    { name: 'spikeWidth', type: 'float', initial: paramDefaults.spikeSize[0], caption: 'spike width', min: 1, max: 200 },
    { name: 'spikeLength', type: 'float', initial: paramDefaults.spikeSize[1], caption: 'spike height', min: 1, max: 200 },

    // mount specifics

    { name: 'showRodMount', type: 'checkbox', checked: false, caption: 'Show rod mount:' },
    { name: 'showSpokedWheel', type: 'checkbox', checked: true, caption: 'Show spoked wheel:' }
  ]
}

// M8 nut dims

const bearingDia = 22
const bearingThickness = 7

const nut = ({ diameter }) => {
  const clearance = 0.4
  const nutDia = diameter * 1.8
  const nutThickness = 0.8 * diameter
  return cylinder({ d: nutDia + clearance, fn: 6, h: nutThickness })
}
const bearing = (params) => {
  const clearance = 0.4
  return cylinder({ d: bearingDia + clearance, fn: 64, h: bearingThickness })
}

const spokedWheel = (params) => {
  const {
    diameter,
    wheelThickness,
    wheelHubOd,
    axisDia,
    spikeLength,
    spikeWidth,
    spokeWidth,
    spokeCount,
    spokeBorderThickness
  } = params

  const hubId = axisDia
  const hubOd = wheelHubOd

  // wheel
  const hubCenterShape = union(
    difference(
      circle({ r: hubOd / 2, center: true }),
      circle({ r: hubId / 2, center: true })
    )
  )

  const spikeShape = hull(
    circle({ r: 1, center: true }),
    translate([0, -spikeLength], square({ size: [spikeWidth, 0.1], center: true }))
  )

  const spokeOuter = difference(
    union(
      circle({ r: diameter / 2, center: true }),
      translate([0, diameter / 2 + spikeLength / 2], spikeShape),
      mirror([0, 1, 0], translate([0, diameter / 2 + spikeLength / 2], spikeShape))
    ),
    circle({ r: diameter / 2 - spokeBorderThickness / 2, center: true })
  )

  const spokes = union(Array(spokeCount).fill(0)
    .map((x, index) => rotate([0, 0, 360 / spokeCount * index], square({ size: [diameter - 0.5, spokeWidth], center: true })))
  )

  const spokedWheelShape = union(
    spokeOuter,
    hubCenterShape,
    difference(
      spokes,
      circle({ r: hubId / 2, center: true })
    )
  )

  // final result
  const nutCutout = nut({ diameter: axisDia })
  const nutBounds = getBounds(nutCutout)

  return difference(
    linear_extrude({ height: wheelThickness }, spokedWheelShape),
    translate([0, 0, nutBounds[2][2] / 2], nutCutout)
  )
}

const mount = (params) => {
  const { axisDia, clearance } = params
  // mount
  const wallsThickness = 4
  const handleDia = 25
  const axisHolderOd = handleDia + wallsThickness * 2
  const handleCapLength = 12 // size of cap at bottom
  const handleHolderLength = 50
  const handleHolderOd = handleDia + wallsThickness * 2
  const axisHolderLength = Math.max(30, axisHolderOd)
  const handleHolderHoleDia = 4
  const handleHolderHoleOffset = handleHolderLength / 2 + handleCapLength

  // handleHolderLength/2 + handleCap

  const outer = union(
    translate([0, 0, handleHolderLength / 2],
      rotate([0, 0, 45], cylinder({ d: handleHolderOd, h: handleHolderLength, center: true, fn: 12 }))
    ),
    rotate([0, 90, 0],
      rotate([0, 0, 45], cylinder({ d: axisHolderOd, h: axisHolderLength, center: true, fn: 12 }))
    )
  )
  const inner = union(
    translate([0, 0, handleHolderLength / 2 + handleCapLength], cylinder({ d: handleDia, h: handleHolderLength, center: true, fn: 14 })),
    // threaded rod/axis hole
    rotate([0, 90, 0],
      cylinder({ d: axisDia + clearance * 2, h: axisHolderLength, center: true, fn: 64 })
    ),
    // bearing holes
    translate([axisHolderLength / 2 - bearingThickness, 0, 0], rotate([0, 90, 0], bearing())),
    translate([-axisHolderLength / 2 + bearingThickness, 0, 0], rotate([0, 90, 0], mirror([0, 0, 1], bearing())))
  )
  return difference(
    outer,
    inner,
    // mount hole
    translate([0, 0, handleHolderHoleOffset],
      rotate([0, 90, 0], cylinder({ d: handleHolderHoleDia, h: handleHolderOd, center: true }))

    )
  )
}

const main = (params) => {
  console.log('params', params)
  params = Object.assign({}, paramDefaults, params)
  // perim /2  = every
  // aka (2 * PI * R) /2 = perim
  const diameter = params.every / Math.PI * 2
  console.log('diameter for chosen frequency', diameter)
  params.diameter = diameter

  let results = []
  results = params.showRodMount ? results.concat(mount(params)) : results
  results = params.showSpokedWheel ? results.concat(spokedWheel(params)) : results
  return results
}

// not in use for jscad V1
module.exports = {
  main,
  getParameterDefinitions
}
