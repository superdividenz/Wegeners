import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

// Import your components
import Header from './components/Header';
import Footer from './components/Footer';

// Import your screen components
import Dashboard from './screens/Dashboard';
import GigManagement from './screens/GigManagement';
import MemberDirectory from './screens/MemberDirectory';
import EquipmentInventory from './screens/EquipmentInventory';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Header />
        
        <main className="flex-grow container mx-auto px-6 py-8">
          <Switch>
            <Route exact path="/" component={Dashboard} />
            <Route path="/gigs" component={GigManagement} />
            <Route path="/members" component={MemberDirectory} />
            <Route path="/equipment" component={EquipmentInventory} />
          </Switch>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;