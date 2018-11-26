const mount = require('./mount')
const spokedWheel = require('./wheel')

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
