import React from 'react';
import {
  Layout, Tabs, Button, List, Form, DatePicker, TimePicker,
  Icon, Select, Input, InputNumber, Radio, Spin,
  message,
} from 'antd';
import moment from 'moment';
import qs from 'qs';
import Cookies from 'js-cookie';
import jwtDecode from 'jwt-decode';
import { Assets, Transaction } from './assets';
import api from './api';
import 'antd/dist/antd.css';
import './index.css';
import './edit.css';
import './assets.css';
import './transactions.css';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      owner: this.getOwner(),
      visitor: this.getVisitor(),

      transactions: [],
      assets: null,
      prices: {},

      refreshing: true,

      editingTxIndex: null,
      editingTx: null,
    };
  }

  componentDidMount = async () => {
    await this.updateAssets();
  }

  render() {
    return (
      <Layout className="App">
        <Tabs className="content"
          defaultActiveKey={this.state.owner}
          onChange={this.onOwnerChange}
        >
          <Tabs.TabPane tab="fans656" key="fans656">
            {this.renderAll('fans656')}
          </Tabs.TabPane>
          <Tabs.TabPane tab="tyn" key="tyn">
            {this.renderAll('tyn')}
          </Tabs.TabPane>
        </Tabs>
        <div className="even bottom-actions">
          <Button className="refresh" type="primary"
            onClick={this.refresh}
            disabled={this.state.refreshing}
          >
            {this.state.refreshing ? <Spin/> : <span>Refresh</span>}
          </Button>
        </div>
      </Layout>
    );
  }

  renderAll(owner) {
    const { transactions, assets } = this.state;
    return (
      <div>
        {this.renderAssets(assets)}
        <br/>
        {this.renderTransactions(transactions)}
      </div>
    );
  }

  renderAssets = (assets) => {
    if (!assets) {
      return null;
    }

    const coins = assets.coins();
    const coinComps = coins.map(this.renderCoin);

    const inc = assets.netCost ? assets.percent > 1 : true;

    return (
      <div className={`assets ` + (this.state.pricesLoaded ? 'loaded' : '')}>
        <div className={`summary horz even ` + (inc ? 'inc' : 'dec')}>
          <div className="vert">
            <div>
              <span className="label">Asset:</span>
              <span className="colored">
                <Money value={assets.currentValue}/>
              </span>
            </div>
            <div>
              <span className="label">Cost:</span>
              <Money value={assets.netCost}/>
            </div>
            <div>
              <span className="label">Diff:</span>
              <Money className="colored"
                value={assets.currentValue - assets.netCost}
              />
            </div>
            <div>
              <span className="label">Percent:</span>
              <Percent className="colored" value={assets.percent}/>
            </div>
          </div>
          <div className="vert">
            <div>
              <span className="label">Invest:</span>
              <Money value={assets.cost}/>
            </div>
            <div>
              <span className="label">Return:</span>
              <Money value={assets.gain}/>
            </div>
            <div>
              <span className="label">Diff:</span>
              <Money value={assets.gain - assets.cost}/>
            </div>
            <div>
              <span className="label">ROI:</span>
              <Percent value={assets.roi}/>
            </div>
          </div>
        </div>
        {coinComps}
      </div>
    );
  }

  renderCoin = (coin) => {
    const percent = coin.currentPercent();
    const inc = coin.netCost() ? percent > 1 : true; 

    const netReturn = coin.gain - coin.cost;
    const roi = coin.cost ? netReturn / coin.cost : 0;

    let largeInfo;
    if (coin.netCost()) {
      largeInfo = (
        <div className="large-info vert right">
          <Percent className="large colored" value={percent}/>
          <Money className="colored"
            value={coin.currentValue() - coin.netCost()}
          />
        </div>
      );
    } else {
      largeInfo = (
        <div className="large-info vert right">
          <Money className="large colored" value={coin.currentValue()}/>
        </div>
      );
    }

    return (
      <div key={coin.name()}
        className={`coin horz small ` + (inc ? 'inc' : 'dec')}
      >
        <div className="name-amount vert">
          <span className="name colored">{coin.name()}</span>
          <span className="amount">{coin.amount.toFixed(2)}</span>
        </div>
        {largeInfo}
        <div className="vert">
          <Money className="colored" value={coin.currentValue()}/>
          <Money value={coin.netCost()}/>
          <Money className="colored" value={coin.currentPrice()}/>
          <Money value={coin.costPrice()}/>
        </div>
        <div className="history-info vert">
          <Money value={coin.cost}/>
          <Money value={coin.gain}/>
          <Money value={coin.gain - coin.cost}/>
          <Percent value={roi}/>
        </div>
      </div>
    );
  }

  renderTransactions = (txs) => {
    return (
      <div>
        <List
          dataSource={txs}
          renderItem={this.renderTx}
        />
        <div className="even">
          {this.state.owner === this.state.visitor &&
              <Button onClick={this.addNewTx}>New transaction</Button>
          }
        </div>
      </div>
    );
  }

  renderTx = (tx, idx) => {
    if (idx === this.state.editingTxIndex) {
      return this.renderTxEdit(tx);
    }
    const dateStr = tx.ctime.split(' ')[0];
    const op = tx.type() === 'sell' ? '<=' : '=>';
    const src = tx.src.amount + ' ' + tx.src.unit.toUpperCase();
    const dst = tx.dst.amount + ' ' + tx.dst.unit.toUpperCase();
    let left, right;
    if (tx.isSell()) {
      left = dst;
      right = src;
    } else {
      left = src;
      right = dst;
    }
    return (
      <List.Item className="transaction">
        <span className="date">{dateStr}</span>
        <span className="left">{left}</span>
        <span className="op">{op}</span>
        <span className="right">{right}</span>
        {this.state.owner === this.state.visitor &&
            <span className="edit"
              onClick={() => this.startEditTx(tx, idx)}
            >
              <Icon className="edit-icon" type="edit" theme="outlined" />
            </span>
        }
      </List.Item>
    );
  }

  renderTxEdit = () => {
    const tx = this.state.editingTx;
    return (
      <List.Item className="transaction">
        <Form className="edit-tx-form">
          <Form.Item>
            <div className="even">
              <DatePicker value={tx.dateMoment}
                onChange={(_, dateStr) => {
                  tx.dateMoment = moment(dateStr, DATE_FORMAT);
                  this.setState({});
                }}
              />
              <TimePicker value={tx.timeMoment}
                onChange={(_, timeStr) => {
                  tx.timeMoment = moment(timeStr, TIME_FORMAT);
                  this.setState({});
                }}
              />
            </div>
          </Form.Item>
          <Form.Item>
            <div className="number-unit">
              <InputNumber className="number" value={tx.srcAmount}
                onChange={val => {
                  tx.srcAmount = val;
                  this.setState({});
                }}
              />
              <Input className="unit"
                value={tx.srcUnit.toUpperCase()}
                onChange={({target}) => {
                  tx.srcUnit = target.value.toUpperCase();
                  this.setState({});
                }}
              />
            </div>
          </Form.Item>
          <Form.Item>
            <div className="number-unit">
              <InputNumber className="number" value={tx.dstAmount}
                onChange={val => {
                  tx.dstAmount = val;
                  this.setState({});
                }}
              />
              <Input className="unit"
                value={tx.dstUnit.toUpperCase()}
                onChange={({target}) => {
                  tx.dstUnit = target.value.toUpperCase();
                  this.setState({});
                }}
              />
            </div>
          </Form.Item>
          <Form.Item>
            <Input placeholder="Comment"
              value={tx.comment}
              onChange={({target}) => {
                tx.comment = target.value;
                this.setState({});
              }}
            />
          </Form.Item>
          <Form.Item>
            <div className="even">
              <div className="left buttons">
                {!this.state.editingTx.new &&
                    <Button
                      onClick={this.deleteTx}
                    >Delete</Button>
                }
              </div>
              <div className="right buttons">
                <Button
                  onClick={() => this.doneEditTx(null)}
                >Cancel</Button>
                <Button type="primary"
                  onClick={() => this.doneEditTx(tx)}
                >Done</Button>
              </div>
            </div>
          </Form.Item>
        </Form>
      </List.Item>
    );
  }

  updateAssets = async (txs) => {
    if (!txs) {
      txs = await this.fetchTransactions();
      if (!txs) {
        message.error('Load assets failed');
        this.setState({refreshing: false});
        return;
      }
    }
    this.setState({transactions: txs});

    const assets = new Assets();
    for (const tx of txs) {
      assets.addTx(tx);
    }
    assets.summarize();
    this.setState({assets: assets}, this.updatePrices);
  }

  updatePrices = async () => {
    const assets = this.state.assets;
    const prices = await this.fetchPrices(assets.coins());
    if (!prices) {
      message.error('Load prices failed');
      this.setState({refreshing: false});
      return;
    }
    assets.updatePrices(prices);
    this.setState({
      prices: prices,
      pricesLoaded: true,
      refreshing: false,
    });
  }

  fetchTransactions = async () => {
    const owner = this.state.owner;
    const res = await fetch(`./api/transactions/${owner}`);
    if (res.status === 200) {
      const txs = (await res.json()).transactions.map(tx => {
        tx.src.amount = parseFloat(tx.src.amount);
        tx.dst.amount = parseFloat(tx.dst.amount);
        return new Transaction(tx.ctime, tx.src, tx.dst, tx.comment, tx.id);
      });
      console.log('transactions', txs);
      return txs;
    }
  }

  fetchPrices = async (coins) => {
    const coinNames = coins.map(c => c.name());
    const res = await fetch(`./api/prices?coins=${coinNames.join(',')}`);
    if (res.status === 200) {
      return (await res.json()).prices;
    }
  }

  refresh = () => {
    this.setState({refreshing: true}, this.updatePrices);
  }

  startEditTx = (tx, idx) => {
    const ctimeParts = tx.ctime.split(' ');
    const dateStr = ctimeParts[0];
    const timeStr = ctimeParts[1];

    const editingTx = {
      srcAmount: tx.src.amount,
      srcUnit: tx.src.unit,
      dstAmount: tx.dst.amount,
      dstUnit: tx.dst.unit,
      dateMoment: moment(dateStr, DATE_FORMAT),
      timeMoment: moment(timeStr, TIME_FORMAT),
      comment: tx.comment,
    };

    this.setState({
      editingTxIndex: idx,
      editingTx: editingTx,
    });
  }

  doneEditTx = async (tx) => {
    // save transaction if user choose done
    if (tx) {
      const dateStr = tx.dateMoment.format(DATE_FORMAT);
      const timeStr = tx.timeMoment.format(TIME_FORMAT);
      const ctime = dateStr + ' ' + timeStr;

      const newTx = new Transaction(
        ctime,
        {amount: tx.srcAmount, unit: tx.srcUnit.toLowerCase()},
        {amount: tx.dstAmount, unit: tx.dstUnit.toLowerCase()},
        tx.comment,
      );

      let res;
      if (tx.new) {
        const url = `./api/tx/${this.state.owner}`;
        res = await api.post(url, newTx.asStr());
      } else {
        const txId = this.state.transactions[this.state.editingTxIndex].id;
        const url = `./api/tx/${this.state.owner}/${txId}`;
        res = await api.put(url, newTx.asStr());
      }
      if (res.status === 200) {
        const txId = await res.text();
        newTx.id = txId;
        console.log(newTx);
        message.success('Saved');
      } else {
        message.error('Error: ' + await res.text());
        this.setState({refreshing: false});
        return;
      }

      const txs = this.state.transactions;
      txs[this.state.editingTxIndex] = newTx;
      await this.updateAssets(txs);
    } else {
      // remove new transaction if user choose cancel
      const editingTx = this.state.editingTx;
      if (editingTx.new) {
        this.state.transactions.pop();
      }
    }

    this.setState({
      editingTxIndex: null,
      editingTx: null,
    });
  }

  addNewTx = () => {
    const txs = this.state.transactions;
    const tx = {
      buy: true,
      srcAmount: 0,
      srcUnit: 'CNY',
      dstAmount: 0,
      dstUnit: 'BTC',
      dateMoment: moment(),
      timeMoment: moment(),
      new: true,
    }
    txs.push(tx);
    this.setState({
      transactions: txs,
      editingTxIndex: txs.length - 1,
      editingTx: tx,
    });
  }

  deleteTx = async () => {
    const editingTx = this.state.editingTx;
    if (editingTx) {
      const tx = this.state.transactions[this.state.editingTxIndex];
      const res = await fetch(
        `./api/tx/${this.state.owner}/${tx.id}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );
      if (res.status === 200) {
        message.success('Delete');
      } else {
        message.error('Error: ', await res.text());
        this.setState({refreshing: false});
        return;
      }
    }

    const txs = this.state.transactions;
    const idx = this.state.editingTxIndex;
    txs.splice(idx, 1);
    this.setState({
      transactions: txs,
      editingTxIndex: null,
      editingTx: null,
    }, async () => {
      await this.updateAssets(txs);
    });
  }

  onOwnerChange = (owner) => {
    this.setState({
      owner: owner,
      pricesLoaded: false,
      refreshing: true,
    }, () => {
      this.updateAssets();
    });
  }

  getOwner = () => {
    const params = qs.parse(window.location.search.substring(1));
    return params.owner || 'fans656';
  }

  getVisitor = () => {
    const token = Cookies.get('token');
    try {
      return jwtDecode(token).username;
    } catch (e) {
      return null;
    }
  }
}

const Money = ({value, unit, className}) => {
  return (
    <div className={`money ` + className}>
      <span className="value">{value ? value.toFixed(2) : '--'}</span>
      <span>{unit}</span>
    </div>
  );
}

const Percent = ({value, className}) => {
  value *= 100;
  let repr = null;
  if (!value) {
    repr = '--';
  } else if (value < 10000) {
    repr = value.toFixed(2) + '%';
  } else {
    repr = (value / 100).toFixed(2) + 'X';
  }
  return (
    <div className={`percent ` + className}>
      <span className="value">{repr}</span>
    </div>
  );
}

const DATE_FORMAT = 'YYYY-MM-DD';
const TIME_FORMAT = 'hh:mm:ss';
