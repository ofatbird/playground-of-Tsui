const request = require('request')
const cheerio = require('cheerio')
const fs = require('fs')

request('http://taohuabt.cc/thread-1814403-1-2.html', (err, res, body) => {
    fs.writeFileSync('index.html', body)
})
// request('http://pic.thzpic.com/forum/201805/01/190705i4kdndmkdgb4x8mb.jpg')
// .pipe(fs.createWriteStream('test.jpg'))