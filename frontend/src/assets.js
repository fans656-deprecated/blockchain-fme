export class Transaction {
  constructor(ctime, src, dst, comment, id) {
    this.ctime = ctime;
    this.src = src;
    this.dst = dst;
    this.comment = comment || '';
    this.id = id;
  }

  isBuy = () => {
    return this.type() === 'buy';
  }

  isSell = () => {
    return this.type() === 'sell';
  }

  isExchange = () => {
    return this.type() === 'exchange';
  }

  type = () => {
    const isFiatSrc = FIAT_UNITS[this.src.unit] != null;
    const isFiatDst = FIAT_UNITS[this.dst.unit] != null;
    if (isFiatSrc && !isFiatDst) {
      return 'buy';
    } else if (!isFiatSrc && isFiatDst) {
      return 'sell';
    } else {
      return 'exchange';
    }
  }

  asStr = () => {
    const srcAmount = this.src.amount;
    const srcUnit = this.src.unit.toUpperCase();
    const dstAmount = this.dst.amount;
    const dstUnit = this.dst.unit.toUpperCase();

    const srcStr = `${srcAmount} ${srcUnit}`;
    const dstStr = `${dstAmount} ${dstUnit}`;
    let left, right;
    if (this.isSell()) {
      left = dstStr;
      right = srcStr;
    } else {
      left = srcStr;
      right = dstStr;
    }
    const op = this.type() === 'sell' ? '<=' : '=>';

    return `${this.ctime}   ${left} ${op} ${right}   ${this.comment}`;
  }
}

class Crypto {
  constructor(unit) {
    this.unit = unit;
    this.amount = 0;
    this.cost = 0;
    this.gain = 0;
    this.txs = [];

    this.price = 0;
  }

  name = () => {
    return this.unit.toUpperCase();
  }

  currentPrice = () => {
    return this.price;
  }

  currentValue = () => {
    return this.amount * this.price;
  }

  currentPercent = () => {
    const price = this.price;
    const costPrice = this.costPrice();
    if (price && costPrice) {
      return price / costPrice;
    } else {
      return 0;
    }
  }

  netCost = () => {
    return Math.max(this.cost - this.gain, 0);
  }

  costPrice = () => {
    const netCost = this.netCost();
    return netCost > 0 ? netCost / this.amount : 0;
  }

  updatePrice = (price) => {
    this.price = price.prices[BASE_UNIT];
  }
}

class Fiat {
  constructor(unit) {
    this.unit = unit;
    this.cost = 0;
    this.gain = 0;
    this.txs = [];
  }
}

export class Assets {
  constructor() {
    this.assets = {};
    this.clearSummaries();
  }

  clearSummaries = () => {
    this.currentValue = 0;
    this.cost = 0;
    this.gain = 0;
    this.netCost = 0;
    this.roi = 0;
    this.percent = 0;
  }

  coins = () => {
    const coins = [];
    for (const unit in this.assets) {
      const asset = this.assets[unit];
      if (!FIAT_UNITS[unit]) {
        coins.push(asset);
      }
    }
    coins.sort((a, b) => {
      if (b.amount === 0) {
        return -1;
      }
      return a.unit < b.unit ? -1 : 1;
    });
    return coins;
  }

  addTx = (tx) => {
    const src = this.getAsset(tx.src.unit);
    const dst = this.getAsset(tx.dst.unit);
    const srcAmount = tx.src.amount;
    const dstAmount = tx.dst.amount;
    if (tx.isBuy()) {
      src.cost += srcAmount;
      dst.cost += convertFiat(tx.ctime, tx.src.amount, tx.src.unit);
      dst.amount += dstAmount;
    } else if (tx.isSell()) {
      src.amount -= srcAmount;
      src.gain += convertFiat(tx.ctime, tx.dst.amount, tx.dst.unit);
      dst.gain += dstAmount;
    } else if (tx.isExchange()) {
      const cost = src.costPrice() * srcAmount;
      src.amount -= srcAmount;
      src.cost -= cost;
      dst.amount += dstAmount;
      dst.cost += cost;
    }
    src.txs.push(tx);
    dst.txs.push(tx);
  }

  summarize = () => {
    this.clearSummaries();
    const coins = this.coins();
    for (const coin of coins) {
      this.cost += coin.cost;
      this.gain += coin.gain;
    }
    this.netCost = Math.max(this.cost - this.gain, 0);
    this.netGain = this.gain - this.cost;
    this.roi = this.netGain / this.cost;
  }

  updatePrices = (prices) => {
    this.summarize();

    const coins = this.coins();
    for (const coin of coins) {
      const price = prices[coin.unit];
      if (price) {
        coin.updatePrice(price);
      }
      this.currentValue += coin.currentValue();
    }
    this.percent = this.netCost ? this.currentValue / this.netCost : 0;
  }

  getAsset = (unit) => {
    if (!(unit in this.assets)) {
      this.assets[unit] = unit in FIAT_UNITS
        ? new Fiat(unit)
        : new Crypto(unit);
    }
    return this.assets[unit];
  }
}

function convertFiat(ctime, amount, unit, base_unit) {
  if (!base_unit) {
    base_unit = BASE_UNIT;
  }
  if (unit === base_unit) {
    return amount;
  } else {
    return base_unit === 'cny' ? amount * 7 : amount / 7;
  }
}

const FIAT_UNITS = {
  'cny': true,
  'usd': true,
};

const BASE_UNIT = 'cny';
