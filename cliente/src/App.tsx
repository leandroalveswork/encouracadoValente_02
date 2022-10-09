import './App.css';
import TelaJogo from './view/TelaJogo'
import Home from './view/Home'
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
} from "react-router-dom";
import Entrar from './view/auth/Entrar';
import { GoogleOAuthProvider } from '@react-oauth/google';
import EncVnAuthProvedor from './integracao/EncVnAuthProvedor';

function App() {
  const encVnAuthProvedor = new EncVnAuthProvedor();
  const router =
    createBrowserRouter(
      createRoutesFromElements([
        <Route path="/auth/entrar" element={<Entrar encVnAuthProvedor={encVnAuthProvedor} />} />,
        <Route path="/" element={<Home />} />,
        <Route path="/game/:roomId" element={<TelaJogo backendUrl={`ws://${process.env.REACT_APP_url_do_servidor_backend as string}/room`} />} />,
      ]))
      //TODO: Não disponibilizar chaves sensíveis no arquivo .env quando commitar o código . Sofrerão replace no processo de CI
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID as string}> 
      <RouterProvider router={router} />
    </GoogleOAuthProvider>
  )
}

export default App;
