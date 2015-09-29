"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var React = global.React || require('react');

var formatNumber = function formatNumber(number, decPlaces) {
  var abbrev, i, size;if (decPlaces == null) {
    decPlaces = 1;
  }decPlaces = Math.pow(10, decPlaces);abbrev = ["k", "m", "b", "t"];i = abbrev.length - 1;while (i >= 0) {
    size = Math.pow(10, (i + 1) * 3);if (size <= number) {
      number = Math.round(number * decPlaces / size) / decPlaces;if (number === 1000 && i < abbrev.length - 1) {
        number = 1;i++;
      }number += abbrev[i];break;
    }i--;
  }return number;
};

var DailymotionFollow = React.createClass({
  displayName: "DailymotionFollow",

  getDefaultProps: function getDefaultProps() {
    return {
      count: true
    };
  },

  getInitialState: function getInitialState() {
    return {
      authenticated: null,
      isFollowing: null,
      hover: false,
      fans_total: null
    };
  },

  componentDidMount: function componentDidMount() {
    var _this = this;

    // TODO : Import Dailymotion JS SDK if no DM
    if (typeof DM === 'undefined') console.error('Error: You must import Dailymotion javascript SDK.');

    this.isLogged().then(function (isLogged) {
      if (isLogged) _this.onLogged();
      _this.setState({
        authenticated: isLogged
      });
    });
  },

  componentDidUpdate: function componentDidUpdate(prevProps, prevState) {
    if (prevProps.xid !== this.props.xid) {
      this.onLogged();
    }
  },

  call: function call(method, url) {
    var data = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    return new Promise(function (resolve, reject) {
      DM.api(url, method, data, function (res) {
        if (res.error) {
          reject(res.error);
        } else {
          resolve(res);
        }
      }, true);
    });
  },

  isLogged: function isLogged(callback) {
    return new Promise(function (resolve, reject) {
      DM.getLoginStatus(function (response) {
        if (response.session) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  },

  onLogged: function onLogged() {
    var _this2 = this;

    if (this.props.count) this.fetchCount();
    this.isFollowing().then(function (isFollowing) {

      _this2.setState({
        authenticated: true,
        isFollowing: isFollowing
      });
    });
  },

  isFollowing: function isFollowing() {
    var url = '/me/following/' + this.props.xid;
    return this.call('get', url).then(function (res) {
      if (res.list.length) {
        return true;
      } else {
        return false;
      }
    });
  },

  fetchCount: function fetchCount() {
    var _this3 = this;

    var url = '/user/' + this.props.xid;
    var data = {
      fields: ['fans_total']
    };
    return this.call('get', url, data).then(function (res) {
      var fans_total = res.fans_total;
      _this3.setState({ fans_total: fans_total });
      return fans_total;
    });
  },

  follow: function follow() {
    var _this4 = this;

    this.setState({
      isFollowing: true,
      hover: false,
      fans_total: this.state.fans_total + 1
    });
    var url = '/me/following/' + this.props.xid;
    return this.call('post', url).then(function (res) {
      return res;
    })["catch"](function (res) {
      console.error('Error while follow');
      _this4.setState({
        isFollowing: false,
        fans_total: _this4.state.fans_total + 1
      });
      return res;
    });
  },

  unfollow: function unfollow() {
    var _this5 = this;

    this.setState({
      isFollowing: false,
      fans_total: this.state.fans_total - 1
    });
    var url = '/me/following/' + this.props.xid;
    return this.call('delete', url).then(function (res) {
      return res;
    })["catch"](function (res) {
      console.error('Error while follow');
      _this5.setState({
        isFollowing: true,
        fans_total: _this5.state.fans_total + 1
      });
      return res;
    });
  },

  onMouseEnter: function onMouseEnter() {
    this.setState({ hover: true });
  },

  onMouseOut: function onMouseOut() {
    this.setState({ hover: false });
  },

  onClick: function onClick() {
    if (!this.state.authenticated) {
      this.props.onLogin(this.onLogged);
    } else {
      this.state.isFollowing ? this.unfollow() : this.follow();
    }
  },

  render: function render() {

    var text = 'Follow',
        dmFollowClass = 'dm-follow ';

    switch (this.state.authenticated) {
      case true:
        if (this.state.isFollowing) {
          dmFollowClass += 'dm-follow--following ';
          text = this.state.hover ? 'Unfollow ' : 'Following';
        } else {
          dmFollowClass += 'dm-follow--follow ';
        }
        break;
      case false:
        dmFollowClass += 'dm-follow--follow ';
        break;
    }

    // We hide if not auth OR we dont know if following or not yet
    if (this.state.authenticated === null || this.state.authenticated && this.state.isFollowing === null) dmFollowClass += 'hidden ';

    if (this.state.hover) dmFollowClass += 'active ';

    var countActive = undefined;
    if (this.state.fans_total !== null && this.state.fans_total !== 0 && this.props.count) countActive = 'active';

    return React.createElement(
      "div",
      { className: dmFollowClass },
      React.createElement(
        "button",
        {
          className: "dm-follow__btn",
          onClick: this.onClick,
          onMouseEnter: this.onMouseEnter,
          onMouseOut: this.onMouseOut
        },
        text
      ),
      React.createElement(
        "p",
        { className: "dm-follow__count " + countActive },
        formatNumber(this.state.fans_total, 2)
      )
    );
  }

});

global.DailymotionFollow = DailymotionFollow;
exports["default"] = DailymotionFollow;
module.exports = exports["default"];