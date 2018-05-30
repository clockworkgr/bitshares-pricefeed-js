# bitshares-pricefeed-js

A BitShares pricefeed script in JS ported from @xeroc's bitshares-pricefeed (https://github.com/xeroc/bitshares-pricefeed/)

* Version: 0.1 Released! *

Things that work:

Extern Price Feeds based on the feedsources in ./sources.

Things that don't work:

Everything else. :D

Still a work in progress and under heavy testing. Please report bugs/open issues etc.

Best way to run (tested under node v8 LTS)

```
git clone https://github.com/clockworkgr/bitshares-pricefeed-js
cd bitshares-pricefeed-js
npm install
node index.js -c <path to config yaml> -k <producer_private_key_in_wif> -d <debug_level> -s <api_node_uri> --gcd  --broadcast 
```

Switches:

``-c /path/to/config.yml``

The yaml config file is the exact same format as the one used by xeroc's bitshares-pricefeed (https://github.com/xeroc/bitshares-pricefeed/).

``-k 5Kb8kLf9zgWQnogidDA76Mz_SAMPLE_PRIVATE_KEY_DO_NOT_IMPORT_PL6TsZZY36hWXMssSzNydYXYB9KF``

Self-explanatory

``-d 3``

Debug level can be 0-3  
  0: Minimum - Explicit logging & Errors  
  1: Info - 0 + Basic logging  
  2: Verbose - 1 + Verbose logging  
  3: Transient - 2 + Transient messages  

Recommend 3 at first to be able to see what's going on

``-s wss://bts-seoul.clockwork.gr``

Use whatever API node you prefer

``--gcd ``

An optimisation to @xeroc's original script. Uses a GCD method to optimise the final pricefeed. Default (without --gcd flag) uses xeroc's logic.

``--broadcast``

Set this flag in order to publish the actual pricefeed.
