import './App.css';
import TelaJogo from './view/TelaJogo'
import Home from './view/Home'
import {
  Route,
  Routes,
} from "react-router-dom";
import Entrar from './view/auth/Entrar';

import IndexLoja from './view/loja/IndexLoja';
import AdicionarTema from './view/loja/AdicionarTema';
import DetalheTema from './view/loja/DetalheTema';
import Header from './components/Header';
import Footer from './components/Footer';
import PreparacaoJogo from './view/PreparacaoJogo';
import Perfil from './view/auth/Perfil';
import ProtectedRoute from './routes/ProtectedRoute';
import { useState } from "react";
import UserState from "./integracao/UserState";
import ListagemSalas from "./view/ListagemSalas"

function App() {
  const userState = new UserState();
  
  const [username, setUsername] = useState(userState.localStorageUser?.nome ?? '');
  
  //TODO: Não disponibilizar chaves sensíveis no arquivo .env quando commitar o código . Sofrerão replace no processo de CI
  return (
    <>
      <Header username={username} />
      <div className='app'>
        <Routes>
          <Route path="/auth/entrar" element={<Entrar />} />,
          <Route path="/loja" element={<ProtectedRoute><IndexLoja /></ProtectedRoute>} />,
          <Route path="/loja/adicionarTema" element={<ProtectedRoute><AdicionarTema /></ProtectedRoute>} />,
          <Route path="/loja/detalheTema" element={<ProtectedRoute><DetalheTema /></ProtectedRoute>} />,
          <Route path="/" element={<Home />} />,
          <Route path="/game/:roomId" element={<ProtectedRoute><TelaJogo backendUrl={`ws://${process.env.REACT_APP_url_do_servidor_backend as string}/room`} /></ProtectedRoute>} />,
          <Route path="/game/prepare" element={<ProtectedRoute><PreparacaoJogo/></ProtectedRoute> } />,
          <Route path="/perfil" element={<ProtectedRoute><Perfil setUsername={setUsername} /></ProtectedRoute> } />,
          <Route path="/salas" element={<ProtectedRoute><ListagemSalas/></ProtectedRoute>} />,
        </Routes>
      </div>
      {/* <Footer /> */} 
    </>
  )
}

export default App;
