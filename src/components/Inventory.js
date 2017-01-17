import React from 'react';
import AddFishForm from './AddFishForm';
import base from '../base.js';

class Inventory extends React.Component {
  constructor() {
    super();
    // this.renderInventory = this.renderInventory.bind(this);
    // this.handleChange = this.handleChange.bind(this);
    // this.findFish = this.findFish.bind(this);
    // this.renderLogin = this.renderLogin.bind(this);
    // this.authenticate = this.authenticate.bind(this);
    // this.authHandler = this.authHandler.bind(this);
    // this.logout = this.logout.bind(this);

    this.state = {
      uid: null,
      owner: null
    }
  }

  static propTypes = {
    fishes: React.PropTypes.object.isRequired,
    updateFish: React.PropTypes.func.isRequired,
    removeFish: React.PropTypes.func.isRequired,
    addFish: React.PropTypes.func.isRequired,
    loadSamples: React.PropTypes.func.isRequired,
    storeId: React.PropTypes.string.isRequired
  };

  componentDidMount() {
    base.onAuth((user) => {
      if(user) {
        // We're using authHandler(err, authData). {user} is the auth data of the user who is currently authenticated. {user} is a short form for {user: user} because key & value are the same
        this.authHandler(null, { user });
      }
    });
  }

  findFish = (key) => {
    return this.props.fishes[key];
  };

  handleChange = (e, key) => {
    const fish = this.findFish(key);
    // take a copy of fish AND update with new data
    const updatedFish = {
      ...fish,
      [e.target.name]: e.target.value
    };
    this.props.updateFish(key, updatedFish);
  };

  renderLogin = () => {
    return (
      <nav className="login">
        <h2>Inventory</h2>
        <p>Sign in to manage your store's inventory</p>
        <button className="github" onClick={() => this.authenticate('github')}>
          Log In with GitHub
        </button>
        <button className="facebook" onClick={() => this.authenticate('facebook')}>
          Log In with Facebook
        </button>
        <button className="twitter" onClick={() => this.authenticate('twitter')}>
          Log In with Twitter
        </button>
      </nav>
    )
  };

  authenticate = (provider) => {
    console.log(`trying to log in with ${provider}`);
    // This function comes with rebase. Provider is passed in the renderLogin this.authenticate
    // the authHandler is a callback that will be called after the user has authenticated
    base.authWithOAuthPopup(provider, this.authHandler);

  }

  logout = () => {
    // Log person out of Firebase. unauth is a rebase function
    base.unauth();
    this.setState({uid: null});
  };

  authHandler = (err, authData) => {
    console.log(authData);
    if (err) {
      console.error(err);
      return;
    }

    //Grab store info
    //base.database connects us directly to our Firebase database
    // if i'd be doing my own backend I'd have to create my own endpoint which will return all the info and then do a fetch call to receive the store information. Firebase goes directly to the database
    // ref will allow us to get just a piece of our DB: Go to app
    const storeRef = base.database().ref(this.props.storeId);

    // Query the Firebase once for the store database
    storeRef.once('value', (snapshot) => {
      // snapshot allows you to view what's in your DB. It allows you to call the val function that returns an object of whatever is in your DB. We want to see if user that just logged in is the owner || if the store doensn't have an owner, makes the current user who's logged in the owner
      const data = snapshot.val() || {};

      // Claim it as our own if not owner already
      if(!data.owner) {
        storeRef.set({
          owner: authData.user.uid
        });
      }

      this.setState({
        uid: authData.user.uid,
        owner: data.owner || authData.user.uid
      });
    });
  };

  renderInventory = (key) => {
    const fish = this.findFish(key);
    return (
      <div className="fish-edit" key={key}>
        <input name="name" value={fish.name} type="text" placeholder="Fish name" onChange={(e) => this.handleChange(e, key)} />
        <input name="price" value={fish.price} type="text" placeholder="Fish price" onChange={(e) => this.handleChange(e, key)}/>
        <select name="status" value={fish.status} onChange={(e) => this.handleChange(e, key)} >
          <option value="available">Fresh!</option>
          <option value="unavailable">Sold Out!</option>
        </select>
        <textarea name="desc" value={fish.desc}  placeholder="Fish desc" onChange={(e) => this.handleChange(e, key)}></textarea>
        <input name="image" value={fish.image} type="text" placeholder="Fish image" onChange={(e) => this.handleChange(e, key)} />
        <button onClick={() => this.props.removeFish(key)}>Remove Fish</button>
      </div>
    )
  };

  render() {
    // I could do the click event as {this.logout} because I'm not passing any arguments
    const logout = <button onClick={() => this.logout()}>Log Out!</button>;

    // Check if they aren't logged in at all
    if(!this.state.uid) {
      return <div>{this.renderLogin()}</div>
    }

    // Check if they are the owner of the current store
    if(this.state.uid !== this.state.owner) {
      return (
        <div>
          <p>Sorry, you aren't the store owner!!</p>
          {logout}
        </div>
      )
    }

    return (
      <div>
        <h2>Inventory</h2>
        {logout}
        {Object.keys(this.props.fishes).map(this.renderInventory)}
        <AddFishForm addFish={this.props.addFish} />
        <button onClick={this.props.loadSamples}>Load Sample Fishes</button>
      </div>
    )
  }
}

export default Inventory;
