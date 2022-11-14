import { Request, Router } from "express";
import { inject, injectable, postConstruct } from "inversify";
import "reflect-metadata";
import { LiteralServico } from "../literais/LiteralServico";
import { PostLoginUsuario } from "../modelos/PostLoginUsuario";
import { MdExcecao } from "./MdExcecao";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import { MdUsuarioLogado } from "../modelos/MdUsuarioLogado";
import { PostCadastroUsuario } from "../modelos/PostCadastroUsuario";
import { StringUteis } from "../uteis/StringUteis";
import { DbUsuario } from "../modelos/DbUsuario";
import { ConfigBack } from "../ConfigBack";
import { UsuarioRepositorio } from "../repositorio/UsuarioRepositorio";
import { IUsuarioGoogle } from "../modelos/IUsuarioGoogle";
import { ControllerBase } from "./ControllerBase";
import { PutUpdateUsuario } from "../modelos/PutUpdateUsuario";

@injectable()
class AutorizacaoController extends ControllerBase {
    private _usuarioRepositorio: UsuarioRepositorio
    constructor(
        @inject(LiteralServico.ConfigBack) configBack: ConfigBack,
        @inject(LiteralServico.UsuarioRepositorio) usuarioRepositorio: UsuarioRepositorio
    ) {
        super(configBack);
        this._configBack = configBack;
        this._usuarioRepositorio = usuarioRepositorio;
        this.router = Router();
        this.router.post('/entrarUsuarioEncVn', async (req, res) => {
            try {
                const usuarioLogado = await this.entrarUsuarioEncVn(req.body);
                res.send(usuarioLogado);
            } catch (exc) {
                MdExcecao.enviarExcecao(req, res, exc);
            }
        });
        this.router.post('/entrarUsuarioGoogle', async (req, res) => {
            try {
                const usuarioLogado = await this.entrarUsuarioGoogle(req.body);
                res.send(usuarioLogado);
            } catch (exc) {
                MdExcecao.enviarExcecao(req, res, exc);
            }
        });
        this.router.post('/cadastrarUsuarioEncVn', async (req, res) => {
            try {
                const usuarioLogado = await this.cadastrarUsuarioEncVn(req.body);
                res.send(usuarioLogado);
            } catch (exc) {
                MdExcecao.enviarExcecao(req, res, exc);
            }
        });
        this.router.put('/updateUsuario', async (req, res) => {
            try {
                const idUsuarioLogado = await this.obterIdUsuarioLogado(req);
                await this.updateUsuario(req.body, idUsuarioLogado);
                res.send();
            } catch (exc) {
                MdExcecao.enviarExcecao(req, res, exc);
            }
        });
    }

    tempoSessao: number = 20 * 60 * 50;

    // codifique as actions:


    updateUsuario = async (novoUsuario: PutUpdateUsuario, idUsuarioLogado: string): Promise<void> => {

        if (!novoUsuario.eAlteracaoSenha) {
            await this.updateUsuarioSomenteNome(novoUsuario, idUsuarioLogado);
            return;
        }
        
        // Update usuario alterando a senha
        
        // Validaçao
        if (novoUsuario.nome.length <= 2) {
            let ex = new MdExcecao();
            ex.codigoExcecao = 400;
            ex.problema = 'O nome deve possuir mais do que 2 caracteres';
            throw ex;
        }
        if (novoUsuario.senhaNova.length <= 8) {
            let ex = new MdExcecao();
            ex.codigoExcecao = 400;
            ex.problema = 'A senha deve possuir mais do que 8 caracteres';
            throw ex;
        }

        const usuarioDb = await this._usuarioRepositorio.selectByIdOrDefault(idUsuarioLogado);
        if (usuarioDb == null) {
            let ex = new MdExcecao();
            ex.codigoExcecao = 404;
            ex.problema = 'Usuario não encontrado.';
            throw ex;
        }
        const senhaEstaCorreta = await bcrypt.compare(novoUsuario.senhaAnterior, usuarioDb.senha);
        if (!senhaEstaCorreta) {
            let ex = new MdExcecao();
            ex.codigoExcecao = 400;
            ex.problema = 'A senha anterior esta incorreta';
            throw ex;
        }
        
        // Alteraçao
        const salt = await bcrypt.genSalt(10);
        const senhaCrypt = await bcrypt.hash(novoUsuario.senhaNova, salt);
        let newUser = new DbUsuario();
        newUser = usuarioDb;
        newUser.nome = novoUsuario.nome;
        newUser.senha = senhaCrypt;
        await this._usuarioRepositorio.updatePorOperador(newUser, usuarioDb.id);
    }
    
    updateUsuarioSomenteNome = async (novoUsuario: PutUpdateUsuario, idUsuarioLogado: string): Promise<void> => {
        // Validaçao
        if (novoUsuario.nome.length <= 2) {
            let ex = new MdExcecao();
            ex.codigoExcecao = 400;
            ex.problema = 'O nome deve possuir mais do que 2 caracteres';
            throw ex;
        }

        const usuarioDb = await this._usuarioRepositorio.selectByIdOrDefault(idUsuarioLogado);
        if (usuarioDb == null) {
            let ex = new MdExcecao();
            ex.codigoExcecao = 404;
            ex.problema = 'Usuario não encontrado.';
            throw ex;
        }
        
        // Alteraçao
        let newUser = new DbUsuario();
        newUser = usuarioDb;
        newUser.nome = novoUsuario.nome;
        await this._usuarioRepositorio.updatePorOperador(newUser, usuarioDb.id);
    }

    // post
    entrarUsuarioEncVn = async (loginUsuario: PostLoginUsuario): Promise<MdUsuarioLogado> => {
        let camposNulos: string[] = [];
        // console.log('entrou no entrar')
        if (loginUsuario.email.length == 0) {
            camposNulos.push('Email');
        }
        if (loginUsuario.senha.length == 0) {
            camposNulos.push('Senha');
        }
        if (camposNulos.length > 0) {
            let ex = new MdExcecao();
            ex.codigoExcecao = 400;
            ex.problema = 'Os campos ' + StringUteis.listarEmPt(camposNulos) + ' são obrigatórios';
            throw ex;
        }
        const totalUsuarios = await this._usuarioRepositorio.selectAll();
        console.table(totalUsuarios);
        const usuarioDb = await this._usuarioRepositorio.selectByEmailOrDefault(loginUsuario.email);
        // console.table(usuarioDb);
        // console.log('        if usuario = null');
        if (usuarioDb == null) {
            let ex = new MdExcecao();
            ex.codigoExcecao = 404;
            ex.problema = 'Login ou senha inválidos';
            throw ex;
        }
        // console.log('        if (usuarioDb.eUsuarioGoogle) {')
        if (usuarioDb.eUsuarioGoogle) {
            let ex = new MdExcecao();
            ex.codigoExcecao = 400;
            ex.problema = 'Esta conta foi cadastrada pelo Google, não é possível entrar por email e senha.';
            throw ex;
        }
        const senhaEstaCorreta = await bcrypt.compare(loginUsuario.senha, usuarioDb.senha);
        if (!senhaEstaCorreta) {
            let ex = new MdExcecao();
            ex.codigoExcecao = 404;
            ex.problema = 'Login ou senha inválidos';
            throw ex;
        }
        const token = jsonwebtoken.sign({ id: usuarioDb.id }, this._configBack.salDoJwt, {
            expiresIn: this.tempoSessao
        });
        let usuarioLogado = new MdUsuarioLogado();
        usuarioLogado.id = usuarioDb.id;
        usuarioLogado.token = token;
        usuarioLogado.nome = usuarioDb.nome;
        usuarioLogado.email = usuarioDb.email;
        usuarioLogado.eSuperuser = usuarioDb.eSuperuser;
        usuarioLogado.eUsuarioGoogle = usuarioDb.eUsuarioGoogle;
        return usuarioLogado;
    }

    // post
    entrarUsuarioGoogle = async (usuarioGoogle: IUsuarioGoogle): Promise<MdUsuarioLogado> => {
        const usuarioDb = await this._usuarioRepositorio.selectByEmailOrDefault(usuarioGoogle.email);
        // console.table(usuarioDb);
        if (usuarioDb == null) {
            return await this.criarUsuarioGoogle(usuarioGoogle);
        }
        if (!usuarioDb.eUsuarioGoogle) {
            let ex = new MdExcecao();
            ex.codigoExcecao = 400;
            ex.problema = 'Esta conta foi cadastrada por email e senha, não é possível entrar pelo Google.';
            throw ex;
        }
        const token = jsonwebtoken.sign({ id: usuarioDb.id }, this._configBack.salDoJwt, {
            expiresIn: this.tempoSessao
        });
        const username = this._configBack;  
        let usuarioLogado = new MdUsuarioLogado();
        usuarioLogado.id = usuarioDb.id;
        usuarioLogado.token = token;
        usuarioLogado.nome = usuarioDb.nome;
        usuarioLogado.email = usuarioDb.email;
        usuarioLogado.eSuperuser = usuarioDb.eSuperuser;
        usuarioLogado.eUsuarioGoogle = usuarioDb.eUsuarioGoogle;
        return usuarioLogado;
    }

    private criarUsuarioGoogle = async (usuarioGoogle: IUsuarioGoogle): Promise<MdUsuarioLogado> => {
        const usuarioInsert = new DbUsuario();
        usuarioInsert.id = StringUteis.gerarNovoIdDe24Caracteres();
        usuarioInsert.nome = usuarioGoogle.name;
        usuarioInsert.email = usuarioGoogle.email;
        usuarioInsert.senha = ''; // não é necessário preencher, porque o email e senha são informados durante login com Google
        usuarioInsert.eSuperuser = false;
        usuarioInsert.eUsuarioGoogle = true;
        // console.table(usuarioInsert);
        await this._usuarioRepositorio.insertPorOperador(usuarioInsert, usuarioInsert.id);
        const token = jsonwebtoken.sign({ id: usuarioInsert.id }, this._configBack.salDoJwt, {
            expiresIn: this.tempoSessao
        });
        let usuarioLogado = new MdUsuarioLogado();
        usuarioLogado.id = usuarioInsert.id;
        usuarioLogado.token = token;
        usuarioLogado.nome = usuarioInsert.nome;
        usuarioLogado.email = usuarioInsert.email;
        usuarioLogado.eSuperuser = usuarioInsert.eSuperuser;
        usuarioLogado.eUsuarioGoogle = usuarioInsert.eUsuarioGoogle;
        return usuarioLogado;
    }

    // post
    cadastrarUsuarioEncVn = async (cadastroUsuario: PostCadastroUsuario): Promise<MdUsuarioLogado> => {
        let camposNulos: string[] = [];
        if (cadastroUsuario.nome.length == 0) {
            camposNulos.push('Nome');
        }
        if (cadastroUsuario.email.length == 0) {
            camposNulos.push('Email');
        }
        if (cadastroUsuario.senha.length == 0) {
            camposNulos.push('Senha');
        }
        if (camposNulos.length > 0) {
            let ex = new MdExcecao();
            ex.codigoExcecao = 400;
            ex.problema = 'Os campos ' + StringUteis.listarEmPt(camposNulos) + ' são obrigatórios';
            throw ex;
        }
        // console.log('ablubububub');
        
        const usuarioDb = await this._usuarioRepositorio.selectByEmailOrDefault(cadastroUsuario.email);
        // console.log('select by email usuariodb');
        
        if (usuarioDb != null) {
            let ex = new MdExcecao();
            ex.codigoExcecao = 400;
            ex.problema = 'Email já cadastrado';
            throw ex;
        }
        
        const salt = await bcrypt.genSalt(10);
        const senhaCrypt = await bcrypt.hash(cadastroUsuario.senha, salt);
        const usuarioInsert = new DbUsuario();
        usuarioInsert.id = StringUteis.gerarNovoIdDe24Caracteres();
        usuarioInsert.nome = cadastroUsuario.nome;
        usuarioInsert.email = cadastroUsuario.email;
        usuarioInsert.senha = senhaCrypt;
        usuarioInsert.eSuperuser = false;
        usuarioInsert.eUsuarioGoogle = false;
        // console.table(usuarioInsert);
        console.table(usuarioInsert);
        await this._usuarioRepositorio.insertPorOperador(usuarioInsert, usuarioInsert.id);
        const token = jsonwebtoken.sign({ id: usuarioInsert.id }, this._configBack.salDoJwt, {
            expiresIn: this.tempoSessao
        });
        let usuarioLogado = new MdUsuarioLogado();
        usuarioLogado.id = usuarioInsert.id;
        usuarioLogado.token = token;
        usuarioLogado.nome = usuarioInsert.nome;
        usuarioLogado.email = usuarioInsert.email;
        usuarioLogado.eSuperuser = usuarioInsert.eSuperuser;
        usuarioLogado.eUsuarioGoogle = usuarioInsert.eUsuarioGoogle;
        return usuarioLogado;
    }
}

export { AutorizacaoController };