const csv = require('csvtojson')
const fs = require('fs')
const path = require('path')
 
const converter = csv()
converter.fromFile('./data/testdata.csv')
    .then(list => {
        let result = list.map(item => {
            return {
                name: item.name,
                value: [+item['1dx'], +item['2dx']],
            }
        })
        exportFile(result)
    })

// 写文件
function exportFile(data) {
    let file = path.join(__dirname, 'data.json');
    fs.writeFile(file, JSON.stringify(data), function (err) {
        if (err) {
            console.log(err)
        } else {
            console.log('文件创建成功~' + file)
        }
    })
}
