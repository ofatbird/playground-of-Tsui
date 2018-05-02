const request = require('request')
const cheerio = require('cheerio')
const to = require('await-to-js').to
const jsonfile = require('jsonfile')
const fs = require('fs')

const baseUri = 'http://taohuabt.cc/'

const utf8 = require('utf8')
const base64 = require('base-64')

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

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
            const [error, html] = await to(fetch(`${baseUri}forum-220-${start}.html`))
            if (error) {
                console.log(error)
                continue
            }
            const $ = cheerio.load(html)
            const $new = $('.new')

            $new.find('a.s.xst').each((_, el) => {
                const date = $new.eq(_).next().find('span').eq(1).attr('title')
                const gap = (Date.now() - new Date(date.replace(/\-/g, '/'))) / (24 * 60 * 60 * 1000)
                if (Math.floor(gap) > 1) {
                    update = false
                    return
                }
                const $el = $(el)
                const key = $el.attr('href')
                if (key.indexOf('thread-213795-1-1') === -1) {
                    tmpData[key] = base64.encode(utf8.encode($el.text()))
                }
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

// update().then(data => {
//     jsonfile.writeFileSync('./data/update.json', data, {flag: 'a'})
// })
// request('http://taohuabt.cc/thread-977162-1-1.html', (err, res, body) => {
//     if (err) {
//         console.log(err)
//     } else {
//         fs.writeFileSync('index.html', body)
//     }
// })

function decode(str) {
    return utf8.decode(base64.decode(str))
}
const latestData = jsonfile.readFileSync('./data/update.json')
// Object.keys(latestData).forEach(key => {
//     console.log(latestData[key])
// })

async function getTorrent(data) {
    const keys = Object.keys(data)
    for (let i = 0; i < keys.length; i++) {
        const uri = `${baseUri}${keys[i]}`
        const response = await fetchAndGetId(uri)
        try {
            request(`${baseUri}forum.php?mod=attachment&aid=${response.id}`)
                .pipe(fs.createWriteStream(`./data/resource/${response.name}`))
            request(response.cover).pipe(fs.createWriteStream(`./data/resource/${response.name}.jpg`))
        } catch (err) {
            console.log(err)
        }

        await sleep(12000)

    }
}

getTorrent(latestData)