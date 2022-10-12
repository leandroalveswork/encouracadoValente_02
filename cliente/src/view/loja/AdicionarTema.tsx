import { Button, styled, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ErroModal from '../../components/erroModal/ErroModal';
import SucessoModal from '../../components/sucessoModal/SucessoModal';
import ClientRest from '../../integracao/ClientRest';
import UserState from '../../integracao/UserState';
import { PostNovoTema } from '../../modelos/importarBack/PostNovoTema';

const EncVnTextField = styled(TextField)({
    '& input + fieldset': {
        outerWidth: 340,
        borderColor: '#505050',
        borderWidth: 2,
    }
});

const AdicionarTema = () => {
    const navigate = useNavigate();

    const userState = new UserState();
    const clientRest = new ClientRest();

    const [nome, setNome] = useState('');
    const [preco, setPreco] = useState<number | null>(null);
    const [descricao, setDescricao] = useState('');
    const [erroEstaAberto, setErroEstaAberto] = useState(false);
    const [problemaErro, setProblemaErro] = useState('');

    const [sucessoEstaAberto, setSucessoEstaAberto] = useState(false);

    const formatarPreco = (precoRaw: number | null): string => {
        if (precoRaw == null) {
            return '';
        }
        return ('' + precoRaw);
    }

    let precoAsFormatado = formatarPreco(preco);
    useEffect(() => {
        precoAsFormatado = formatarPreco(preco);
    }, [preco]);

    const handleChangePreco = (arg: string) => {
        try {
            try {
                const argAsFloat = parseFloat(arg);
                setPreco(_ => argAsFloat);
            } catch (exc) {
                const argCulturaBr = arg.split('').map(iChr => {
                    if (iChr == ',') {
                        return '.';
                    }
                    if (iChr == '.') {
                        return ',';
                    }
                    return iChr;
                }).join('');
                const argCulturaBrAsFloat = parseFloat(argCulturaBr);
                setPreco(_ => argCulturaBrAsFloat);
            }
        } catch (exc) {
            setPreco(_ => null);
        }
    }

    const handleClickSalvar = async () => {
        let novoTema = new PostNovoTema();
        novoTema.nome = nome;
        novoTema.preco = preco;
        novoTema.descricao = descricao;
        let rAdicao = await clientRest.callPostAutorizado<string>('/api/tema/adicionar', novoTema, '');
        if (rAdicao.eOk) {
            setSucessoEstaAberto(_ => true);
        } else {
            setProblemaErro(_ => rAdicao.problema);
            setErroEstaAberto(_ => true);
        }
    }

    return (
        <>
            <span>{`Olá usuário: ${userState.localStorageUser?.nome ?? 'indefinido'}`}</span>
            <h1>Adicionar Tema</h1>
            
            <div className="row g-0">
                <EncVnTextField label="Nome" variant="outlined" className="mt-4" sx={{ width: 350 }} onChange={ev => setNome(_ => ev.target.value)} value={nome} />
                <EncVnTextField label="Preço" type="number" variant="outlined" className="mt-4" sx={{ width: 350 }} onChange={ev => handleChangePreco(ev.target.value)} value={precoAsFormatado} />
            </div>
            <div className="row g-0">
                <EncVnTextField multiline rows={4} label="Descrição" variant="outlined" className="mt-4" sx={{ width: 350 }} onChange={ev => setDescricao(_ => ev.target.value)} value={descricao} />
            </div>
            <div className="row g-0">
                <div className="col-6">
                    <Button size="medium" onClick={() => window.history.back()}>Voltar</Button>
                </div>
                <div className="col-6">
                    <Button size="medium" variant="contained" onClick={() => handleClickSalvar()}>Salvar</Button>
                </div>

            </div>
            <ErroModal estaAberto={erroEstaAberto} onFechar={() => setErroEstaAberto(_ => false)} problema={problemaErro} />
            <SucessoModal estaAberto={sucessoEstaAberto} onFechar={() => navigate('/loja')} mensagem='Tema adicionado com sucesso!' />
        </>
    )
}


export default AdicionarTema