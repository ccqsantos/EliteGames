import Login from "./pages/Login";
import Join from "./pages/Join";
import About from "./components/home/GuaranteeSection.jsx";
import Categories from "./components/home/Categories.jsx";
import { Routes, Route } from 'react-router-dom';
import Layout from "./components/Layout";
import Profile from "./pages/Profile";
import Offers from "./pages/Offers.jsx";
import Shop from "./pages/Shop.jsx";
import DeleteProfile from "./pages/DeleteProfile.jsx";
import ClientPreferences from "./pages/ClientPreferences.jsx";
import Services from "./components/home/BestSellers.jsx";
import Deliver from "./components/home/PromoBanner.jsx";
import TrendingProducts from "./components/home/TrendingProducts.jsx";
import HeroSection from "./components/home/HeroSection.jsx";
import Home from "./pages/Home.jsx";


function App() {

  return (
    <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="join" element={<Join />} />
          <Route path="hero-section" element={<HeroSection />} />
          <Route path="login" element={<Login />} />
          <Route path="profile" element={<Profile />} />x
          <Route path="trending-products" element={<TrendingProducts />} />
          <Route path="offers" element={<Offers />} />
          <Route path="help" element={<Categories />} />
          <Route path="shop" element={<Shop />} />
          <Route path="client-preferences" element={<ClientPreferences />} />
          <Route path="about" element={<About />} />
          <Route path="delete-profile" element={<DeleteProfile />} />
          <Route path="services" element={<Services />} />
          <Route path="deliver/:orderId" element={<Deliver/> } />
      </Route>
    </Routes>
  );
}

export default App;