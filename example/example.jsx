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

let renderComponent = function() {
  console.log('renderComponent with xid: ' + xid);
  React.render(
    <DailymotionFollow
      xid={xid}
      onLogin={login}
    />
  , placeholder);
}

let input = document.querySelector('#input-xid'),
    xid = input.value,
    placeholder = document.querySelector('#button-placeholder');

input.addEventListener('change', function(){
  xid = input.value;
  renderComponent();
});

renderComponent();