This is a very simple pricefeed for testing margin mechanics on testnet.

Modify testnet.yml with your producer/account name and replace HFPEGTEST with the name of your MPA

The feed is formula based. Currently a time-based sine wave oscillating between 0.9 and 1.1 TEST.

You can change /sources/Testnet.js to add your own formula.

Best way to run (tested under node v8 LTS)

```
git clone https://github.com/clockworkgr/bitshares-pricefeed-js
cd bitshares-pricefeed-js
npm install
node index.js -c testnet.yml -k <producer_private_key_in_wif> -d3 -s wss://node.testnet.bitshares.eu --gcd  --broadcast
```