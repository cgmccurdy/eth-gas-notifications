# ETH Gas Fee Email Notifications
Sends email notifications for when ETH gas fees are low.
Uses [Google Apps Script](https://script.google.com/home).

## Setup:

- Obtain free API keys from [Owlracle](https://owlracle.info/docs) and [Etherscan](https://docs.etherscan.io/getting-started/creating-an-account).
- Enter the keys between the quotes at the top of the script.
- Enter your email address for receiving notifactions.
- Run the configuration function once to create the trigger for running the main script every 5 minutes.

## Other configurable variables:

- alertThreshold - How far ETH fees should be below 7 day average for a notifcation to be sent. Default is -30%.
- notificationLimit - How many hours must pass to receive another notification (unless the fee has gone lower than the previous notification).
- transactionType - The action for which you would like to receive the USD estimation of fees.
- transactionGas - Used to calculate the fees for the above action. A swap on Uniswap takes 184523 gas.

> [!NOTE]
> As stated above, only one notifaction will be sent every 24 hours - unless the fee has gone lower than the previous notification.
