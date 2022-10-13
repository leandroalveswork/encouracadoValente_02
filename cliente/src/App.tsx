import './App.css';
import TelaJogo from './view/TelaJogo'
import Home from './view/Home'
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
  Routes,
} from "react-router-dom";
import Entrar from './view/auth/Entrar';
import { GoogleOAuthProvider } from '@react-oauth/google';
import IndexLoja from './view/loja/IndexLoja';
import AdicionarTema from './view/loja/AdicionarTema';
import Header from './components/Header'
import Footer from './components/Footer'

function App() {
      //TODO: Não disponibilizar chaves sensíveis no arquivo .env quando commitar o código . Sofrerão replace no processo de CI
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID as string}> 
      <Header />
      <Routes>
      <Route path="/auth/entrar" element={<Entrar />} />
        <Route path="/loja" element={<IndexLoja />} />
        <Route path="/loja/adicionarTema" element={<AdicionarTema />} />
        <Route path="/" element={<Home />} />
        <Route path="/game/:roomId" element={<TelaJogo backendUrl={`ws://${process.env.REACT_APP_url_do_servidor_backend as string}/room`} />} />
      </Routes>
      <Footer />
    </GoogleOAuthProvider>
  )
}

export default App;
