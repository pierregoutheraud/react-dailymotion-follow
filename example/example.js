'use strict';

DM.init({
  apiKey: '3aa9af6953fe07347964',
  status: true,
  cookie: true
});

function login(callback) {

  DM.login(function (response) {
    if (response.session) {
      if (response.session.scope) {
        // user is logged in and granted some permissions.
        callback(response.session);
      } else {
        console.error('login failed');
      }
    } else {
      console.error('login failed');
    }
  }, { scope: 'read write' });
}

React.render(React.createElement(DailymotionFollow, {
  xid: 'x1aopll',
  onLogin: login
}), document.body);