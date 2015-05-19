import React from 'react';

var DailymotionFollow = React.createClass({

  getInitialState(){
    return {
      authenticated: null,
      isFollowing: null
    };
  },

  // componentWillMount() {
    // console.log( this.isFollowing() );
  // },

  componentDidMount() {
    if( typeof DM === 'undefined' ) console.error('Error: You must import Dailymotion javascript SDK.');

    this.isLogged().then((isLogged) => {

      if( isLogged ) this.onLogged();

      this.setState({
        authenticated: isLogged
      });

    });
  },

  get(url, data={}) {
    return new Promise((resolve, reject) => {
      DM.api( url, data, (res) => {
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
    return this.get(url)
      .then((res) => {
        if( res.list.length ) {
          return true;
        } else {
          return false;
        }
      });
  },

  onLogged() {

    this.isFollowing().then( (isFollowing) => {

      this.setState({
        authenticated: true,
        isFollowing: isFollowing
      });

    });

  },

  follow() {
    console.log('follow !');
  },

  unfollow() {
    console.log('unfollow !');
  },

  render() {

    console.log(this.state)

    /*

    let text = 'Follow',
        dmFollowClass = 'dm-follow ';

    if( this.state.authenticated === null ) {

      dmFollowClass += 'hidden';

    } else if( this.state.authenticated ) {

      if( this.state.isFollowing ) {
        dmFollowClass += 'dm-follow--unfollow';
        console.log('3')
        onclick = this.unfollow;
      } else {
        dmFollowClass += 'dm-follow--follow';
        console.log('4')
        onclick = this.follow;
      }

    } else {
      dmFollowClass += 'dm-follow--follow ';
      onclick = this.props.onLogin.bind(null,this.onLogged);
    }
    */

    var text, onclick = null;

    if( this.state.authenticated === null ) {
      onclick = this.follow;
      text = '1'
      console.log(1)
    } else {
      // onclick = this.unfollow;
      onclick = function() {
        console.log('test');
      };
      text = '2'
      console.log(2)
    }

    console.log( onclick )

    return (
      <div className="dm-follow"  >
        <button className="btn dm-follow__btn" onClick={onclick} >{text}</button>
        <p className="dm-follow__count"></p>
      </div>
    );

  }

});

global.DailymotionFollow = DailymotionFollow;
export default DailymotionFollow;