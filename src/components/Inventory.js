import React, { Component } from 'react';
import AddFishForm from './AddFishForm';
import base from '../base';

class Inventory extends Component {
   state={
      uid:null,
      onwer: null
   };

   componentDidMount() {
      base.onAuth(user => {
         if(user) {
            this.authHandler(null, {user});
         }
      });
   }
   
   handleChange = (e, key) => {
      const fish = this.props.fishes[key];
      const updatedFish = {
         ...fish,
         [e.target.name]: [e.target.value]
      };
      this.props.updateFish(key, updatedFish);
   };

   renderLogin = () => {
      return (
         <nav className="login">
            <h2>Inventory</h2>
            <p>Sign in to Manage your store's inventory</p>
            <button className="github" onClick={()=>this.authenticate('github')}>Log In With Github</button>
            <button className="facebook" onClick={()=>this.authenticate('facebook')}>Log In With Facebook</button>
            <button className="twitter" onClick={()=>this.authenticate('twitter')}>Log In With Twitter</button>
         </nav>
      );
   };

   renderInventory = (key) => {
      const fish = this.props.fishes[key];
      return (
         <div className="fish-edit" key={key}>
            <input onChange={e=>this.handleChange(e, key)} type="text" name="name" value={fish.name} placeholder="Fish Name"/>
            <input onChange={e=>this.handleChange(e, key)} type="text" name="price" value={fish.price} placeholder="Fish Price"/>
            <select onChange={e=>this.handleChange(e, key)} type="text" name="status" value={fish.status} placeholder="Fish Status">
               <option value="available">Fresh !</option>
               <option value="unavailable">Sold Out !</option>
            </select>
            <textarea onChange={e=>this.handleChange(e, key)} name="desc" value={fish.desc} placeholder="Fish Desc"></textarea>
            <input onChange={e=>this.handleChange(e, key)} type="text" name="image" value={fish.image} placeholder="Fish Image"/>
            <button onClick={()=>this.props.removeFish(key)}>Remove Fish</button>
         </div>
      );
   };

   authenticate = (provider) => {
      console.log(`Try to login with ${provider}`);
      base.authWithOAuthPopup(provider,this.authHandler);
   };

   logout = () => {
      base.unauth();
      this.setState({
         uid: null
      })
   };

   authHandler = (err, authData) => {
      if(err) {
         console.error(err);
         return;
      }
      // grab the store info
      const storeRef = base.database().ref(this.props.storeId);
      // query the firebase once for the store data
      storeRef.once('value', snapshot => {
         const data = snapshot.val() || {};
         if(!data.owner) {
            storeRef.set({
               owner: authData.user.uid
            });
         }
         this.setState({
            uid: authData.user.uid,
            owner: data.owner || authData.user.uid
         });
      })
   };

   render() {
      const logout = <button onClick={this.logout}>Log Out!</button>
      if(!this.state.uid){
         return <div>{this.renderLogin()}</div>
      }
      if(this.state.uid !== this.state.owner) {
         return (
            <div>
               <p>Sorry you aren't the owner of this store ! </p>
               {logout}
            </div>
         );
      }
      return (
         <div>
            <h2>Inventory</h2>
            {logout}
            {Object.keys(this.props.fishes).map(this.renderInventory)}
            <AddFishForm addFish={this.props.addFish}/>
            <button onClick={this.props.loadSamples}>Load Sample Fishes</button>
         </div>
      );
   }
   static propTypes = {
      updateFish: React.PropTypes.func.isRequired,
      removeFish: React.PropTypes.func.isRequired,
      fishes: React.PropTypes.object.isRequired,
      addFish: React.PropTypes.func.isRequired,
      loadSamples: React.PropTypes.func.isRequired,
      storeId: React.PropTypes.string.isRequired,
   };
}

export default Inventory;