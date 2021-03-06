//定义一些常量
var PI = Math.PI
var x_PI = (PI * 3000.0) / 180.0
var a = 6378245.0
var ee = 0.00669342162296594323

function gcj2wgs(location) {
    var lng = location.lng
    var lat = location.lat
    if (out_of_china(lng, lat)) {
        return [lng, lat]
    } else {
        var dlat = transformlat(lng - 105.0, lat - 35.0)
        var dlng = transformlng(lng - 105.0, lat - 35.0)
        var radlat = (lat / 180.0) * PI
        var magic = Math.sin(radlat)
        magic = 1 - ee * magic * magic
        var sqrtmagic = Math.sqrt(magic)
        dlat = (dlat * 180.0) / (((a * (1 - ee)) / (magic * sqrtmagic)) * PI)
        dlng = (dlng * 180.0) / ((a / sqrtmagic) * Math.cos(radlat) * PI)
        var mglat = lat + dlat
        var mglng = lng + dlng
        location.lng = lng * 2 - mglng
        location.lat = lat * 2 - mglat
        return location
    }
}

function transformlat(lng, lat) {
    var ret =
        -100.0 +
        2.0 * lng +
        3.0 * lat +
        0.2 * lat * lat +
        0.1 * lng * lat +
        0.2 * Math.sqrt(Math.abs(lng))
    ret +=
        ((20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) *
        2.0) /
        3.0
    ret +=
        ((20.0 * Math.sin(lat * PI) + 40.0 * Math.sin((lat / 3.0) * PI)) * 2.0) /
        3.0
    ret +=
        ((160.0 * Math.sin((lat / 12.0) * PI) + 320 * Math.sin((lat * PI) / 30.0)) *
        2.0) /
        3.0
    return ret
}

function transformlng(lng, lat) {
    var ret =
        300.0 +
        lng +
        2.0 * lat +
        0.1 * lng * lng +
        0.1 * lng * lat +
        0.1 * Math.sqrt(Math.abs(lng))
    ret +=
        ((20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) *
        2.0) /
        3.0
    ret +=
        ((20.0 * Math.sin(lng * PI) + 40.0 * Math.sin((lng / 3.0) * PI)) * 2.0) /
        3.0
    ret +=
        ((150.0 * Math.sin((lng / 12.0) * PI) +
        300.0 * Math.sin((lng / 30.0) * PI)) *
        2.0) /
        3.0
    return ret
}

function out_of_china(lng, lat) {
    return (
        lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271 || false
    )
}
