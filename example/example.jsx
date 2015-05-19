DM.init({
  apiKey: '3aa9af6953fe07347964',
  status: true,
  cookie: true
});

function login(callback) {

  DM.login( (response) => {
    if (response.session) {
      if (response.session.scope) {
        // user is logged in and granted some permissions.
        callback(response.session);
      }
      else {
        console.error('login failed');
      }
    }
    else {
      console.error('login failed');
    }
  }, {scope: 'read write manage_subscriptions'});

}

React.render(
  <DailymotionFollow
    xid="x1aopll"
    onLogin={login}
  />
, document.body);