const { cylinder } = require('@jscad/csg/api').primitives3d

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

module.exports = { nut, bearing, bearingThickness }
