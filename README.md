polcrawl
========

Node.js application that crawls vinmonopolet.no and fetches prices. Prices are stored in a MongoDB.

To install:
npm install

To run:
node app.js

You also need to add a Mongo database called pol on localhost. The collection is also called pol:
use pol
db.pol.find().pretty()

Stian Conradsen, 02.09.13
