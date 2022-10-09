import { useGoogleLogin } from '@react-oauth/google';
import { Button } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import EncVnAuthProvedor from '../integracao/EncVnAuthProvedor';
import { IUsuarioGoogle } from '../modelos/importarBack/IUsuarioGoogle';

interface UserObj {
    access_token: string;
    expires_in: number;
}

interface PropsGoogleauthBotao {
    encVnAuthProvedor: EncVnAuthProvedor
}

const GoogleAuthBotao = (props: PropsGoogleauthBotao) => {
    const navigate = useNavigate()
    const onSuccessLogin = async ({ access_token, expires_in }: UserObj) => {
        const userInfo = await fetch(process.env.REACT_APP_GOOGLE_USER_INFO_ENDPOINT as string, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        }).then(res => res.json())

        await props.encVnAuthProvedor.entrarUsuarioGoogle(userInfo as IUsuarioGoogle); // é a persistência no banco
        // localStorage.setItem('user', JSON.stringify({ ...(userInfo as object), expires_in })) // o localStorage ja foi setado dentro do metodo entrarUsuarioGoogle()
        navigate('/')
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