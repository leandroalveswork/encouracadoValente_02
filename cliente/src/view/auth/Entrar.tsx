import { Button, Card, CardActions, CardContent, styled, TextField } from "@mui/material";
import ErroModal from "../../components/erroModal/ErroModal";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import GoogleAuthBotao from '../../components/GoogleAuthBotao';
import "./Entrar.css";
import EncVnAuthProvedor from "../../integracao/EncVnAuthProvedor";
import { PostCadastroUsuario } from "../../modelos/importarBack/PostCadastroUsuario";
import { PostLoginUsuario } from "../../modelos/importarBack/PostLoginUsuario";

const EncVnTextField = styled(TextField)({
    '& input + fieldset': {
        outerWidth: 340,
        borderColor: '#505050',
        borderWidth: 2,
    }
});

interface PropsEntrar {
    encVnAuthProvedor: EncVnAuthProvedor
}

const Entrar = (props: PropsEntrar) => {

    const navigate = useNavigate();

    const [erroEstaAberto, setErroEstaAberto] = useState(false);
    const [problemaErro, setProblemaErro] = useState('');
    const handleFecharErro = () => {
        setErroEstaAberto(_ => false);
    }

    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    const handleChangeEmail = (arg: string) => {
        setEmail(_ => arg);
    }
    const handleChangeSenha = (arg: string) => {
        setSenha(_ => arg);
    }
    const handleClickEntrarUsuarioEncVn = async () => {
        let loginUsuario = new PostLoginUsuario();
        loginUsuario.email = email;
        loginUsuario.senha = senha;
        let respostaLogin = await props.encVnAuthProvedor.entrarUsuarioEncVn(loginUsuario);
        if (respostaLogin.eOk) {
            navigate('/');
        } else {
            setProblemaErro(_ => respostaLogin.problema);
            setErroEstaAberto(_ => true);
        }
    }
    const [eTelaEntrar, setETelaEntrar] = useState(true);
    const handleClickCriarConta = () => {
        setETelaEntrar(_ => false);
    }

    const [nomeCadastro, setNomeCadastro] = useState('');
    const [emailCadastro, setEmailCadastro] = useState('');
    const [senhaCadastro, setSenhaCadastro] = useState('');

    const handleChangeNomeCadastro = (arg: string) => {
        setNomeCadastro(_ => arg);
    }
    const handleChangeEmailCadastro = (arg: string) => {
        setEmailCadastro(_ => arg);
    }
    const handleChangeSenhaCadastro = (arg: string) => {
        setSenhaCadastro(_ => arg);
    }
    const handleClickCriarContaCadastro = async () => {
        let cadastroUsuario = new PostCadastroUsuario();
        cadastroUsuario.nome = nomeCadastro;
        cadastroUsuario.email = emailCadastro;
        cadastroUsuario.senha = senhaCadastro;
        let respostaCadastro = await props.encVnAuthProvedor.cadastrarUsuarioEncVn(cadastroUsuario);
        if (respostaCadastro.eOk) {
            navigate('/');
        } else {
            setProblemaErro(_ => respostaCadastro.problema);
            setErroEstaAberto(_ => true);
        }
    }
    const handleClickJaTenhoContaCadastro = () => {
        setETelaEntrar(_ => true);
    }

    return (
        <div className='fundo-entrar'>
            <div className="fundo-frente-entrar">

                <div className='titulo-wrapper'>
                    <h1>ENCOURAÇADO VALENTE</h1>
                </div>
                <div className="row g-0">
                    <div className="col-6">
                    </div>
                    <div className="col-6 pe-3">
                        {eTelaEntrar ?
                            <Card>
                                <CardContent>
                                    <h3 className="subtitulo">ENTRAR</h3>
                                    <div className="d-flex flex-column align-items-center">
                                        <EncVnTextField label="Email" variant="outlined" className="mt-4" sx={{ width: 350 }} onChange={ev => handleChangeEmail(ev.target.value)} value={email} />
                                        <EncVnTextField label="Senha" type="password" variant="outlined" className="mt-4" sx={{ width: 350 }} onChange={ev => handleChangeSenha(ev.target.value)} value={senha} />
                                        <Button variant="contained" size="medium" className="mt-4" sx={{ width: 200 }} onClick={() => handleClickEntrarUsuarioEncVn()}>Entrar</Button>
                                        <GoogleAuthBotao encVnAuthProvedor={props.encVnAuthProvedor} />
                                    </div>
                                </CardContent>
                                <CardActions>
                                    <Button size="medium" onClick={() => handleClickCriarConta()}>Criar uma nova conta</Button>
                                </CardActions>
                            </Card> :
                            <Card>
                                <CardContent>
                                    <h3 className="subtitulo">CADASTRAR</h3>
                                    <div className="d-flex flex-column align-items-center">
                                        <EncVnTextField label="Nome" variant="outlined" className="mt-4" sx={{ width: 350 }} onChange={ev => handleChangeNomeCadastro(ev.target.value)} value={nomeCadastro} />
                                        <EncVnTextField label="Email" variant="outlined" className="mt-4" sx={{ width: 350 }} onChange={ev => handleChangeEmailCadastro(ev.target.value)} value={emailCadastro} />
                                        <EncVnTextField label="Senha" type="password" variant="outlined" className="mt-4" sx={{ width: 350 }} onChange={ev => handleChangeSenhaCadastro(ev.target.value)} value={senhaCadastro} />
                                        <Button variant="contained" size="medium" className="mt-4" sx={{ width: 200 }} onClick={() => handleClickCriarContaCadastro()}>Criar a conta</Button>
                                    </div>
                                </CardContent>
                                <CardActions>
                                    <Button size="medium" onClick={() => handleClickJaTenhoContaCadastro()}>Já tenho uma conta</Button>
                                </CardActions>
                            </Card>}
                    </div>
                </div>
                <ErroModal estaAberto={erroEstaAberto} onFechar={handleFecharErro} problema={problemaErro} />
            </div>
        </div>
    )
}

export default Entrar