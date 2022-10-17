import {
  Box, AppBar, Toolbar, IconButton, Typography, Menu, Container,
  Avatar, Button, Tooltip, MenuItem
} from "@mui/material";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import DirectionsBoatFilledOutlinedIcon  from '@mui/icons-material/DirectionsBoatFilledOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import UserState from '../integracao/UserState';

const theme = createTheme({
palette: {
    primary: {
            main: '#f4900c',
        },
    },
});

const userState = new UserState();
const loggedIn = userState.localStorageUser;

const Header = () => {

  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const logOut = () => {
        localStorage.removeItem('user');
        localStorage.clear();

        window.location.reload()
    }

    //const pages = [{label: 'Home', href: ''}, {label: 'Entrar', href: 'auth/entrar'}, {label: 'Loja', href: 'loja'}, {label: 'Sala de jogo', href: 'game/123'}];
    //const settings = [{label: 'Perfil', href: 'perfil'}, {label: loggedIn ? 'Logout' : 'Entrar', href: 'auth/entrar'}];

    const definePages = () => {
        if (loggedIn) {
            return [{label: 'Home', href: ''}, {label: 'Entrar', href: 'auth/entrar'}, {label: 'Loja', href: 'loja'}, {label: 'Sala de jogo', href: 'game/123'}];
        }

        return [];
    }
    const pages = definePages();    

    const defineSettings = () => {
        if (loggedIn) {
            return [{ label: 'Perfil', href: 'perfil', onclick: () => {} }, {label: 'Logout', href: 'auth/entrar', onclick: logOut }];
        }

        return [{ label: 'Login', href: 'auth/entrar', onclick: () => {} }];;
    }
    const settings = defineSettings();    

    return (
        <ThemeProvider theme={theme}>    
        <AppBar position="static">
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <DirectionsBoatFilledOutlinedIcon  sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        href= {loggedIn ? "" : "/auth/entrar"}
                        sx={{
                            mr: 2,
                            display: { xs: 'none', md: 'flex' },
                            fontFamily: 'Bungee',
                            fontWeight: 700,
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        Jogar
                    </Typography>
                    <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleOpenNavMenu}
                            color="inherit"
                        >
                            <MenuIcon />
                        </IconButton>
                        
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorElNav}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                            open={Boolean(anchorElNav)}
                            onClose={handleCloseNavMenu}
                            sx={{
                                display: { xs: 'block', md: 'none' },
                            }}
                        >
                            {pages.map((page) => (
                                <MenuItem key={page.label} onClick={handleCloseNavMenu}>
                                    <Typography textAlign="center">
                                        <Link style={{ textDecoration: "none", color: "black" }} to={`/${page.href}`}>{page.label}</Link>
                                    </Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                        
                    </Box>
                    <DirectionsBoatFilledOutlinedIcon  sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
                    <Typography
                        variant="h5"
                        noWrap
                        component="a"
                        href= {loggedIn ? "" : "/auth/entrar"}
                        sx={{
                            mr: 2,
                            display: { xs: 'flex', md: 'none' },
                            flexGrow: 1,
                            fontFamily: 'Bungee',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        Jogar
                    </Typography>
                        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>                        
                            {pages.map((page) => (
                                <Button
                                    key={page.label}
                                    onClick={handleCloseNavMenu}
                                    sx={{ my: 2, color: 'white', display: 'block' }}
                                >
                                    <Link style={{ textDecoration: "none", color: "white", fontFamily: "Bungee"}} to={`/${page.href}`}>{page.label}</Link>
                                </Button>
                            ))}
                        </Box>               
                    <Typography
                        variant="subtitle2"
                        noWrap
                        sx={{
                            mr: 2,
                            fontFamily: 'Bungee',
                            fontWeight: 700,
                            letterSpacing: '.1rem',
                            color: 'white',
                            textDecoration: 'none',
                        }}
                    >
                        {loggedIn ? ( 'Bem Vindo, ' + loggedIn?.nome.split(' ')[0]) : 'Entre, convidado'}
                    </Typography>
                    
                    <Box sx={{ flexGrow: 0 }}>
                        <Tooltip title="Open settings"> 
                            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                <Avatar alt="Profile pic" src="https://static.vecteezy.com/ti/vetor-gratis/p3/4305899-marinheiro-plano-ilustracao-maritimo-academia-marinheiro-em-trabalho-uniforme-marinho-ocupacao-marinheiro-com-corda-isolado-personagem-de-desenho-animado-fundo-branco-vetor.jpg" />
                            </IconButton>
                        </Tooltip>
                        <Menu
                            sx={{ mt: '45px' }}
                            id="menu-appbar"
                            anchorEl={anchorElUser}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorElUser)}
                            onClose={handleCloseUserMenu}
                        >
                            {settings.map((setting) => (
                                <MenuItem key={setting.label} onClick={handleCloseUserMenu}>
                                    <Typography textAlign="center"><Link onClick={setting.onclick} style={{ textDecoration: "none", color: "black" }} to={`/${setting.href}`}>{setting.label}</Link></Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
        </ThemeProvider>
    );
}

export default Header