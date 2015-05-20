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

  // componentWillReceiveProps() {
  //   console.log('componentWillReceiveProps');
  //   // this.setState({
  //   //   isFollowing: null
  //   // });
  //   console.log( this.props );
  //   this.onLogged();
  // },

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
      _this4.setState({ isFollowing: false });
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
      _this5.setState({ isFollowing: true });
      return res;
    });
  },

  onMouseEnter: function onMouseEnter() {
    this.setState({ hover: true });
  },

  onMouseOut: function onMouseOut() {
    this.setState({ hover: false });
  },

  render: function render() {

    // console.log('Render')
    // console.log(this.props, this.state)

    var text = "Follow",
        onclick = null,
        dmFollowClass = "dm-follow ";

    switch (this.state.authenticated) {
      case true:
        if (this.state.isFollowing) {
          dmFollowClass += "dm-follow--unfollow ";
          onclick = this.unfollow;
          text = this.state.hover ? "Unfollow " : "Following";
        } else {
          dmFollowClass += "dm-follow--follow ";
          onclick = this.follow;
        }
        break;
      case false:
        dmFollowClass += "dm-follow--follow ";
        onclick = this.props.onLogin.bind(null, this.onLogged);
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
          onClick: onclick,
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


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvc2NyaXB0cy9EYWlseW1vdGlvbkZvbGxvdy5qc3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7QUNBQSxJQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFFN0MsSUFBSSxZQUFZLEdBQUcsU0FBZixZQUFZLENBQVksTUFBTSxFQUFFLFNBQVMsRUFBRTtBQUFDLE1BQUksTUFBTSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQUFBQyxJQUFJLFNBQVMsSUFBSSxJQUFJLEVBQUU7QUFBQyxhQUFTLEdBQUcsQ0FBQyxDQUFDO0dBQUUsQUFBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsU0FBUyxDQUFDLENBQUMsQUFBQyxNQUFNLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxBQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxBQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUFDLFFBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUEsR0FBSSxDQUFDLENBQUMsQ0FBQyxBQUFDLElBQUksSUFBSSxJQUFJLE1BQU0sRUFBRTtBQUFDLFlBQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsU0FBUyxDQUFDLEFBQUMsSUFBSSxBQUFDLE1BQU0sS0FBSyxJQUFJLElBQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxBQUFDLEVBQUU7QUFBQyxjQUFNLEdBQUcsQ0FBQyxDQUFDLEFBQUMsQ0FBQyxFQUFF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QkFBbUIsR0FBRyxXQUFXLEFBQUM7UUFBRyxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDO09BQUs7S0FDekYsQ0FDTjtHQUVIOztDQUVGLENBQUMsQ0FBQzs7QUFFSCxNQUFNLENBQUMsaUJBQWlCLEdBQUcsaUJBQWlCLENBQUM7cUJBQzlCLGlCQUFpQiIsImZpbGUiOiJyZWFjdC1kYWlseW1vdGlvbi1mb2xsb3cuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImxldCBSZWFjdCA9IGdsb2JhbC5SZWFjdCB8fCByZXF1aXJlKCdyZWFjdCcpO1xuXG5sZXQgZm9ybWF0TnVtYmVyID0gZnVuY3Rpb24obnVtYmVyLCBkZWNQbGFjZXMpIHt2YXIgYWJicmV2LCBpLCBzaXplOyBpZiAoZGVjUGxhY2VzID09IG51bGwpIHtkZWNQbGFjZXMgPSAxOyB9IGRlY1BsYWNlcyA9IE1hdGgucG93KDEwLCBkZWNQbGFjZXMpOyBhYmJyZXYgPSBbXCJrXCIsIFwibVwiLCBcImJcIiwgXCJ0XCJdOyBpID0gYWJicmV2Lmxlbmd0aCAtIDE7IHdoaWxlIChpID49IDApIHtzaXplID0gTWF0aC5wb3coMTAsIChpICsgMSkgKiAzKTsgaWYgKHNpemUgPD0gbnVtYmVyKSB7bnVtYmVyID0gTWF0aC5yb3VuZChudW1iZXIgKiBkZWNQbGFjZXMgLyBzaXplKSAvIGRlY1BsYWNlczsgaWYgKChudW1iZXIgPT09IDEwMDApICYmIChpIDwgYWJicmV2Lmxlbmd0aCAtIDEpKSB7bnVtYmVyID0gMTsgaSsrOyB9IG51bWJlciArPSBhYmJyZXZbaV07IGJyZWFrOyB9IGktLTsgfSByZXR1cm4gbnVtYmVyOyB9O1xuXG5sZXQgRGFpbHltb3Rpb25Gb2xsb3cgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZ2V0SW5pdGlhbFN0YXRlKCl7XG4gICAgcmV0dXJuIHtcbiAgICAgIGF1dGhlbnRpY2F0ZWQ6IG51bGwsXG4gICAgICBpc0ZvbGxvd2luZzogbnVsbCxcbiAgICAgIGhvdmVyOiBmYWxzZSxcbiAgICAgIGZhbnNfdG90YWw6IG51bGxcbiAgICB9O1xuICB9LFxuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIC8vIFRPRE8gOiBJbXBvcnQgRGFpbHltb3Rpb24gSlMgU0RLIGlmIG5vIERNXG4gICAgaWYoIHR5cGVvZiBETSA9PT0gJ3VuZGVmaW5lZCcgKSBjb25zb2xlLmVycm9yKCdFcnJvcjogWW91IG11c3QgaW1wb3J0IERhaWx5bW90aW9uIGphdmFzY3JpcHQgU0RLLicpO1xuXG4gICAgdGhpcy5pc0xvZ2dlZCgpLnRoZW4oKGlzTG9nZ2VkKSA9PiB7XG4gICAgICBpZiggaXNMb2dnZWQgKSB0aGlzLm9uTG9nZ2VkKCk7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgYXV0aGVudGljYXRlZDogaXNMb2dnZWRcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9LFxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZShwcmV2UHJvcHMsIHByZXZTdGF0ZSkge1xuICAgIGlmKCBwcmV2UHJvcHMueGlkICE9PSB0aGlzLnByb3BzLnhpZCApIHtcbiAgICAgIHRoaXMub25Mb2dnZWQoKTtcbiAgICB9XG4gIH0sXG5cbiAgLy8gY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcygpIHtcbiAgLy8gICBjb25zb2xlLmxvZygnY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcycpO1xuICAvLyAgIC8vIHRoaXMuc2V0U3RhdGUoe1xuICAvLyAgIC8vICAgaXNGb2xsb3dpbmc6IG51bGxcbiAgLy8gICAvLyB9KTtcbiAgLy8gICBjb25zb2xlLmxvZyggdGhpcy5wcm9wcyApO1xuICAvLyAgIHRoaXMub25Mb2dnZWQoKTtcbiAgLy8gfSxcblxuICBjYWxsKG1ldGhvZCwgdXJsLCBkYXRhPXt9KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIERNLmFwaSggdXJsLCBtZXRob2QsIGRhdGEsIChyZXMpID0+IHtcbiAgICAgICAgaWYoIHJlcy5lcnJvciApIHtcbiAgICAgICAgICByZWplY3QocmVzLmVycm9yKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXNvbHZlKHJlcyk7XG4gICAgICAgIH1cbiAgICAgIH0sIHRydWUpO1xuICAgIH0pO1xuICB9LFxuXG4gIGlzTG9nZ2VkKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIERNLmdldExvZ2luU3RhdHVzKCAocmVzcG9uc2UpID0+IHtcbiAgICAgICAgaWYgKHJlc3BvbnNlLnNlc3Npb24pIHtcbiAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSxcblxuICBvbkxvZ2dlZCgpIHtcblxuICAgIHRoaXMuZmV0Y2hDb3VudCgpO1xuICAgIHRoaXMuaXNGb2xsb3dpbmcoKS50aGVuKCAoaXNGb2xsb3dpbmcpID0+IHtcblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGF1dGhlbnRpY2F0ZWQ6IHRydWUsXG4gICAgICAgIGlzRm9sbG93aW5nOiBpc0ZvbGxvd2luZ1xuICAgICAgfSk7XG5cbiAgICB9KTtcblxuICB9LFxuXG4gIGlzRm9sbG93aW5nKCkge1xuICAgIGxldCB1cmwgPSAnL21lL2ZvbGxvd2luZy8nICsgdGhpcy5wcm9wcy54aWQ7XG4gICAgcmV0dXJuIHRoaXMuY2FsbCgnZ2V0JywgdXJsKVxuICAgICAgLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICBpZiggcmVzLmxpc3QubGVuZ3RoICkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH0sXG5cbiAgZmV0Y2hDb3VudCgpIHtcbiAgICBsZXQgdXJsID0gJy91c2VyLycgKyB0aGlzLnByb3BzLnhpZDtcbiAgICBsZXQgZGF0YSA9IHtcbiAgICAgIGZpZWxkczogWydmYW5zX3RvdGFsJ11cbiAgICB9O1xuICAgIHJldHVybiB0aGlzLmNhbGwoJ2dldCcsIHVybCwgZGF0YSlcbiAgICAgICAgLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICAgIGxldCBmYW5zX3RvdGFsID0gcmVzLmZhbnNfdG90YWw7XG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGZhbnNfdG90YWw6IGZhbnNfdG90YWwgfSk7XG4gICAgICAgICAgcmV0dXJuIGZhbnNfdG90YWw7XG4gICAgICAgIH0pO1xuICB9LFxuXG4gIGZvbGxvdygpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGlzRm9sbG93aW5nOiB0cnVlLFxuICAgICAgaG92ZXI6IGZhbHNlLFxuICAgICAgZmFuc190b3RhbDogdGhpcy5zdGF0ZS5mYW5zX3RvdGFsICsgMVxuICAgIH0pO1xuICAgIGxldCB1cmwgPSAnL21lL2ZvbGxvd2luZy8nICsgdGhpcy5wcm9wcy54aWRcbiAgICByZXR1cm4gdGhpcy5jYWxsKCdwb3N0JywgdXJsKVxuICAgICAgICAgICAgLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaCgocmVzKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHdoaWxlIGZvbGxvdycpO1xuICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgaXNGb2xsb3dpbmc6IGZhbHNlIH0pO1xuICAgICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICAgICAgfSk7XG4gIH0sXG5cbiAgdW5mb2xsb3coKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBpc0ZvbGxvd2luZzogZmFsc2UsXG4gICAgICBmYW5zX3RvdGFsOiB0aGlzLnN0YXRlLmZhbnNfdG90YWwgLSAxXG4gICAgfSk7XG4gICAgbGV0IHVybCA9ICcvbWUvZm9sbG93aW5nLycgKyB0aGlzLnByb3BzLnhpZFxuICAgIHJldHVybiB0aGlzLmNhbGwoJ2RlbGV0ZScsIHVybClcbiAgICAgICAgICAgIC50aGVuKChyZXMpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goKHJlcykgPT4ge1xuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciB3aGlsZSBmb2xsb3cnKTtcbiAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGlzRm9sbG93aW5nOiB0cnVlIH0pO1xuICAgICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICAgICAgfSk7XG4gIH0sXG5cbiAgb25Nb3VzZUVudGVyKCkge1xuICAgIHRoaXMuc2V0U3RhdGUoeyBob3ZlcjogdHJ1ZSB9KTtcbiAgfSxcblxuICBvbk1vdXNlT3V0KCkge1xuICAgIHRoaXMuc2V0U3RhdGUoeyBob3ZlcjogZmFsc2UgfSk7XG4gIH0sXG5cbiAgcmVuZGVyKCkge1xuXG4gICAgLy8gY29uc29sZS5sb2coJ1JlbmRlcicpXG4gICAgLy8gY29uc29sZS5sb2codGhpcy5wcm9wcywgdGhpcy5zdGF0ZSlcblxuICAgIGxldCB0ZXh0ID0gJ0ZvbGxvdycsXG4gICAgICAgIG9uY2xpY2sgPSBudWxsLFxuICAgICAgICBkbUZvbGxvd0NsYXNzID0gJ2RtLWZvbGxvdyAnO1xuXG4gICAgc3dpdGNoKCB0aGlzLnN0YXRlLmF1dGhlbnRpY2F0ZWQgKSB7XG4gICAgICBjYXNlIHRydWU6XG4gICAgICAgIGlmKCB0aGlzLnN0YXRlLmlzRm9sbG93aW5nICkge1xuICAgICAgICAgIGRtRm9sbG93Q2xhc3MgKz0gJ2RtLWZvbGxvdy0tdW5mb2xsb3cgJztcbiAgICAgICAgICBvbmNsaWNrID0gdGhpcy51bmZvbGxvdztcbiAgICAgICAgICB0ZXh0ID0gdGhpcy5zdGF0ZS5ob3ZlciA/ICdVbmZvbGxvdyAnIDogJ0ZvbGxvd2luZycgO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRtRm9sbG93Q2xhc3MgKz0gJ2RtLWZvbGxvdy0tZm9sbG93ICc7XG4gICAgICAgICAgb25jbGljayA9IHRoaXMuZm9sbG93O1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBmYWxzZTpcbiAgICAgICAgZG1Gb2xsb3dDbGFzcyArPSAnZG0tZm9sbG93LS1mb2xsb3cgJztcbiAgICAgICAgb25jbGljayA9IHRoaXMucHJvcHMub25Mb2dpbi5iaW5kKG51bGwsdGhpcy5vbkxvZ2dlZCk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIC8vIFdlIGhpZGUgaWYgbm90IGF1dGggT1Igd2UgZG9udCBrbm93IGlmIGZvbGxvd2luZyBvciBub3QgeWV0XG4gICAgaWYoIHRoaXMuc3RhdGUuYXV0aGVudGljYXRlZCA9PT0gbnVsbCB8fCAodGhpcy5zdGF0ZS5hdXRoZW50aWNhdGVkICYmIHRoaXMuc3RhdGUuaXNGb2xsb3dpbmcgPT09IG51bGwpIClcbiAgICAgIGRtRm9sbG93Q2xhc3MgKz0gJ2hpZGRlbiAnO1xuXG4gICAgaWYoIHRoaXMuc3RhdGUuaG92ZXIgKVxuICAgICAgZG1Gb2xsb3dDbGFzcyArPSAnYWN0aXZlICc7XG5cbiAgICBsZXQgY291bnRBY3RpdmU7XG4gICAgaWYoIHRoaXMuc3RhdGUuZmFuc190b3RhbCAhPT0gbnVsbCAmJiB0aGlzLnN0YXRlLmZhbnNfdG90YWwgIT09IDAgKVxuICAgICAgY291bnRBY3RpdmUgPSAnYWN0aXZlJztcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT17ZG1Gb2xsb3dDbGFzc30gID5cbiAgICAgICAgPGJ1dHRvblxuICAgICAgICAgIGNsYXNzTmFtZT1cImJ0biBkbS1mb2xsb3dfX2J0blwiXG4gICAgICAgICAgb25DbGljaz17b25jbGlja31cbiAgICAgICAgICBvbk1vdXNlRW50ZXI9e3RoaXMub25Nb3VzZUVudGVyfVxuICAgICAgICAgIG9uTW91c2VPdXQ9e3RoaXMub25Nb3VzZU91dH1cbiAgICAgICAgPnt0ZXh0fTwvYnV0dG9uPlxuICAgICAgICA8cCBjbGFzc05hbWU9e1wiZG0tZm9sbG93X19jb3VudCBcIiArIGNvdW50QWN0aXZlfSA+e2Zvcm1hdE51bWJlcih0aGlzLnN0YXRlLmZhbnNfdG90YWwsMil9PC9wPlxuICAgICAgPC9kaXY+XG4gICAgKTtcblxuICB9XG5cbn0pO1xuXG5nbG9iYWwuRGFpbHltb3Rpb25Gb2xsb3cgPSBEYWlseW1vdGlvbkZvbGxvdztcbmV4cG9ydCBkZWZhdWx0IERhaWx5bW90aW9uRm9sbG93OyJdfQ==