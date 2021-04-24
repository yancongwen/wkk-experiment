const fs = require('fs')
const path = require('path')
const xlsx = require('node-xlsx').default
const axios = require('axios').default
const gcj2wgs = require('./geo').default

const BMapUrl = 'https://api.map.baidu.com/geocoding/v3/?ret_coordtype=gcj02ll&output=json&ak=onhKngynIyhmOVpNqTFU6Thl4R6YNj7Z&address='
const result = []

// Parse a file
const workSheetsFromFile = xlsx.parse(`${__dirname}/test.xlsx`)
const data = workSheetsFromFile[0].data

// excel 数据转换
function convertData() {
    const list = data.map(item => {
        return {
            name: item[0],
            historyPlace: item[1],
            place: item[2],
            index: item[4]
        }
    })

    // 分类
    let temp = {
        name: list[0].name,
        list: []
    }
    list.forEach(item => {
        if (item.name === temp.name) {
            temp.list.push(item)
        } else {
            temp.list.sort((a, b) => {
                return a.index > b.index
            })
            result.push(temp)
            temp = {
                name: item.name,
                list: [item]
            }
        }
        delete item.name
    })
    // 处理最后一个数据
    temp.list.sort((a, b) => {
        return a.index > b.index
    })
    result.push(temp)
}

// 位置解析
function geoCoding() {
    var requests = []
    result.forEach(person => {
        person.list.forEach(item => {
            requests.push(function() {
                return requestGeoCode(item.place).then(lnglat => {
                    item.lnglat = lnglat
                })
            })
        })
    })
    return multiRequest(requests, 5)
}

// 请求位置解析
function requestGeoCode(address) {
    return axios.get(BMapUrl + encodeURI(address))
        .then(function(response) {
            var result = response.data
            if (result.status === 0 && result.result) {
                var location = gcj2wgs(result.result.location)
                return [location.lng, location.lat]
            } else {
                throw Error('解析失败')
            }
        }).catch(function(e) {
            console.log(e)
        })
}

// 并发请求，类似 Promise.all，能够控制并发量
function multiRequest(requests, maxNum) {
    const n = requests.length
    const result = new Array(n).fill(false)
    let index = 0
    let success = 0

    return new Promise((resolve, reject) => {
        // 开始第一轮请求
        while (index < maxNum) {
            next()
        }

        function next() {
            let current = index
            if (success === n) {
                resolve(result)
                return
            }
            if (current < n) {
                // console.log(`开始 ${current + 1}`)
                requests[current]().then(res => {
                    console.log(`完成 ${current + 1} | n`)
                    result[current] = res
                    success++
                    next()
                }).catch(e => {
                    // console.log(`完成 ${current}`)
                    result[current] = res
                    success++
                    next()
                })
                index++
            }
        }
    })
}

// 写文件
function exportFile() {
    let file = path.join(__dirname, 'result.json');
    fs.writeFile(file, JSON.stringify(result), function (err) {
        if (err) {
            console.log(err)
        } else {
            console.log('文件创建成功~' + file)
        }
    })
}

convertData()

geoCoding().then(() => {
    exportFile()
})
