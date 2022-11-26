import { useGoogleLogin } from '@react-oauth/google';
import { Button } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import { IUsuarioGoogle } from '../modelos/importarBack/IUsuarioGoogle';
import ClientRest from '../integracao/ClientRest';
import { MdUsuarioLogado } from '../modelos/importarBack/MdUsuarioLogado';
import UserState from '../integracao/UserState';

interface UserObj {
    access_token: string;
    expires_in: number;
}

const GoogleAuthBotao = () => {
    const navigate = useNavigate();

    const userState = new UserState();
    const clientRest = new ClientRest();

    const onSuccessLogin = async ({ access_token, expires_in }: UserObj) => {
        const userInfo = await fetch(process.env.REACT_APP_GOOGLE_USER_INFO_ENDPOINT as string, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        }).then(res => res.json())

        const respostaApi = await clientRest.callPost<MdUsuarioLogado>('/api/autorizacao/entrarUsuarioGoogle', userInfo as IUsuarioGoogle, new MdUsuarioLogado());
        if (respostaApi.eOk) {
            userState.localStorageUser = respostaApi.body;
            navigate('/')

            window.location.reload()
        }
    }

    const login = useGoogleLogin({
        onSuccess: onSuccessLogin,
        onError: (err) => console.log(err),
    })

    return (
        <Button variant="outlined" size="medium" className="mt-4" sx={{ width: 200 }} onClick={() => login()}>Entrar com google</Button>
    )
}

export default GoogleAuthBotao