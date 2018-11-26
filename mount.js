const { cylinder } = require('@jscad/csg/api').primitives3d
const { rotate, translate, mirror } = require('@jscad/csg/api').transformations
const { union, difference } = require('@jscad/csg/api').booleanOps

const { bearing, bearingThickness } = require('./nutsAndBearings')

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

module.exports = mount
