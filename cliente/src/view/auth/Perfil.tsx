import { Box, Button, Dialog, DialogActions, DialogContent, InputAdornment, styled, Tab, Tabs, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ErroModal from '../../components/erroModal/ErroModal';
import SucessoModal from '../../components/sucessoModal/SucessoModal';
import ClientRest from '../../integracao/ClientRest';
import UserState from '../../integracao/UserState';
import { MdDetalheNavioTema } from '../../modelos/importarBack/MdDetalheNavioTema';
import { MdDetalheTema } from '../../modelos/importarBack/MdDetalheTema';
import { PostNovoTema } from '../../modelos/importarBack/PostNovoTema';
import { PutNavioTema } from '../../modelos/importarBack/PutNavioTema';
import { PutTema } from '../../modelos/importarBack/PutTema';
import { PutUpdateUsuario } from '../../modelos/importarBack/PutUpdateUsuario';
import { UtilNumber } from '../../util/UtilNumber';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

const EncVnTextField = styled(TextField)({
    '& input + fieldset': {
        outerWidth: 340,
        borderColor: '#505050',
        borderWidth: 2,
    }
});

interface PerfilProps {
    setUsername: React.Dispatch<React.SetStateAction<string>>
}

const Perfil = (props: PerfilProps) => {
    const navigate = useNavigate();

    const userState = new UserState();
    const clientRest = new ClientRest();

    const [nome, setNome] = useState(userState.localStorageUser?.nome ?? '');
    const [eAlteracaoSenha, setEAlteracaoSenha] = useState(false);
    const [senhaAnterior, setSenhaAnterior] = useState('');
    const [senhaNova, setSenhaNova] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [erroEstaAberto, setErroEstaAberto] = useState(false);
    const [problemaErro, setProblemaErro] = useState('');
    const [sucessoAlteracaoEstaAberto, setSucessoAlteracaoEstaAberto] = useState(false);

    const handleClickSalvar = async () => {
        // const tryIdTema = searchParams.get('id');
        
        // Validaçao
        if (senhaNova !== confirmarSenha && eAlteracaoSenha) {
            setProblemaErro(_ => 'A nova senha e confirmar senha divergem.');
            setErroEstaAberto(_ => true);
            return;
        }
        
        // Montar formulario e enviar para api
        let usuarioAlterado = new PutUpdateUsuario();
        usuarioAlterado.nome = nome;
        usuarioAlterado.eAlteracaoSenha = eAlteracaoSenha;
        usuarioAlterado.senhaAnterior = senhaAnterior;
        usuarioAlterado.senhaNova = senhaNova;
        let rAlteracao = await clientRest.callPutAutorizado<undefined>('/api/autorizacao/updateUsuario', usuarioAlterado, undefined);
        
        // tratar a resposta
        if (rAlteracao.eOk) {
            setSucessoAlteracaoEstaAberto(_ => true);
            // fazer mudanças no usuario logado salvo
            let userToChange = userState.localStorageUser;
            if (userToChange == null)
                return;
            userToChange.nome = nome;
            userState.localStorageUser = userToChange;
            props.setUsername(_ => nome);
        } else {
            setProblemaErro(_ => rAlteracao.problema);
            setErroEstaAberto(_ => true);
        }
    }

    return (
        <>
            <h1 style={{color: 'white', fontFamily: 'bungee', textAlign: 'center', marginTop: '16px' }}>Perfil</h1>

            <Box className='box'>
                    <div className="row g-0">
                        <EncVnTextField label="Nome" variant="outlined" className="mt-4" sx={{ width: 350 }} onChange={ev => setNome(_ => ev.target.value)} value={nome} />
                    </div>
                    <div className="row g-0">
                        <EncVnTextField label="Saldo Atual" type="number" variant="outlined" className="mt-4" sx={{ width: 350 }} value={'' + userState.localStorageUser?.creditos ?? '0'} disabled
                            InputProps={{
                                startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                            }} />
                    </div>
                    
                    {!(userState.localStorageUser?.eUsuarioGoogle ?? true) && <FormGroup>
                        <FormControlLabel control={<Checkbox onChange={ev => setEAlteracaoSenha(_ => ev.target.checked) } checked={eAlteracaoSenha} />} label="Alterar a senha" />
                    </FormGroup>}
                    
                    {!(userState.localStorageUser?.eUsuarioGoogle ?? true) && eAlteracaoSenha && <>
                        <div className="row g-0">
                            <EncVnTextField label="Senha Anterior" type="password" variant="outlined" className="mt-4" sx={{ width: 350 }} onChange={ev => setSenhaAnterior(_ => ev.target.value)} value={senhaAnterior} />
                        </div>
                        <div className="row g-0">
                            <EncVnTextField label="Senha Nova" type="password" variant="outlined" className="mt-4" sx={{ width: 350 }} onChange={ev => setSenhaNova(_ => ev.target.value)} value={senhaNova} />
                        </div>
                        <div className="row g-0">
                            <EncVnTextField label="Confirmar Senha" type="password" variant="outlined" className="mt-4" sx={{ width: 350 }} onChange={ev => setConfirmarSenha(_ => ev.target.value)} value={confirmarSenha} />
                        </div>
                    </>}
                <div className="row g-0">
                    <div className="col-6" style={{marginTop: '10px'}}>
                        <Button size="medium" onClick={() => window.history.back()}>Voltar</Button>
                    </div>
                    <div className="col-6" style={{marginTop: '10px'}}>
                        <Button size="medium" variant="contained" onClick={() => handleClickSalvar()}>Salvar</Button>
                    </div>

                </div>
            </Box>

            {/* Mensagens de sucesso e erro */}
            <SucessoModal estaAberto={sucessoAlteracaoEstaAberto} onFechar={() => navigate('/')} mensagem='Usuario alterado com sucesso!' />
            <ErroModal estaAberto={erroEstaAberto} onFechar={() => setErroEstaAberto(_ => false)} problema={problemaErro} />
        </>
    )
}


export default Perfil