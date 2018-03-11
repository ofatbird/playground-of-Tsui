const jsonfile = require('jsonfile')
const magnet = require('magnet-uri')

const data = jsonfile.readFileSync('./json/gf-magnet.json')
const name = jsonfile.readFileSync()

// console.log(data)
const searchKey = `Lesbian House Hunters #14`.replace('#', '').toLowerCase()
Object.keys(data).forEach(prop => {
    const item = data[prop]
    const title = item.title.replace(/\./g, " ").toLowerCase()
    if (title.indexOf(searchKey) > -1) {
        console.log(magnet.encode({
            xt: `urn:btih:${item.mag.split('/').reverse()[0]}`,
            dn: item.title
        }))
    }
})