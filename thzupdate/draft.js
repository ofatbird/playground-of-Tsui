const request = require('request')
const fs = require('fs')

request('http://taohuabt.cc/', (err, res, body) => {
    fs.writeFileSync('index.html', body)
})