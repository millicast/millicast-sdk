import * as publisher from './publisher'
import * as subscriber from './subscriber'

document.getElementById('subscribe').addEventListener('click', subscriber.start)
document.getElementById('publish').addEventListener('click', publisher.start)
