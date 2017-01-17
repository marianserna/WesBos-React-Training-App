import React from 'react';
import { getFunName } from '../helpers';

class StorePicker extends React.Component {
  // constructor() {
  //   super();
  //   this.goToStore = this.goToStore.bind(this);
  // }

  goToStore(e) {
    e.preventDefault();
    //Grab text from box
    const storeId = this.storeInput.value;
    //Transition to / to /store/:storeid
    this.context.router.transitionTo(`/store/${storeId}`);
  }
  render() {
    return (
      <form className="store-selector" onSubmit={(e) => {this.goToStore(e)}}>
        <h2>Please Enter A Store</h2>
        <input type="text" required placeholder="Store Name" defaultValue={getFunName()} ref={(input) => {this.storeInput = input}}/>
        <button type="submit">Visit Store</button>
      </form>
    )
  }
}

// Provides access to router to be able to use Transition to
StorePicker.contextTypes = {
  router: React.PropTypes.object
}

export default StorePicker;
