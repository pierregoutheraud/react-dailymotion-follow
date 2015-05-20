(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var React = global.React || require("react");

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
    if (typeof DM === "undefined") console.error("Error: You must import Dailymotion javascript SDK.");

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
    var data = arguments[2] === undefined ? {} : arguments[2];

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

    this.fetchCount();
    this.isFollowing().then(function (isFollowing) {

      _this2.setState({
        authenticated: true,
        isFollowing: isFollowing
      });
    });
  },

  isFollowing: function isFollowing() {
    var url = "/me/following/" + this.props.xid;
    return this.call("get", url).then(function (res) {
      if (res.list.length) {
        return true;
      } else {
        return false;
      }
    });
  },

  fetchCount: function fetchCount() {
    var _this3 = this;

    var url = "/user/" + this.props.xid;
    var data = {
      fields: ["fans_total"]
    };
    return this.call("get", url, data).then(function (res) {
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
    var url = "/me/following/" + this.props.xid;
    return this.call("post", url).then(function (res) {
      return res;
    })["catch"](function (res) {
      console.error("Error while follow");
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
    var url = "/me/following/" + this.props.xid;
    return this.call("delete", url).then(function (res) {
      return res;
    })["catch"](function (res) {
      console.error("Error while follow");
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

    // console.log(this.state)

    var text = "Follow",
        dmFollowClass = "dm-follow ";

    switch (this.state.authenticated) {
      case true:
        if (this.state.isFollowing) {
          dmFollowClass += "dm-follow--unfollow ";
          text = this.state.hover ? "Unfollow " : "Following";
        } else {
          dmFollowClass += "dm-follow--follow ";
        }
        break;
      case false:
        dmFollowClass += "dm-follow--follow ";
        break;
    }

    // We hide if not auth OR we dont know if following or not yet
    if (this.state.authenticated === null || this.state.authenticated && this.state.isFollowing === null) dmFollowClass += "hidden ";

    if (this.state.hover) dmFollowClass += "active ";

    var countActive = undefined;
    if (this.state.fans_total !== null && this.state.fans_total !== 0) countActive = "active";

    return React.createElement(
      "div",
      { className: dmFollowClass },
      React.createElement(
        "button",
        {
          className: "btn dm-follow__btn",
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


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvc2NyaXB0cy9EYWlseW1vdGlvbkZvbGxvdy5qc3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7QUNBQSxJQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFFN0MsSUFBSSxZQUFZLEdBQUcsU0FBZixZQUFZLENBQVksTUFBTSxFQUFFLFNBQVMsRUFBRTtBQUFDLE1BQUksTUFBTSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQUFBQyxJQUFJLFNBQVMsSUFBSSxJQUFJLEVBQUU7QUFBQyxhQUFTLEdBQUcsQ0FBQyxDQUFDO0dBQUUsQUFBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsU0FBUyxDQUFDLENBQUMsQUFBQyxNQUFNLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxBQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxBQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUFDLFFBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUEsR0FBSSxDQUFDLENBQUMsQ0FBQyxBQUFDLElBQUksSUFBSSxJQUFJLE1BQU0sRUFBRTtBQUFDLFlBQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsU0FBUyxDQUFDLEFBQUMsSUFBSSxBQUFDLE1BQU0sS0FBSyxJQUFJLElBQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxBQUFDLEVBQUU7QUFBQyxjQUFNLEdBQUcsQ0FBQyxDQUFDLEFBQUMsQ0FBQyxFQUFF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LGlCQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQUFBQztBQUN0QixzQkFBWSxFQUFFLElBQUksQ0FBQyxZQUFZLEFBQUM7QUFDaEMsb0JBQVUsRUFBRSxJQUFJLENBQUMsVUFBVSxBQUFDOztRQUM1QixJQUFJO09BQVU7TUFDaEI7O1VBQUcsU0FBUyxFQUFFLG1CQUFtQixHQUFHLFdBQVcsQUFBQztRQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBQyxDQUFDLENBQUM7T0FBSztLQUN6RixDQUNOO0dBRUg7O0NBRUYsQ0FBQyxDQUFDOztBQUVILE1BQU0sQ0FBQyxpQkFBaUIsR0FBRyxpQkFBaUIsQ0FBQztxQkFDOUIsaUJBQWlCIiwiZmlsZSI6InJlYWN0LWRhaWx5bW90aW9uLWZvbGxvdy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibGV0IFJlYWN0ID0gZ2xvYmFsLlJlYWN0IHx8IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmxldCBmb3JtYXROdW1iZXIgPSBmdW5jdGlvbihudW1iZXIsIGRlY1BsYWNlcykge3ZhciBhYmJyZXYsIGksIHNpemU7IGlmIChkZWNQbGFjZXMgPT0gbnVsbCkge2RlY1BsYWNlcyA9IDE7IH0gZGVjUGxhY2VzID0gTWF0aC5wb3coMTAsIGRlY1BsYWNlcyk7IGFiYnJldiA9IFtcImtcIiwgXCJtXCIsIFwiYlwiLCBcInRcIl07IGkgPSBhYmJyZXYubGVuZ3RoIC0gMTsgd2hpbGUgKGkgPj0gMCkge3NpemUgPSBNYXRoLnBvdygxMCwgKGkgKyAxKSAqIDMpOyBpZiAoc2l6ZSA8PSBudW1iZXIpIHtudW1iZXIgPSBNYXRoLnJvdW5kKG51bWJlciAqIGRlY1BsYWNlcyAvIHNpemUpIC8gZGVjUGxhY2VzOyBpZiAoKG51bWJlciA9PT0gMTAwMCkgJiYgKGkgPCBhYmJyZXYubGVuZ3RoIC0gMSkpIHtudW1iZXIgPSAxOyBpKys7IH0gbnVtYmVyICs9IGFiYnJldltpXTsgYnJlYWs7IH0gaS0tOyB9IHJldHVybiBudW1iZXI7IH07XG5cbmxldCBEYWlseW1vdGlvbkZvbGxvdyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBnZXRJbml0aWFsU3RhdGUoKXtcbiAgICByZXR1cm4ge1xuICAgICAgYXV0aGVudGljYXRlZDogbnVsbCxcbiAgICAgIGlzRm9sbG93aW5nOiBudWxsLFxuICAgICAgaG92ZXI6IGZhbHNlLFxuICAgICAgZmFuc190b3RhbDogbnVsbFxuICAgIH07XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgLy8gVE9ETyA6IEltcG9ydCBEYWlseW1vdGlvbiBKUyBTREsgaWYgbm8gRE1cbiAgICBpZiggdHlwZW9mIERNID09PSAndW5kZWZpbmVkJyApIGNvbnNvbGUuZXJyb3IoJ0Vycm9yOiBZb3UgbXVzdCBpbXBvcnQgRGFpbHltb3Rpb24gamF2YXNjcmlwdCBTREsuJyk7XG5cbiAgICB0aGlzLmlzTG9nZ2VkKCkudGhlbigoaXNMb2dnZWQpID0+IHtcbiAgICAgIGlmKCBpc0xvZ2dlZCApIHRoaXMub25Mb2dnZWQoKTtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBhdXRoZW50aWNhdGVkOiBpc0xvZ2dlZFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wcywgcHJldlN0YXRlKSB7XG4gICAgaWYoIHByZXZQcm9wcy54aWQgIT09IHRoaXMucHJvcHMueGlkICkge1xuICAgICAgdGhpcy5vbkxvZ2dlZCgpO1xuICAgIH1cbiAgfSxcblxuICBjYWxsKG1ldGhvZCwgdXJsLCBkYXRhPXt9KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIERNLmFwaSggdXJsLCBtZXRob2QsIGRhdGEsIChyZXMpID0+IHtcbiAgICAgICAgaWYoIHJlcy5lcnJvciApIHtcbiAgICAgICAgICByZWplY3QocmVzLmVycm9yKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXNvbHZlKHJlcyk7XG4gICAgICAgIH1cbiAgICAgIH0sIHRydWUpO1xuICAgIH0pO1xuICB9LFxuXG4gIGlzTG9nZ2VkKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIERNLmdldExvZ2luU3RhdHVzKCAocmVzcG9uc2UpID0+IHtcbiAgICAgICAgaWYgKHJlc3BvbnNlLnNlc3Npb24pIHtcbiAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSxcblxuICBvbkxvZ2dlZCgpIHtcblxuICAgIHRoaXMuZmV0Y2hDb3VudCgpO1xuICAgIHRoaXMuaXNGb2xsb3dpbmcoKS50aGVuKCAoaXNGb2xsb3dpbmcpID0+IHtcblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGF1dGhlbnRpY2F0ZWQ6IHRydWUsXG4gICAgICAgIGlzRm9sbG93aW5nOiBpc0ZvbGxvd2luZ1xuICAgICAgfSk7XG5cbiAgICB9KTtcblxuICB9LFxuXG4gIGlzRm9sbG93aW5nKCkge1xuICAgIGxldCB1cmwgPSAnL21lL2ZvbGxvd2luZy8nICsgdGhpcy5wcm9wcy54aWQ7XG4gICAgcmV0dXJuIHRoaXMuY2FsbCgnZ2V0JywgdXJsKVxuICAgICAgLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICBpZiggcmVzLmxpc3QubGVuZ3RoICkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH0sXG5cbiAgZmV0Y2hDb3VudCgpIHtcbiAgICBsZXQgdXJsID0gJy91c2VyLycgKyB0aGlzLnByb3BzLnhpZDtcbiAgICBsZXQgZGF0YSA9IHtcbiAgICAgIGZpZWxkczogWydmYW5zX3RvdGFsJ11cbiAgICB9O1xuICAgIHJldHVybiB0aGlzLmNhbGwoJ2dldCcsIHVybCwgZGF0YSlcbiAgICAgICAgLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICAgIGxldCBmYW5zX3RvdGFsID0gcmVzLmZhbnNfdG90YWw7XG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGZhbnNfdG90YWw6IGZhbnNfdG90YWwgfSk7XG4gICAgICAgICAgcmV0dXJuIGZhbnNfdG90YWw7XG4gICAgICAgIH0pO1xuICB9LFxuXG4gIGZvbGxvdygpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGlzRm9sbG93aW5nOiB0cnVlLFxuICAgICAgaG92ZXI6IGZhbHNlLFxuICAgICAgZmFuc190b3RhbDogdGhpcy5zdGF0ZS5mYW5zX3RvdGFsICsgMVxuICAgIH0pO1xuICAgIGxldCB1cmwgPSAnL21lL2ZvbGxvd2luZy8nICsgdGhpcy5wcm9wcy54aWRcbiAgICByZXR1cm4gdGhpcy5jYWxsKCdwb3N0JywgdXJsKVxuICAgICAgICAgICAgLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaCgocmVzKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHdoaWxlIGZvbGxvdycpO1xuICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBpc0ZvbGxvd2luZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgZmFuc190b3RhbDogdGhpcy5zdGF0ZS5mYW5zX3RvdGFsICsgMVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgICAgIH0pO1xuICB9LFxuXG4gIHVuZm9sbG93KCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgaXNGb2xsb3dpbmc6IGZhbHNlLFxuICAgICAgZmFuc190b3RhbDogdGhpcy5zdGF0ZS5mYW5zX3RvdGFsIC0gMVxuICAgIH0pO1xuICAgIGxldCB1cmwgPSAnL21lL2ZvbGxvd2luZy8nICsgdGhpcy5wcm9wcy54aWRcbiAgICByZXR1cm4gdGhpcy5jYWxsKCdkZWxldGUnLCB1cmwpXG4gICAgICAgICAgICAudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKChyZXMpID0+IHtcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3Igd2hpbGUgZm9sbG93Jyk7XG4gICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGlzRm9sbG93aW5nOiB0cnVlLFxuICAgICAgICAgICAgICAgIGZhbnNfdG90YWw6IHRoaXMuc3RhdGUuZmFuc190b3RhbCArIDFcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgICAgICB9KTtcbiAgfSxcblxuICBvbk1vdXNlRW50ZXIoKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7IGhvdmVyOiB0cnVlIH0pO1xuICB9LFxuXG4gIG9uTW91c2VPdXQoKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7IGhvdmVyOiBmYWxzZSB9KTtcbiAgfSxcblxuICBvbkNsaWNrKCkge1xuICAgIGlmKCAhdGhpcy5zdGF0ZS5hdXRoZW50aWNhdGVkICkge1xuICAgICAgdGhpcy5wcm9wcy5vbkxvZ2luKHRoaXMub25Mb2dnZWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnN0YXRlLmlzRm9sbG93aW5nID8gdGhpcy51bmZvbGxvdygpIDogdGhpcy5mb2xsb3coKTtcbiAgICB9XG4gIH0sXG5cbiAgcmVuZGVyKCkge1xuXG4gICAgLy8gY29uc29sZS5sb2codGhpcy5zdGF0ZSlcblxuICAgIGxldCB0ZXh0ID0gJ0ZvbGxvdycsXG4gICAgICAgIGRtRm9sbG93Q2xhc3MgPSAnZG0tZm9sbG93ICc7XG5cbiAgICBzd2l0Y2goIHRoaXMuc3RhdGUuYXV0aGVudGljYXRlZCApIHtcbiAgICAgIGNhc2UgdHJ1ZTpcbiAgICAgICAgaWYoIHRoaXMuc3RhdGUuaXNGb2xsb3dpbmcgKSB7XG4gICAgICAgICAgZG1Gb2xsb3dDbGFzcyArPSAnZG0tZm9sbG93LS11bmZvbGxvdyAnO1xuICAgICAgICAgIHRleHQgPSB0aGlzLnN0YXRlLmhvdmVyID8gJ1VuZm9sbG93ICcgOiAnRm9sbG93aW5nJyA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZG1Gb2xsb3dDbGFzcyArPSAnZG0tZm9sbG93LS1mb2xsb3cgJztcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgZmFsc2U6XG4gICAgICAgIGRtRm9sbG93Q2xhc3MgKz0gJ2RtLWZvbGxvdy0tZm9sbG93ICc7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIC8vIFdlIGhpZGUgaWYgbm90IGF1dGggT1Igd2UgZG9udCBrbm93IGlmIGZvbGxvd2luZyBvciBub3QgeWV0XG4gICAgaWYoIHRoaXMuc3RhdGUuYXV0aGVudGljYXRlZCA9PT0gbnVsbCB8fCAodGhpcy5zdGF0ZS5hdXRoZW50aWNhdGVkICYmIHRoaXMuc3RhdGUuaXNGb2xsb3dpbmcgPT09IG51bGwpIClcbiAgICAgIGRtRm9sbG93Q2xhc3MgKz0gJ2hpZGRlbiAnO1xuXG4gICAgaWYoIHRoaXMuc3RhdGUuaG92ZXIgKVxuICAgICAgZG1Gb2xsb3dDbGFzcyArPSAnYWN0aXZlICc7XG5cbiAgICBsZXQgY291bnRBY3RpdmU7XG4gICAgaWYoIHRoaXMuc3RhdGUuZmFuc190b3RhbCAhPT0gbnVsbCAmJiB0aGlzLnN0YXRlLmZhbnNfdG90YWwgIT09IDAgKVxuICAgICAgY291bnRBY3RpdmUgPSAnYWN0aXZlJztcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT17ZG1Gb2xsb3dDbGFzc30gID5cbiAgICAgICAgPGJ1dHRvblxuICAgICAgICAgIGNsYXNzTmFtZT1cImJ0biBkbS1mb2xsb3dfX2J0blwiXG4gICAgICAgICAgb25DbGljaz17dGhpcy5vbkNsaWNrfVxuICAgICAgICAgIG9uTW91c2VFbnRlcj17dGhpcy5vbk1vdXNlRW50ZXJ9XG4gICAgICAgICAgb25Nb3VzZU91dD17dGhpcy5vbk1vdXNlT3V0fVxuICAgICAgICA+e3RleHR9PC9idXR0b24+XG4gICAgICAgIDxwIGNsYXNzTmFtZT17XCJkbS1mb2xsb3dfX2NvdW50IFwiICsgY291bnRBY3RpdmV9ID57Zm9ybWF0TnVtYmVyKHRoaXMuc3RhdGUuZmFuc190b3RhbCwyKX08L3A+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuXG4gIH1cblxufSk7XG5cbmdsb2JhbC5EYWlseW1vdGlvbkZvbGxvdyA9IERhaWx5bW90aW9uRm9sbG93O1xuZXhwb3J0IGRlZmF1bHQgRGFpbHltb3Rpb25Gb2xsb3c7Il19