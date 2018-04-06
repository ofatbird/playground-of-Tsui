const jsonfile = require('jsonfile')

const data = jsonfile.readFileSync('./gf.json')

const name = Object.keys(data).map(index => data[index].name.replace(/(#[0-9]+|-)/g, ''))

const filtered = name
    .filter((element, index)=> name.indexOf(element) == index)
    .map(element => element.replace(/^\s|\s$/ig, '').toLowerCase())

console.log(filtered)