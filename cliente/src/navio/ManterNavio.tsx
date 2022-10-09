// import { Container } from 'inversify';
// import React, { ChangeEvent, HtmlHTMLAttributes, useCallback, useEffect, useState } from 'react';
// import useWebSocket, { ReadyState } from 'react-use-websocket';
// import { DbNavio } from '../dominio/importarDoBked/modelos/DbNavio';
// import { IConfiguracaoFrontend } from '../dominio/interfaces/configuracao/IConfiguracaoFrontend';
// import { LiteralServicoInjetado } from '../dominio/literais/LiteralServicoInjetado';
// import PropsComContainer from '../propComum/PropsComContainer';
// import { IApiCaller } from '../dominio/interfaces/apiCaller/IApiCaller';

// interface PropsManterNavio extends PropsComContainer {
//   oManter: DbNavio | null
//   onAtualizarTable: () => void
//   onChangeMsgProblema: (nextMsgProblema: string) => void
//   onFecharManter: () => void
// }
export default function ManterNavio() {
  return (<div></div>);
}

// function ManterNavio(props: PropsManterNavio) {
//   const _apiCaller = props.containerDoInversify.get<IApiCaller>(LiteralServicoInjetado.API_CALLER.simbolo);
  
//   const [inNome, setInNome] = useState('');
//   const [inQtdeQuadradosOcupados, setInQtdeQuadradosOcupados] = useState(0);
//   const [inFoiAfundado, setInFoiAfundado] = useState(false);

//   useEffect(() => {
//     if (props.oManter == null || props.oManter.id == '') {
//       return;
//     }
//     onChangeInNome(props.oManter.nome);
//     onChangeInQtdeQuadradosOcupados(props.oManter.qtdeQuadradosOcupados.toString());
//     onChangeInFoiAfundado(props.oManter.foiAfundado);
//   }, [])

//   const onChangeInNome = (nextNome: string) => {
//     setInNome(prev => nextNome);
//   }

//   const onChangeInQtdeQuadradosOcupados = (nextQtdeQuadradosOcupados: string) => {
//     try {
//       const nextQtdAsInt = parseInt(nextQtdeQuadradosOcupados);
//       setInQtdeQuadradosOcupados(prev => nextQtdAsInt);
//     } catch (error) {
//       // ignorar o erro
//     }
//   }

//   const onChangeInFoiAfundado = (nextFoiAfundado: boolean) => {
//     setInFoiAfundado(prev => nextFoiAfundado);
//   }

//   const onTrySalvar = async () => {
//     if (props.oManter == null || props.oManter.id == '') {
//       let o = new DbNavio();
//       o.nome = inNome;
//       o.qtdeQuadradosOcupados = inQtdeQuadradosOcupados;
//       o.foiAfundado = inFoiAfundado;
//       // console.log(o.nome, o.qtdeQuadradosOcupados, o.foiAfundado);
//       let r = await _apiCaller.callPost<string>('/api/navio/inserir', o);
//       if (r.statusCode != 200) {
//         props.onChangeMsgProblema(r.problema);
//       }
//       props.onAtualizarTable();
//       return;
//     }
//     let o = new DbNavio();
//     o.id = props.oManter.id;
//     o.nome = inNome;
//     o.qtdeQuadradosOcupados = inQtdeQuadradosOcupados;
//     o.foiAfundado = inFoiAfundado;
//     let r = await _apiCaller.callPut<null>('/api/navio/alterar', o);
//     if (r.statusCode != 200) {
//       props.onChangeMsgProblema(r.problema);
//     }
//     props.onAtualizarTable();
//   }

//   return (
//     <div>
//       <label>Nome</label>
//       <input value={inNome} onChange={args => onChangeInNome(args.target.value)} />
//       <label>Quadrados Ocupados</label>
//       <input type="number" value={inQtdeQuadradosOcupados} onChange={args => onChangeInQtdeQuadradosOcupados(args.target.value)} />
//       <label>Foi afundado</label>
//       <input type="checkbox" checked={inFoiAfundado} onChange={args => onChangeInFoiAfundado(args.target.checked)} />
//       <button onClick={props.onFecharManter}>Cancelar</button>
//       <button onClick={onTrySalvar}>Salvar</button>
//     </div>
//   );
// }

// export default ManterNavio;
