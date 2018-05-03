const request = require('request')
const cheerio = require('cheerio')
const to = require('await-to-js').to
const fs = require('fs')
const fse = require('fs-extra')
const conf = require('./conf.json')
const utf8 = require('utf8')
const base64 = require('base-64')

const baseUri = 'http://taohuabt.cc/'
const types = {
    "censored": 'forum-220',
    "uncensored": 'forum-181'
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
const isEmptyObject = obj => Object.keys(obj).length === 0 && obj.constructor === Object

function fetch(uri) {
    return new Promise((resolve, reject) => {
        request(uri, (error, response, body) => {
            if (error) {
                reject(error)
            } else {
                resolve(body)
            }
        })
    })
}

function update() {
    return new Promise(async (resolve, reject) => {
        let start = 1
        let update = true
        const tmpData = {}
        while (start < 100) {
            console.log(start)
            const [error, html] = await to(fetch(`${baseUri}${types[conf.type]}-${start}.html`))
            if (error) {
                console.log(error)
                continue
            }
            const $ = cheerio.load(html)
            const $new = $('.new')

            $new.find('a.s.xst').each((_, el) => {
                const date = $new.eq(_).next().find('span').eq(1).attr('title')
                const gap = (Date.now() - new Date(date.replace(/\-/g, '/'))) / (24 * 60 * 60 * 1000)
                if (Math.floor(gap) > conf.recent) {
                    update = false
                    return
                }
                const $el = $(el)
                const key = $el.attr('href')
                // if (key.indexOf('thread-213795-1-1') === -1) {
                tmpData[key] = base64.encode(utf8.encode($el.text()))
                // }
            })
            if (!update) {
                break;
            }
            start++
            await sleep(2000)
        }
        resolve(tmpData)
    })
}

function fetchAndGetId(uri) {
    return new Promise(async (resolve, reject) => {
        const [err, html] = await to(fetch(uri))
        if (err) {
            reject(err)
        } else {
            const $ = cheerio.load(html)
            const $a = $('.attnm>a')
            const cover = $('.zoom').eq(0).attr('file')
            resolve({
                id: $a.attr('href').split(',')[1],
                name: $a.text(),
                cover,
            })
        }
    })

}

function decode(str) {
    return utf8.decode(base64.decode(str))
}

// const latestData = jsonfile.readFileSync(`./data/2018-5-3.json`)

async function getTorrent(data) {
    const keys = Object.keys(data)
    for (let i = 0; i < keys.length; i++) {
        const uri = `${baseUri}${keys[i]}`
        const response = await fetchAndGetId(uri)
        try {
            request(`${baseUri}forum.php?mod=attachment&aid=${response.id}`)
                .pipe(fs.createWriteStream(`${conf.dir}/${response.name}`))
            request(response.cover).pipe(fs.createWriteStream(`${conf.dir}/${response.name}.jpg`))
        } catch (err) {
            console.log(err)
        }
        await sleep(1500)
    }
}


// update().then(data => {
//     jsonfile.writeFileSync(`./data/${new Date().toLocaleDateString().replace(/\//g, '-')}.json`, data, {flag: 'a'})
// })

// getTorrent(latestData)


function download() {
    update().then(data => {
        if (isEmptyObject(data)) {
            const day = conf.recent
            console.log(`There is no update in recent ${day > 1 ? day + 'days' : '1 day'}`)
        } else {
            fse.ensureDirSync(conf.dir)
            getTorrent(data)
        }
    })
}

download()