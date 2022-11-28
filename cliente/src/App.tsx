import './App.css';
import TelaJogo from './view/TelaJogo'
import {
  Route,
  Routes,
} from "react-router-dom";
import Entrar from './view/auth/Entrar';

import IndexLoja from './view/loja/IndexLoja';
import IndexMochila from './view/mochila/IndexMochila';
import IndexLiberacao from './view/liberacao/IndexLiberacao';
import AdicionarTema from './view/loja/AdicionarTema';
import DetalheTema from './view/loja/DetalheTema';
import LiberarCreditos from './view/liberacao/LiberarCreditos';
import Header from './components/Header';
import PreparacaoJogo from './view/PreparacaoJogo';
import Perfil from './view/auth/Perfil';
import ProtectedRoute from './routes/ProtectedRoute';
import { useState } from "react";
import UserState from "./integracao/UserState";
import ListagemSalas from "./view/ListagemSalas"
import FinalJogo from './view/FinalJogo';

function App() {
  const userState = new UserState();

  const [username, setUsername] = useState(userState.localStorageUser?.nome ?? '');

  const salasElement = <ListagemSalas tokenAuth={userState.localStorageUser?.token ?? ''}
    rotaWs={(process.env.REACT_APP_url_do_servidor_backend_ws as string) + '/ws'} />

  //TODO: Não disponibilizar chaves sensíveis no arquivo .env quando commitar o código . Sofrerão replace no processo de CIA
  return (
    <>
      <Header username={username} />
      <div className='app'>
        <Routes>
          <Route path="/auth/entrar" element={<Entrar />} />,
          <Route path="/loja" element={<ProtectedRoute><IndexLoja /></ProtectedRoute>} />,
          <Route path="/loja/adicionarTema" element={<ProtectedRoute><AdicionarTema /></ProtectedRoute>} />,
          <Route path="/" element={<ProtectedRoute>{salasElement}</ProtectedRoute>} />,
          <Route path="/loja/detalheTema" element={<ProtectedRoute><DetalheTema /></ProtectedRoute>} />,
          <Route path="/mochila" element={<ProtectedRoute><IndexMochila /></ProtectedRoute>} />,
          {(userState.localStorageUser?.eSuperuser ?? true) &&
          <Route path="/liberacao" element={<ProtectedRoute><IndexLiberacao /></ProtectedRoute>} />},
          {(userState.localStorageUser?.eSuperuser ?? true) &&
          <Route path="/liberacao/liberarCreditos" element={<ProtectedRoute><LiberarCreditos /></ProtectedRoute>} />
          },
          <Route path="/game/prepare/:roomId" element={<ProtectedRoute><PreparacaoJogo
            tokenAuth={userState.localStorageUser?.token ?? ''}
            rotaWs={(process.env.REACT_APP_url_do_servidor_backend_ws as string) + '/ws'} /></ProtectedRoute>} />,
          <Route path="/game/play/:roomId" element={<ProtectedRoute><TelaJogo
            tokenAuth={userState.localStorageUser?.token ?? ''}
            rotaWs={(process.env.REACT_APP_url_do_servidor_backend_ws as string) + '/ws'} /></ProtectedRoute>} />,
          <Route path="/game/end/:ganhou" element={<ProtectedRoute><FinalJogo/></ProtectedRoute>} />,
          <Route path="/perfil" element={<ProtectedRoute><Perfil setUsername={setUsername} /></ProtectedRoute>} />,
          <Route path="/salas" element={<ProtectedRoute>{salasElement}</ProtectedRoute>} />,
        </Routes>
      </div>
    </>
  )
}

export default App;
