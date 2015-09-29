(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"react":undefined}]},{},[1])


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvc2NyaXB0cy9EYWlseW1vdGlvbkZvbGxvdy5qc3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7QUNBQSxJQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFFN0MsSUFBSSxZQUFZLEdBQUcsU0FBZixZQUFZLENBQVksTUFBTSxFQUFFLFNBQVMsRUFBRTtBQUFDLE1BQUksTUFBTSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQUFBQyxJQUFJLFNBQVMsSUFBSSxJQUFJLEVBQUU7QUFBQyxhQUFTLEdBQUcsQ0FBQyxDQUFDO0dBQUUsQUFBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsU0FBUyxDQUFDLENBQUMsQUFBQyxNQUFNLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxBQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxBQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUFDLFFBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUEsR0FBSSxDQUFDLENBQUMsQ0FBQyxBQUFDLElBQUksSUFBSSxJQUFJLE1BQU0sRUFBRTtBQUFDLFlBQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsU0FBUyxDQUFDLEFBQUMsSUFBSSxBQUFDLE1BQU0sS0FBSyxJQUFJLElBQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxBQUFDLEVBQUU7QUFBQyxjQUFNLEdBQUcsQ0FBQyxDQUFDLEFBQUMsQ0FBQyxFQUFF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QyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUNuRixXQUFXLEdBQUcsUUFBUSxDQUFDOztBQUV6QixXQUNFOztRQUFLLFNBQVMsRUFBRSxhQUFhLEFBQUM7TUFDNUI7OztBQUNFLG1CQUFTLEVBQUMsZ0JBQWdCO0FBQzFCLGlCQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQUFBQztBQUN0QixzQkFBWSxFQUFFLElBQUksQ0FBQyxZQUFZLEFBQUM7QUFDaEMsb0JBQVUsRUFBRSxJQUFJLENBQUMsVUFBVSxBQUFDOztRQUM1QixJQUFJO09BQVU7TUFDaEI7O1VBQUcsU0FBUyxFQUFFLG1CQUFtQixHQUFHLFdBQVcsQUFBQztRQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBQyxDQUFDLENBQUM7T0FBSztLQUN6RixDQUNOO0dBRUg7O0NBRUYsQ0FBQyxDQUFDOztBQUVILE1BQU0sQ0FBQyxpQkFBaUIsR0FBRyxpQkFBaUIsQ0FBQztxQkFDOUIsaUJBQWlCIiwiZmlsZSI6InJlYWN0LWRhaWx5bW90aW9uLWZvbGxvdy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibGV0IFJlYWN0ID0gZ2xvYmFsLlJlYWN0IHx8IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmxldCBmb3JtYXROdW1iZXIgPSBmdW5jdGlvbihudW1iZXIsIGRlY1BsYWNlcykge3ZhciBhYmJyZXYsIGksIHNpemU7IGlmIChkZWNQbGFjZXMgPT0gbnVsbCkge2RlY1BsYWNlcyA9IDE7IH0gZGVjUGxhY2VzID0gTWF0aC5wb3coMTAsIGRlY1BsYWNlcyk7IGFiYnJldiA9IFtcImtcIiwgXCJtXCIsIFwiYlwiLCBcInRcIl07IGkgPSBhYmJyZXYubGVuZ3RoIC0gMTsgd2hpbGUgKGkgPj0gMCkge3NpemUgPSBNYXRoLnBvdygxMCwgKGkgKyAxKSAqIDMpOyBpZiAoc2l6ZSA8PSBudW1iZXIpIHtudW1iZXIgPSBNYXRoLnJvdW5kKG51bWJlciAqIGRlY1BsYWNlcyAvIHNpemUpIC8gZGVjUGxhY2VzOyBpZiAoKG51bWJlciA9PT0gMTAwMCkgJiYgKGkgPCBhYmJyZXYubGVuZ3RoIC0gMSkpIHtudW1iZXIgPSAxOyBpKys7IH0gbnVtYmVyICs9IGFiYnJldltpXTsgYnJlYWs7IH0gaS0tOyB9IHJldHVybiBudW1iZXI7IH07XG5cbmxldCBEYWlseW1vdGlvbkZvbGxvdyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBnZXREZWZhdWx0UHJvcHMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvdW50OiB0cnVlXG4gICAgfTtcbiAgfSxcblxuICBnZXRJbml0aWFsU3RhdGUoKXtcbiAgICByZXR1cm4ge1xuICAgICAgYXV0aGVudGljYXRlZDogbnVsbCxcbiAgICAgIGlzRm9sbG93aW5nOiBudWxsLFxuICAgICAgaG92ZXI6IGZhbHNlLFxuICAgICAgZmFuc190b3RhbDogbnVsbFxuICAgIH07XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgLy8gVE9ETyA6IEltcG9ydCBEYWlseW1vdGlvbiBKUyBTREsgaWYgbm8gRE1cbiAgICBpZiggdHlwZW9mIERNID09PSAndW5kZWZpbmVkJyApIGNvbnNvbGUuZXJyb3IoJ0Vycm9yOiBZb3UgbXVzdCBpbXBvcnQgRGFpbHltb3Rpb24gamF2YXNjcmlwdCBTREsuJyk7XG5cbiAgICB0aGlzLmlzTG9nZ2VkKCkudGhlbigoaXNMb2dnZWQpID0+IHtcbiAgICAgIGlmKCBpc0xvZ2dlZCApIHRoaXMub25Mb2dnZWQoKTtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBhdXRoZW50aWNhdGVkOiBpc0xvZ2dlZFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wcywgcHJldlN0YXRlKSB7XG4gICAgaWYoIHByZXZQcm9wcy54aWQgIT09IHRoaXMucHJvcHMueGlkICkge1xuICAgICAgdGhpcy5vbkxvZ2dlZCgpO1xuICAgIH1cbiAgfSxcblxuICBjYWxsKG1ldGhvZCwgdXJsLCBkYXRhPXt9KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIERNLmFwaSggdXJsLCBtZXRob2QsIGRhdGEsIChyZXMpID0+IHtcbiAgICAgICAgaWYoIHJlcy5lcnJvciApIHtcbiAgICAgICAgICByZWplY3QocmVzLmVycm9yKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXNvbHZlKHJlcyk7XG4gICAgICAgIH1cbiAgICAgIH0sIHRydWUpO1xuICAgIH0pO1xuICB9LFxuXG4gIGlzTG9nZ2VkKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIERNLmdldExvZ2luU3RhdHVzKCAocmVzcG9uc2UpID0+IHtcbiAgICAgICAgaWYgKHJlc3BvbnNlLnNlc3Npb24pIHtcbiAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSxcblxuICBvbkxvZ2dlZCgpIHtcblxuICAgIGlmKCB0aGlzLnByb3BzLmNvdW50ICkgdGhpcy5mZXRjaENvdW50KCk7XG4gICAgdGhpcy5pc0ZvbGxvd2luZygpLnRoZW4oIChpc0ZvbGxvd2luZykgPT4ge1xuXG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgYXV0aGVudGljYXRlZDogdHJ1ZSxcbiAgICAgICAgaXNGb2xsb3dpbmc6IGlzRm9sbG93aW5nXG4gICAgICB9KTtcblxuICAgIH0pO1xuXG4gIH0sXG5cbiAgaXNGb2xsb3dpbmcoKSB7XG4gICAgbGV0IHVybCA9ICcvbWUvZm9sbG93aW5nLycgKyB0aGlzLnByb3BzLnhpZDtcbiAgICByZXR1cm4gdGhpcy5jYWxsKCdnZXQnLCB1cmwpXG4gICAgICAudGhlbigocmVzKSA9PiB7XG4gICAgICAgIGlmKCByZXMubGlzdC5sZW5ndGggKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgfSxcblxuICBmZXRjaENvdW50KCkge1xuICAgIGxldCB1cmwgPSAnL3VzZXIvJyArIHRoaXMucHJvcHMueGlkO1xuICAgIGxldCBkYXRhID0ge1xuICAgICAgZmllbGRzOiBbJ2ZhbnNfdG90YWwnXVxuICAgIH07XG4gICAgcmV0dXJuIHRoaXMuY2FsbCgnZ2V0JywgdXJsLCBkYXRhKVxuICAgICAgICAudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgbGV0IGZhbnNfdG90YWwgPSByZXMuZmFuc190b3RhbDtcbiAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgZmFuc190b3RhbDogZmFuc190b3RhbCB9KTtcbiAgICAgICAgICByZXR1cm4gZmFuc190b3RhbDtcbiAgICAgICAgfSk7XG4gIH0sXG5cbiAgZm9sbG93KCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgaXNGb2xsb3dpbmc6IHRydWUsXG4gICAgICBob3ZlcjogZmFsc2UsXG4gICAgICBmYW5zX3RvdGFsOiB0aGlzLnN0YXRlLmZhbnNfdG90YWwgKyAxXG4gICAgfSk7XG4gICAgbGV0IHVybCA9ICcvbWUvZm9sbG93aW5nLycgKyB0aGlzLnByb3BzLnhpZFxuICAgIHJldHVybiB0aGlzLmNhbGwoJ3Bvc3QnLCB1cmwpXG4gICAgICAgICAgICAudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKChyZXMpID0+IHtcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3Igd2hpbGUgZm9sbG93Jyk7XG4gICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGlzRm9sbG93aW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBmYW5zX3RvdGFsOiB0aGlzLnN0YXRlLmZhbnNfdG90YWwgKyAxXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICAgICAgfSk7XG4gIH0sXG5cbiAgdW5mb2xsb3coKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBpc0ZvbGxvd2luZzogZmFsc2UsXG4gICAgICBmYW5zX3RvdGFsOiB0aGlzLnN0YXRlLmZhbnNfdG90YWwgLSAxXG4gICAgfSk7XG4gICAgbGV0IHVybCA9ICcvbWUvZm9sbG93aW5nLycgKyB0aGlzLnByb3BzLnhpZFxuICAgIHJldHVybiB0aGlzLmNhbGwoJ2RlbGV0ZScsIHVybClcbiAgICAgICAgICAgIC50aGVuKChyZXMpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goKHJlcykgPT4ge1xuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciB3aGlsZSBmb2xsb3cnKTtcbiAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgaXNGb2xsb3dpbmc6IHRydWUsXG4gICAgICAgICAgICAgICAgZmFuc190b3RhbDogdGhpcy5zdGF0ZS5mYW5zX3RvdGFsICsgMVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgICAgIH0pO1xuICB9LFxuXG4gIG9uTW91c2VFbnRlcigpIHtcbiAgICB0aGlzLnNldFN0YXRlKHsgaG92ZXI6IHRydWUgfSk7XG4gIH0sXG5cbiAgb25Nb3VzZU91dCgpIHtcbiAgICB0aGlzLnNldFN0YXRlKHsgaG92ZXI6IGZhbHNlIH0pO1xuICB9LFxuXG4gIG9uQ2xpY2soKSB7XG4gICAgaWYoICF0aGlzLnN0YXRlLmF1dGhlbnRpY2F0ZWQgKSB7XG4gICAgICB0aGlzLnByb3BzLm9uTG9naW4odGhpcy5vbkxvZ2dlZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc3RhdGUuaXNGb2xsb3dpbmcgPyB0aGlzLnVuZm9sbG93KCkgOiB0aGlzLmZvbGxvdygpO1xuICAgIH1cbiAgfSxcblxuICByZW5kZXIoKSB7XG5cbiAgICBsZXQgdGV4dCA9ICdGb2xsb3cnLFxuICAgICAgICBkbUZvbGxvd0NsYXNzID0gJ2RtLWZvbGxvdyAnO1xuXG4gICAgc3dpdGNoKCB0aGlzLnN0YXRlLmF1dGhlbnRpY2F0ZWQgKSB7XG4gICAgICBjYXNlIHRydWU6XG4gICAgICAgIGlmKCB0aGlzLnN0YXRlLmlzRm9sbG93aW5nICkge1xuICAgICAgICAgIGRtRm9sbG93Q2xhc3MgKz0gJ2RtLWZvbGxvdy0tZm9sbG93aW5nICc7XG4gICAgICAgICAgdGV4dCA9IHRoaXMuc3RhdGUuaG92ZXIgPyAnVW5mb2xsb3cgJyA6ICdGb2xsb3dpbmcnIDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkbUZvbGxvd0NsYXNzICs9ICdkbS1mb2xsb3ctLWZvbGxvdyAnO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBmYWxzZTpcbiAgICAgICAgZG1Gb2xsb3dDbGFzcyArPSAnZG0tZm9sbG93LS1mb2xsb3cgJztcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgLy8gV2UgaGlkZSBpZiBub3QgYXV0aCBPUiB3ZSBkb250IGtub3cgaWYgZm9sbG93aW5nIG9yIG5vdCB5ZXRcbiAgICBpZiggdGhpcy5zdGF0ZS5hdXRoZW50aWNhdGVkID09PSBudWxsIHx8ICh0aGlzLnN0YXRlLmF1dGhlbnRpY2F0ZWQgJiYgdGhpcy5zdGF0ZS5pc0ZvbGxvd2luZyA9PT0gbnVsbCkgKVxuICAgICAgZG1Gb2xsb3dDbGFzcyArPSAnaGlkZGVuICc7XG5cbiAgICBpZiggdGhpcy5zdGF0ZS5ob3ZlciApXG4gICAgICBkbUZvbGxvd0NsYXNzICs9ICdhY3RpdmUgJztcblxuICAgIGxldCBjb3VudEFjdGl2ZTtcbiAgICBpZiggdGhpcy5zdGF0ZS5mYW5zX3RvdGFsICE9PSBudWxsICYmIHRoaXMuc3RhdGUuZmFuc190b3RhbCAhPT0gMCAmJiB0aGlzLnByb3BzLmNvdW50IClcbiAgICAgIGNvdW50QWN0aXZlID0gJ2FjdGl2ZSc7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9e2RtRm9sbG93Q2xhc3N9ICA+XG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICBjbGFzc05hbWU9XCJkbS1mb2xsb3dfX2J0blwiXG4gICAgICAgICAgb25DbGljaz17dGhpcy5vbkNsaWNrfVxuICAgICAgICAgIG9uTW91c2VFbnRlcj17dGhpcy5vbk1vdXNlRW50ZXJ9XG4gICAgICAgICAgb25Nb3VzZU91dD17dGhpcy5vbk1vdXNlT3V0fVxuICAgICAgICA+e3RleHR9PC9idXR0b24+XG4gICAgICAgIDxwIGNsYXNzTmFtZT17XCJkbS1mb2xsb3dfX2NvdW50IFwiICsgY291bnRBY3RpdmV9ID57Zm9ybWF0TnVtYmVyKHRoaXMuc3RhdGUuZmFuc190b3RhbCwyKX08L3A+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuXG4gIH1cblxufSk7XG5cbmdsb2JhbC5EYWlseW1vdGlvbkZvbGxvdyA9IERhaWx5bW90aW9uRm9sbG93O1xuZXhwb3J0IGRlZmF1bHQgRGFpbHltb3Rpb25Gb2xsb3c7XG4iXX0=