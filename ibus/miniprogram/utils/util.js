const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function logError(str) {
  wx.showToast({
    title: str,
    icon: 'loading',
    duration: 2000//持续的时间
  })
  return;
}

function minuteToHour(minute){
  let timeStr = "0小时0分钟"
  let h = Math.floor(minute / 60);
  let m = minute % 60;
  if (h>0){
    timeStr = h + "小时" + m + "分钟";
  }else{
    timeStr = m + "分钟";
  }
  return timeStr;
}

function formatDistance(d) {
  let distanceStr = "0米";
  let km = Math.floor(d / 1000);
  let m = d % 1000;
  if (km > 0) {
    distanceStr = (d / 1000).toFixed(2) + "千米";
  } else {
    distanceStr = m + "米";
  }
  return distanceStr;
}

module.exports = {
  formatTime: formatTime,
  logError: logError,
  minuteToHour: minuteToHour,
  formatDistance: formatDistance,
}
