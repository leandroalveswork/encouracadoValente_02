import { Box, Button, Dialog, DialogActions, DialogContent, styled, Tab, Tabs, TextField, CircularProgress, InputAdornment } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ConfirmacaoModal from '../../components/confirmacaoModal/ConfirmacaoModal';
import ErroModal from '../../components/erroModal/ErroModal';
import SucessoModal from '../../components/sucessoModal/SucessoModal';
import ClientRest from '../../integracao/ClientRest';
import UserState from '../../integracao/UserState';
import { MdDetalheNavioTema } from '../../modelos/importarBack/MdDetalheNavioTema';
import { MdResumoUsuarioLiberavel } from '../../modelos/importarBack/MdResumoUsuarioLiberavel';
import { PostNovoTema } from '../../modelos/importarBack/PostNovoTema';
import { PutNavioTema } from '../../modelos/importarBack/PutNavioTema';
import { PutTema } from '../../modelos/importarBack/PutTema';
import { UtilNumber } from '../../util/UtilNumber';
import ManterListaNavioTema from './ManterListaNavioTema';
import MdRespostaApi from '../../modelos/MdRespostaApi';
import '../css/DetalheTema.css'
import { PutAdicaoCreditos } from '../../modelos/importarBack/PutAdicaoCreditos';

const EncVnTextField = styled(TextField)({
    '& input + fieldset': {
        outerWidth: 340,
        borderColor: '#505050',
        borderWidth: 2,
    }
});

const LiberarCreditos = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const userState = new UserState();
    const clientRest = new ClientRest();

    const [nome, setNome] = useState('');
    const [creditos, setCreditos] = useState<number | null>(null);
    const [valorAdicionar, setValorAdicionar] = useState<number | null>(null);
    const [descricao, setDescricao] = useState('');
    const [carregouUsuario, setCarregouUsuario] = useState(false);

    const [confirmacaoAdicaoEstaAberto, setConfirmacaoAdicaoEstaAberto] = useState(false);
    const [erroEstaAberto, setErroEstaAberto] = useState(false);
    const [problemaErro, setProblemaErro] = useState('');
    const [sucessoAdicaoEstaAberto, setSucessoAdicaoEstaAberto] = useState(false);

    useEffect(() => {
        const tryIdUsuario = searchParams.get('idUsuario');
        if (tryIdUsuario == null) {
            setProblemaErro(_ => 'Usuário não encontrado');
            setErroEstaAberto(_ => true);
        } else {
            clientRest.callGetAutorizado<MdResumoUsuarioLiberavel>('/api/liberacao/resumirPorId?id=' + tryIdUsuario, new MdResumoUsuarioLiberavel())
                .then(rDetalhe => {
                    if (rDetalhe.eOk) {
                        const resumoUsuario = rDetalhe.body ?? new MdResumoUsuarioLiberavel();
                        setNome(_ => resumoUsuario.nome);
                        setCreditos(_ => resumoUsuario.creditos);
                        setCarregouUsuario(_ => true);
                    } else {
                        setProblemaErro(rDetalhe.problema);
                        setErroEstaAberto(_ => true);
                    }
                });
        }
    }, []);

    const formatarCreditos = (creditosRaw: number | null): string => {
        if (creditosRaw == null)
            return '';
        return ('' + creditosRaw);
    }
    let creditosAsFormatado = formatarCreditos(creditos);

    const formatarValorAdicionar = (valorAdicionarRaw: number | null): string => {
        if (valorAdicionarRaw == null)
            return '';
        return ('' + valorAdicionarRaw);
    }
    let valorAdicionarAsFormatado = formatarValorAdicionar(valorAdicionar);

    const handleClickConfirmarAdicao = async () => {
        const tryIdUsuario = searchParams.get('idUsuario');
        if (tryIdUsuario == null) {
            setProblemaErro(_ => 'Usuário não encontrado');
            setErroEstaAberto(_ => true);
            return;
        }
        let adicaoCreditos = new PutAdicaoCreditos();
        adicaoCreditos.idUsuarioCreditado = tryIdUsuario ?? '';
        adicaoCreditos.valorParaAdicionar = valorAdicionar ?? 0;
        let rAlteracao = await clientRest.callPutAutorizado<undefined>('/api/liberacao/adicionarCreditos', adicaoCreditos, undefined);
        if (rAlteracao.eOk) {
            setSucessoAdicaoEstaAberto(_ => true);
        } else {
            setProblemaErro(_ => rAlteracao.problema);
            setErroEstaAberto(_ => true);
        }
        
    }

    return (
        <>
            <h1 style={{color: 'white', fontFamily: 'bungee', textAlign: 'center', marginTop: '16px' }}>Liberar Créditos</h1>

            <Box className='box'>
                    <div className="row g-0">
                        <EncVnTextField label="Nome" variant="outlined" className="mt-4" sx={{ width: 350, marginRight: 16 }} value={nome} disabled />
                        <EncVnTextField label="Saldo Atual" type="number" variant="outlined" className="mt-4" sx={{ width: 350 }} value={creditosAsFormatado} disabled
                            InputProps={{
                                startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                            }} />
                    </div>
                    <div className="row g-0">
                        <EncVnTextField label="Créditos para adicionar" type="number" variant="outlined" className="mt-4" sx={{ width: 350 }} onChange={ev => setValorAdicionar(_ => UtilNumber.parseFloatOrDefault(ev.target.value))} value={valorAdicionarAsFormatado}
                            InputProps={{
                                startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                            }} />
                    </div>
                <div className="row g-0">
                    <div className="col-6" style={{marginTop: '10px'}}>
                        <Button size="medium" onClick={() => window.history.back()}>Voltar</Button>
                    </div>
                    <div className="col-6" style={{marginTop: '10px'}}>
                        <Button size="medium" variant="contained" onClick={() => setConfirmacaoAdicaoEstaAberto(_ => true)}>Salvar</Button>
                    </div>

                </div>
            </Box>

            {/* Confirmação, Mensagens de sucesso e erro */}
            <ConfirmacaoModal estaAberto={confirmacaoAdicaoEstaAberto} onFecharOuCancelar={() => setConfirmacaoAdicaoEstaAberto(_ => false)} onConfirmar={() => handleClickConfirmarAdicao()}
                mensagem='Deseja adicionar os créditos ao usuário? Esta ação não pode ser revertida.' />
            <SucessoModal estaAberto={sucessoAdicaoEstaAberto} onFechar={() => navigate('/liberacao')} mensagem='Créditos liberados com sucesso!' />
            <ErroModal estaAberto={erroEstaAberto} onFechar={() => setErroEstaAberto(_ => false)} problema={problemaErro} />
        </>
    )
}


export default LiberarCreditos
