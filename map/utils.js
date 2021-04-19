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
                    // console.log(`完成 ${current + 1}`)
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
