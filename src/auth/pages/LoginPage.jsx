import { useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useForm } from '../../hooks';
import { startLoginWithUserPassword } from '../../store/auth/thunks';
import { Loading } from '../../ui/components/Loading';
import ReCAPTCHA from "react-google-recaptcha";
import md5 from "md5";

export const LoginPage = () => {

	const logoImageUrl = `/assets/logo.png`;

	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { login } = useContext(AuthContext);
	const { status, vNombreUsu, cCodigoUsu, Permissions, errorMessage } = useSelector(state => state.auth);
	// EN CASO DE NECESITAR CATCHA CAMBIAR A FALSE - RICARDO DIMAS 17/04/2025
	const [isValid, setIsValid] = useState(true);
	const [hide, setHide] = useState(false);
	const [token, setToken] = useState('');

	const checkSpecialCharForRoute = (e) => {
		if (!/[0-9a-zA-Z]/.test(e.key)) {
			e.preventDefault();
		}
	};

	const onPaste = (e) => {
		e.preventDefault();
	}

	const { user, password, onInputChange } = useForm({
		user: '',
		password: '',
	});

	// const isAuthenticating = useMemo( () => status === 'checking', [status]);

	const handleCaptcha = (value) => {
		setToken(value);
	}

	const onSubmit = (event) => {
		event.preventDefault();

		const userUpper = user.toUpperCase();
		const hashPassword = md5(password);

		dispatch(startLoginWithUserPassword( userUpper, hashPassword ))
		setToken('');
		setHide(false);
	}

	useEffect(() => {
		if (status === 'authenticated') {
			const lastPath = localStorage.getItem('/') || '/';
			// const permissions = ["transportes", "reportes", "reportestransportes", "rh", "fitosanidad", "comedores", "almacenme"]
			login(cCodigoUsu, vNombreUsu, Permissions);
			navigate(lastPath, {
				replace: true,
			});
		}

		if(errorMessage !== null && errorMessage !== ''){
			setTimeout(() => {
				setHide(true);
			  }, 5000);
		}
	}, [status]);

	// EN CASO DE NECESITAR CATCHA QUITAR COMENTARIOS - RICARDO DIMAS 17/04/2025
	// useEffect(() => {
	// 	if (token !== null && token !== '') {
	// 		setIsValid(true);
	// 	} else {
	// 		setIsValid(false);
	// 	}
	// }, [token])

	return (
		<>
			<div className="container">
				{status === "checking" ? <div className="popup-container"><Loading /></div> :
					<div className="container-fluid animate__animated animate__fadeIn">
						<div className="d-flex justify-content-center h-100">
							<div className="card">
								<div className="card-header">
									<img src={logoImageUrl} alt='logo' />
								</div>

								<div className="card-body">
									<form submit={status} onSubmit={onSubmit}>
										<div className="input-group mb-2">
											<span className="input-group-text"><i className="fas fa-user"></i></span>
											<input type="text" className="form-control" placeholder="Usuario" name="user" value={user} onChange={onInputChange} onKeyDown={(e) => checkSpecialCharForRoute(e)} onPaste={onPaste} />
										</div>

										<div className="input-group mb-2">
											<span className="input-group-text"><i className="fas fa-key"></i></span>
											<input type="password" className="form-control" placeholder="Contraseña" name="password" value={password} onChange={onInputChange} onKeyDown={(e) => checkSpecialCharForRoute(e)} onPaste={onPaste} />
										</div>

										{/* // EN CASO DE NECESITAR CATCHA QUITAR COMENTARIOS - RICARDO DIMAS 17/04/2025
										<div className="remember form-check form-switch mb-2">
								    	<input type="checkbox" className="form-check-input" role="switch"/>
        		          				<label className="form-check-label" >Recordar mi usuario</label>
							      		</div> */}

										<div style={{ display: !!errorMessage ? 'block' : 'none' }}>
											<div hidden={hide} className='alert alert-danger mt-1' role='alert'>{errorMessage}</div>
										</div>

										{/* // EN CASO DE NECESITAR CATCHA QUITAR COMENTARIOS - RICARDO DIMAS 17/04/2025
										 <div className="input-group m-4">
											<ReCAPTCHA
												sitekey="6LeG8_ApAAAAAAVz3AQtjBHL0XLo16qCOqoiZtnl"
												onChange={handleCaptcha}
											/>
										</div> */}

										<div className="form-group d-md-flex justify-content-md-end mb-2">
											<input id="liveAlertBtn" disabled={!isValid} value="Ingresar" className="btn float-right login_btn" type='submit' />
										</div>

									</form>
								</div>
							</div>
						</div>
					</div>
				}
			</div>
		</>
	)
}

