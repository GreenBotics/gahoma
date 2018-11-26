const { circle, square } = require('@jscad/csg/api').primitives2d
const { hull } = require('@jscad/csg/api').transformations
const { linear_extrude } = require('@jscad/csg/api').extrusions
const { rotate, translate, mirror } = require('@jscad/csg/api').transformations
const { union, difference } = require('@jscad/csg/api').booleanOps
const getBounds = require('./bounds')

const { nut } = require('./nutsAndBearings')

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

module.exports = spokedWheel
