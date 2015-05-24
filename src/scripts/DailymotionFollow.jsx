let React = global.React || require('react');

let formatNumber = function(number, decPlaces) {var abbrev, i, size; if (decPlaces == null) {decPlaces = 1; } decPlaces = Math.pow(10, decPlaces); abbrev = ["k", "m", "b", "t"]; i = abbrev.length - 1; while (i >= 0) {size = Math.pow(10, (i + 1) * 3); if (size <= number) {number = Math.round(number * decPlaces / size) / decPlaces; if ((number === 1000) && (i < abbrev.length - 1)) {number = 1; i++; } number += abbrev[i]; break; } i--; } return number; };

let DailymotionFollow = React.createClass({

  getDefaultProps() {
    return {
      count: true
    };
  },

  getInitialState(){
    return {
      authenticated: null,
      isFollowing: null,
      hover: false,
      fans_total: null
    };
  },

  componentDidMount() {
    // TODO : Import Dailymotion JS SDK if no DM
    if( typeof DM === 'undefined' ) console.error('Error: You must import Dailymotion javascript SDK.');

    this.isLogged().then((isLogged) => {
      if( isLogged ) this.onLogged();
      this.setState({
        authenticated: isLogged
      });
    });
  },

  componentDidUpdate(prevProps, prevState) {
    if( prevProps.xid !== this.props.xid ) {
      this.onLogged();
    }
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

  onLogged() {

    if( this.props.count ) this.fetchCount();
    this.isFollowing().then( (isFollowing) => {

      this.setState({
        authenticated: true,
        isFollowing: isFollowing
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

  fetchCount() {
    let url = '/user/' + this.props.xid;
    let data = {
      fields: ['fans_total']
    };
    return this.call('get', url, data)
        .then((res) => {
          let fans_total = res.fans_total;
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
              this.setState({
                isFollowing: false,
                fans_total: this.state.fans_total + 1
              });
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
              this.setState({
                isFollowing: true,
                fans_total: this.state.fans_total + 1
              });
              return res;
            });
  },

  onMouseEnter() {
    this.setState({ hover: true });
  },

  onMouseOut() {
    this.setState({ hover: false });
  },

  onClick() {
    if( !this.state.authenticated ) {
      this.props.onLogin(this.onLogged);
    } else {
      this.state.isFollowing ? this.unfollow() : this.follow();
    }
  },

  render() {

    let text = 'Follow',
        dmFollowClass = 'dm-follow ';

    switch( this.state.authenticated ) {
      case true:
        if( this.state.isFollowing ) {
          dmFollowClass += 'dm-follow--unfollow ';
          text = this.state.hover ? 'Unfollow ' : 'Following' ;
        } else {
          dmFollowClass += 'dm-follow--follow ';
        }
        break;
      case false:
        dmFollowClass += 'dm-follow--follow ';
        break;
    }

    // We hide if not auth OR we dont know if following or not yet
    if( this.state.authenticated === null || (this.state.authenticated && this.state.isFollowing === null) )
      dmFollowClass += 'hidden ';

    if( this.state.hover )
      dmFollowClass += 'active ';

    let countActive;
    if( this.state.fans_total !== null && this.state.fans_total !== 0 && this.props.count )
      countActive = 'active';

    return (
      <div className={dmFollowClass}  >
        <button
          className="btn dm-follow__btn"
          onClick={this.onClick}
          onMouseEnter={this.onMouseEnter}
          onMouseOut={this.onMouseOut}
        >{text}</button>
        <p className={"dm-follow__count " + countActive} >{formatNumber(this.state.fans_total,2)}</p>
      </div>
    );

  }

});

global.DailymotionFollow = DailymotionFollow;
export default DailymotionFollow;