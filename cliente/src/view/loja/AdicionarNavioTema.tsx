import { Box, Button, FormControl, InputLabel, MenuItem, Select, styled, Tab, Tabs, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ErroModal from '../../components/erroModal/ErroModal';
import SucessoModal from '../../components/sucessoModal/SucessoModal';
import ClientRest from '../../integracao/ClientRest';
import UserState from '../../integracao/UserState';
import { MdDetalheNavioTema } from '../../modelos/importarBack/MdDetalheNavioTema';
import { PostNovoTema } from '../../modelos/importarBack/PostNovoTema';
import { LiteralNavio } from '../../modelos/LiteralNavio';
import { StringUteis } from '../../util/StringUteis';
import { UtilNumber } from '../../util/UtilNumber';

const EncVnTextField = styled(TextField)({
    '& input + fieldset': {
        outerWidth: 340,
        borderColor: '#505050',
        borderWidth: 2,
    }
});

interface AdicionarNavioTemaProps {
    onCancelar: () => void;
    onSalvar: (navioTema: MdDetalheNavioTema) => void;
}

const AdicionarNavioTema = (props: AdicionarNavioTemaProps) => {
    // const navigate = useNavigate();

    // const userState = new UserState();
    // const clientRest = new ClientRest();

    const [tamnQuadradosAsString, setTamnQuadradosAsString] = useState('');
    const [nomePersonalizado, setNomePersonalizado] = useState('');
    const [urlImagem, setUrlImagem] = useState('');

    const [erroEstaAberto, setErroEstaAberto] = useState(false);
    const [problemaErro, setProblemaErro] = useState('');

    const handleClickSalvar = async () => {
        let camposNulos: string[] = [];
        let tamnQuadradosAsNumber = 0;
        try {
            tamnQuadradosAsNumber = parseInt(tamnQuadradosAsString);
            if (LiteralNavio.obterPorTamnQuadradosOrDefault(tamnQuadradosAsNumber) == null) {
                camposNulos.push('Navio OG');
            }
        } catch (er) {
            camposNulos.push('Navio OG');
        }
        if (nomePersonalizado.length == 0) {
            camposNulos.push('Nome Personalizado');
        }
        if (urlImagem.length == 0) {
            camposNulos.push('Url Imagem');
        }
        if (camposNulos.length > 0) {
            setProblemaErro(_ => 'Os campos ' + StringUteis.listarEmPt(camposNulos) + ' são obrigatórios');
            setErroEstaAberto(_ => true);
            return;
        }
        let novoNavioTema = new MdDetalheNavioTema();
        novoNavioTema.tamnQuadrados = tamnQuadradosAsNumber;
        novoNavioTema.nomePersonalizado = nomePersonalizado;
        novoNavioTema.urlImagemNavio = urlImagem;
        props.onSalvar(novoNavioTema);
    }

    return (
        <>
            <h1>Adicionar Navio</h1>
            
                <div className="row g-0">
                    <FormControl>
                            <InputLabel>Navio OG</InputLabel>
                        <Select value={tamnQuadradosAsString} label="Navio OG" onChange={ev => setTamnQuadradosAsString(_ => (ev.target.value as string))} >
                            <MenuItem value="">
                                <span>Selecione...</span>
                            </MenuItem>
                            {LiteralNavio.listar().map(iNavioLt => {
                                return (
                                    <MenuItem value={iNavioLt.tamnQuadrados.toString()}>
                                        {iNavioLt.nome}
                                    </MenuItem>
                                )
                            })}
                        </Select>

                    </FormControl>
                    <EncVnTextField label="Tamanho (qtd.)" type="number" variant="outlined" className="mt-4" sx={{ width: 350 }} value={tamnQuadradosAsString} disabled />
                </div>
                <div className="row g-0">
                    <EncVnTextField label="Nome Personalizado" variant="outlined" className="mt-4" sx={{ width: 350 }} onChange={ev => setNomePersonalizado(_ => ev.target.value)} value={nomePersonalizado} />
                    <EncVnTextField label="Url Imagem" variant="outlined" className="mt-4" sx={{ width: 350 }} onChange={ev => setUrlImagem(_ => ev.target.value)} value={urlImagem} />
                </div>
                <div className="row g-0">
                    <div className="col-6">
                        <Button size="medium" onClick={() => props.onCancelar()}>Cancelar</Button>
                    </div>
                    <div className="col-6">
                        <Button size="medium" variant="contained" onClick={() => handleClickSalvar()} style={{marginTop: '10px'}}>Confirmar Navio</Button>
                    </div>

                </div>

            <ErroModal estaAberto={erroEstaAberto} onFechar={() => setErroEstaAberto(_ => false)} problema={problemaErro} />
        </>
    )
}


export default AdicionarNavioTema