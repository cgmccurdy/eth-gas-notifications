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
  const alertThreshold = -30
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

  const averageRaw = sum / gasPrices.length;
  const average = averageRaw.toFixed(2)
  Logger.log('7 day average: '+average+' gwei')

  var url = 'https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey='+etherscanKey

  var response = UrlFetchApp.fetch(url, {
    muteHttpExceptions: true
  });

  var json = JSON.parse(response.getContentText());
  const feeRaw = parseFloat(json['result']['suggestBaseFee'])
  const fee = feeRaw.toFixed(2)


  Logger.log('Current fee: '+fee+' gwei')

  const differenceRaw = (fee - average) / average * 100
  const difference = differenceRaw.toFixed(2)

  Logger.log('Fee '+difference+'% from past 7 days')

  if(differenceRaw < alertThreshold) {

    var scriptProperties = PropertiesService.getScriptProperties();
    var lastAlert = scriptProperties.getProperties()['lastAlert']
    var d = new Date();
    var timeStamp = d.getTime();
    var timeSince = timeStamp - lastAlert

    var lastDifference = scriptProperties.getProperties()['lastDifference']

    var msLimit = notificationLimit * 3600000

    if(timeSince > msLimit || difference < lastDifference) {

    var url = 'https://api.etherscan.io/api?module=stats&action=ethprice&apikey='+etherscanKey

    var response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true
    });

    var json = JSON.parse(response.getContentText());
    var price = json['result']['ethusd']

    Logger.log('Current price: '+price)

    const estimatedRaw = fee / 1000000000 * price * transactionGas
    const estimated = estimatedRaw.toFixed(2)
    const emailContent = 'Estimation for '+transactionType+': $'+estimated

    Logger.log(emailContent)

    const subjectLine = "ETH gas fee currently "+difference+'%'

    GmailApp.sendEmail(emailAddress, subjectLine, emailContent);
    Logger.log("Email sent")
    scriptProperties.setProperty('lastAlert', timeStamp);
    scriptProperties.setProperty('lastDifference', difference);

    }

  }

}
