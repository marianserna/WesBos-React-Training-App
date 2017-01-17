import React from 'react';
import Header from './Header';
import Order from './Order';
import Inventory from './Inventory';
import Fish from './Fish';
import sampleFishes from '../sample-fishes';
import base from '../base';

class App extends React.Component {
  constructor() {
    super();
    // this.addFish = this.addFish.bind(this);
    // this.loadSamples = this.loadSamples.bind(this);
    // this.addToOrder = this.addToOrder.bind(this);
    // this.removeFromOrder = this.removeFromOrder.bind(this);
    // this.updateFish = this.updateFish.bind(this);
    // this.removeFish = this.removeFish.bind(this);
    // get initial state
    this.state = {
      fishes: {},
      order: {}
    };
  }

  static propTypes = {
    params: React.PropTypes.object.isRequired
  };

  componentWillMount() {
    // componentWillMount runs before the <App> is rendered
    this.ref = base.syncState(
      `${this.props.params.storeId}/fishes`,
      {
        context: this,
        state: 'fishes'
      }
    );

    // Check if there is any order in LS
    const localStorageRef = localStorage.getItem(`order-${this.props.params.storeId}`);

    if (localStorageRef) {
      //  Update app component's order state
      this.setState({order : JSON.parse(localStorageRef)})
    }
  }

  componentWillUnmount() {
    base.removeBinding(this.ref);
  }

  componentWillUpdate(nextProps, nextState) {
    localStorage.setItem(`order-${this.props.params.storeId}`,
      JSON.stringify(nextState.order));
  }

  addFish = (fish) => {
    //Update state: Create a copy of object
    const fishes = {...this.state.fishes};
    //Add new fish
    const timestamp = Date.now();
    fishes[`fish-${timestamp}`] = fish;
    //Set state
    this.setState({ fishes });
  };

  updateFish = (key, updatedFish) => {
    const fishes = {...this.state.fishes};
    fishes[key] = updatedFish;
    this.setState({fishes});
  };

  removeFish = (key) => {
    const fishes = {...this.state.fishes};
    // delete fishes[key] doesnt work with firebase, you need to do:
    fishes[key] = null;
    this.setState({fishes});
  };

  addToOrder = (key) => {
    //Take a copy of order
    const order = {...this.state.order};
    //Update or add the new number of fish ordered
    order[key] = order[key] + 1 || 1;
    //Update State
    this.setState({ order });
  };

  removeFromOrder = (key) => {
    const order = {...this.state.order};
    delete order[key];
    this.setState({order});
  };

  loadSamples = () => {
    this.setState({
      fishes: sampleFishes
    });
  };

  render() {
    return (
      <div className="catch-of-the-day">
        <div className="menu">
          <Header tagline="Fresh Seafood Market"/>
          <ul className="list-of-fishes">
            {/* loop thru fish: you first need an array and then use map (standard way to loop in React) */}
            {
              Object.keys(this.state.fishes)
                .map(key => <Fish key={key} index={key} details={this.state.fishes[key]} params={this.props.params} addToOrder={this.addToOrder} />)
            }
          </ul>
        </div>
        <Order
          fishes={this.state.fishes}
          order={this.state.order}
          removeFromOrder={this.removeFromOrder}
        />
        {/* Params come from the router we're using */}
        <Inventory
          addFish={this.addFish}
          loadSamples={this.loadSamples}
          fishes={this.state.fishes}
          updateFish={this.updateFish}
          removeFish={this.removeFish}
          storeId={this.props.params.storeId}
        />
      </div>
    )
  }
}

export default App;
