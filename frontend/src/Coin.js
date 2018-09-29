import React from 'react';
import _ from 'lodash';
import { Icon } from 'antd';
import { Money, Percent } from './misc';
import './css/Coin.css';

export default class Coin extends React.Component {
  state = {
    detailed: false,
  }

  render() {
    const { coin } = this.props;
    const percent = coin.currentPercent();
    const inc = coin.netCost() ? percent > 1 : true; 
    const color = inc ? 'green' : 'red';

    let largeInfo;
    if (coin.netCost()) {
      largeInfo = (
        <div className="large-info vert right">
          <Percent className={`large ${color}`} value={percent}/>
          <Money className={color}
            value={coin.currentValue() - coin.netCost()}
          />
        </div>
      );
    } else {
      largeInfo = (
        <div className="large-info vert right">
          <Money className={`large ${color}`} value={coin.currentValue()}/>
        </div>
      );
    }

    return (
      <div className={`coin vert small ` + (inc ? 'inc' : 'dec')}>
        <div className="coin-summary horz">
          <div className="name-amount vert">
            <span className={`name ${color}`}>{coin.name()}</span>
            <span className="amount">{coin.amount.toFixed(2)}</span>
          </div>
          {largeInfo}
          <div className="vert">
            <Money className={color} value={coin.currentValue()}/>
            <Money value={coin.netCost()}/>
            <Money className={color}value={coin.currentPrice()}/>
            <Money value={coin.costPrice()}/>
          </div>
          <div onClick={this.toggleDetailed}>
            {this.state.detailed
                ? <Icon className="expand-icon" type="down-square"/>
                : <Icon className="expand-icon" type="left-square"/>
            }
          </div>
        </div>
        {this.state.detailed && this.renderDetail()}
      </div>
    );
  }

  renderDetail = () => {
    const { coin } = this.props;
    const netReturn = coin.gain - coin.cost;
    const roi = coin.cost ? netReturn / coin.cost : 0;
    return (
      <div className="coin-detail vert">
        <div className="history-info vert">
          <Money value={coin.cost}/>
          <Money value={coin.gain}/>
          <Money value={coin.gain - coin.cost}/>
          <Percent value={roi}/>
        </div>
        {this.renderPricedAmounts()}
      </div>
    );
  }

  renderPricedAmounts = () => {
    const { coin } = this.props;
    const txs = coin.txs;

    const priceToTx = {};

    for (const tx of txs) {
      if (tx.isBuy()) {
        const price = tx.src.amount / tx.dst.amount;
        const priceStr = price.toFixed(2);
        if (!(priceStr in priceToTx)) {
          priceToTx[priceStr] = {
            amount: 0,
            price: price,
          };
        }
        priceToTx[priceStr].amount += tx.dst.amount;
      }
    }

    const pricedAmounts = Object.values(priceToTx);
    pricedAmounts.sort((a, b) => {
      return a.price - b.price;
    });

    let selledAmount = _.sum(
      txs.filter(tx => tx.isSell()).map(tx => tx.src.amount)
    );
    for (const pa of pricedAmounts) {
      const diff = Math.min(pa.amount, selledAmount);
      pa.amount -= diff;
      selledAmount -= diff;
      if (selledAmount <= 0) {
        break;
      }
    }

    return pricedAmounts.map(pa => {
      const inc = pa.price <= coin.price;
      const color = inc ? 'green' : 'red';
      const percent = coin.price / pa.price;
      const diff = (coin.price - pa.price) * pa.amount;
      return (
        <div key={pa.price} className={`` + (inc ? 'inc' : 'dec')}>
          <Percent className={color} value={percent}/>
          <Money className={color} value={diff}/>
          <Money className={color} value={pa.price}/>
          <Money value={pa.amount}/>
        </div>
      );
    });
  }

  toggleDetailed = () => {
    this.setState({
      detailed: !this.state.detailed,
    });
  }
}
