let React = global.React || require('react');

let formatNumber = function(number, decPlaces) {var abbrev, i, size; if (decPlaces == null) {decPlaces = 1; } decPlaces = Math.pow(10, decPlaces); abbrev = ["k", "m", "b", "t"]; i = abbrev.length - 1; while (i >= 0) {size = Math.pow(10, (i + 1) * 3); if (size <= number) {number = Math.round(number * decPlaces / size) / decPlaces; if ((number === 1000) && (i < abbrev.length - 1)) {number = 1; i++; } number += abbrev[i]; break; } i--; } return number; };

let DailymotionFollow = React.createClass({

  getInitialState(){
    return {
      authenticated: null,
      isFollowing: null,
      hover: false,
      fans_total: null
    };
  },

  componentDidMount() {
    if( typeof DM === 'undefined' ) console.error('Error: You must import Dailymotion javascript SDK.');

    this.isLogged().then((isLogged) => {
      if( isLogged ) this.onLogged();
      this.setState({
        authenticated: isLogged
      });
    });
  },

  call(method, url, data={}) {
    return new Promise((resolve, reject) => {
      DM.api( url, method, data, (res) => {
        if( res.error ) {
          reject(res.error);
        } else {
          resolve(res);
        }
      }, true);
    });
  },

  isLogged(callback) {
    return new Promise((resolve, reject) => {
      DM.getLoginStatus( (response) => {
        if (response.session) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  },

  isFollowing() {
    let url = '/me/following/' + this.props.xid;
    return this.call('get', url)
      .then((res) => {
        if( res.list.length ) {
          return true;
        } else {
          return false;
        }
      });
  },

  onLogged() {

    this.fetchCount();
    this.isFollowing().then( (isFollowing) => {

      this.setState({
        authenticated: true,
        isFollowing: isFollowing
      });

    });

  },

  fetchCount() {
    let url = '/user/me';
    let data = {
      fields: ['fans_total']
    };
    return this.call('get', url, data)
        .then((res) => {
          let fans_total = formatNumber(res.fans_total,2);
          this.setState({ fans_total: fans_total });
          return fans_total;
        });
  },

  follow() {
    this.setState({
      isFollowing: true,
      hover: false,
      fans_total: this.state.fans_total + 1
    });
    let url = '/me/following/' + this.props.xid
    return this.call('post', url)
            .then((res) => {
              return res;
            })
            .catch((res) => {
              console.error('Error while follow');
              this.setState({ isFollowing: false });
              return res;
            });
  },

  unfollow() {
    this.setState({
      isFollowing: false,
      fans_total: this.state.fans_total - 1
    });
    let url = '/me/following/' + this.props.xid
    return this.call('delete', url)
            .then((res) => {
              return res;
            })
            .catch((res) => {
              console.error('Error while follow');
              this.setState({ isFollowing: true });
              return res;
            });
  },

  onMouseEnter() {
    this.setState({ hover: true });
  },

  onMouseOut() {
    this.setState({ hover: false });
  },

  render() {

    // console.log(this.state)

    let text = 'Follow',
        onclick = null,
        dmFollowClass = 'dm-follow ';

    switch( this.state.authenticated ) {
      case true:
        if( this.state.isFollowing ) {
          dmFollowClass += 'dm-follow--unfollow ';
          onclick = this.unfollow;
          text = this.state.hover ? 'Unfollow ' : 'Following' ;
        } else {
          dmFollowClass += 'dm-follow--follow ';
          onclick = this.follow;
        }
        break;
      case false:
        dmFollowClass += 'dm-follow--follow ';
        onclick = this.props.onLogin.bind(null,this.onLogged);
        break;
    }

    // We hide if not auth OR we dont know if following or not yet
    if( this.state.authenticated === null || (this.state.authenticated && this.state.isFollowing === null) )
      dmFollowClass += 'hidden ';

    if( this.state.hover )
      dmFollowClass += 'active ';

    let countActive;
    if( this.state.fans_total !== null && this.state.fans_total !== 0 )
      countActive = 'active';

    return (
      <div className={dmFollowClass}  >
        <button
          className="btn dm-follow__btn"
          onClick={onclick}
          onMouseEnter={this.onMouseEnter}
          onMouseOut={this.onMouseOut}
        >{text}</button>
        <p className={"dm-follow__count " + countActive} >{this.state.fans_total}</p>
      </div>
    );

  }

});

global.DailymotionFollow = DailymotionFollow;
export default DailymotionFollow;