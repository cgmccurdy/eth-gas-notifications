function configuration() {
  var Triggers = ScriptApp.getProjectTriggers();
    if (Triggers.length < 1) {
      Logger.log('Creating new trigger.')
      ScriptApp.newTrigger('ethGas')
        .timeBased()
        .everyMinutes(5)
        .create()
      }
}

function ethGas() {

  const emailAddress = ""
  const owlracleKey = ""
  const etherscanKey = ""
  const alertThreshold = -25
  const notificationLimit = 24
  const transactionType = "Uniswap"
  const transactionGas = 184523

  var url = 'https://api.owlracle.info/v4/eth/history?apikey='+owlracleKey+'&candles=1000&timeframe=10m'

  var response = UrlFetchApp.fetch(url, {
    muteHttpExceptions: true
  });

  var json = JSON.parse(response.getContentText());

  var gasPrices = []

  for(var i=0; i<1000; i++){

    var gasPrice = json['candles'][i]['gasPrice']['open']

    gasPrices.push(gasPrice)

  }

  let sum = 0;
  for(let i = 0; i < gasPrices.length; i++) {
    sum += gasPrices[i];
  }

  var averageRaw = sum / gasPrices.length;
  var average = averageRaw.toFixed(2)
  Logger.log('7 day average: '+average+' gwei')

  var url = 'https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey='+etherscanKey

  var response = UrlFetchApp.fetch(url, {
    muteHttpExceptions: true
  });

  var json = JSON.parse(response.getContentText());
  var feeRaw = parseFloat(json['result']['suggestBaseFee'])
  var fee = feeRaw.toFixed(2)

  Logger.log('Current fee: '+fee+' gwei')

  var differenceRaw = (fee - average) / average * 100
  var difference = differenceRaw.toFixed(2)

  Logger.log('Fee '+difference+'% from past 7 days')

  if(difference < alertThreshold) {

    var scriptProperties = PropertiesService.getScriptProperties();
    var lastAlert = scriptProperties.getProperties()['lastAlert']
    var d = new Date();
    var timeStamp = d.getTime();
    var timeSince = timeStamp - lastAlert

    var lastDifference = parseFloat(scriptProperties.getProperties()['lastDifference'])

    var msLimit = notificationLimit * 3600000

    if(timeSince > msLimit || difference < lastDifference) {

    var url = 'https://api.etherscan.io/api?module=stats&action=ethprice&apikey='+etherscanKey

    var response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true
    });

    var json = JSON.parse(response.getContentText());
    var price = json['result']['ethusd']

    Logger.log('Current price: '+price)

    var estimatedRaw = fee / 1000000000 * price * transactionGas
    var estimated = estimatedRaw.toFixed(2)
    var emailContent = 'Current fee: '+fee+' gwei\nEstimation for '+transactionType+': $'+estimated

    Logger.log(emailContent)

    var subjectLine = "ETH gas fee currently "+difference+'%'

    GmailApp.sendEmail(emailAddress, subjectLine, emailContent);
    Logger.log("Email sent")
    scriptProperties.setProperty('lastAlert', timeStamp);
    scriptProperties.setProperty('lastDifference', difference);

    }

    else {

    if (timeSince < msLimit) {
      Logger.log("Not enough time has passed since last notification. "+timeSince+" since last notification and limit is "+msLimit+".")

    }

    if (difference >= lastDifference) {
      Logger.log("Last notifcation had lower fees. "+lastDifference+" in the last notification and "+difference+" currently.")

    }
    }

  }

  else {
    Logger.log("Fee above alert threshold.")
  }

}
