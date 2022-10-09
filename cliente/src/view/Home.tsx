import EncVnAuthProvedor from '../integracao/EncVnAuthProvedor'
import {IUsuarioAutenticadoProps} from '../interfaces/IUsuarioAutenticado'

const Home = () => {
    const encVnAuthProvedor = new EncVnAuthProvedor();
    return (
        <>
            <h1>{`Olá usuário: ${encVnAuthProvedor.usuarioLogado?.nome ?? 'indefinido'}`}</h1>
        </>
    )
}


export default Home