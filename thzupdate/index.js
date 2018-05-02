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
        const tmpData = {}
        while (start < 100) {
            console.log(start)
            const [error, html] = await to(fetch(`${baseUri}forum-220-${start}.html`))
            if (error) {
                console.log(error)
                continue
            }
            const $ = cheerio.load(html)
            $('a.s.xst').each((_, el) => {
                const $el = $(el)
                const key = $el.attr('href')
                if (key.indexOf('thread-213795-1-1') === -1) {
                    tmpData[key] = base64.encode(utf8.encode($el.text()))
                }
            })
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
            resolve({
                id: $a.attr('href').split(',')[1],
                name: $a.text()
            })
        }
    })

}

// update().then(data => {
//     jsonfile.writeFileSync('./data/feed.json', data, {flag: 'a'})
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
fetchAndGetId(`${baseUri}thread-977162-1-1.html`).then(res => {
    if (!res) {
        console.log('something wrong')
        return false
    }
    try {
        request(`${baseUri}forum.php?mod=attachment&aid=${res.id}`)
            .pipe(fs.createWriteStream(`./data/${res.name}`))
    } catch (err) {
        console.log(err)
    }
})
