import { useContext } from 'react';
import { useDispatch } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../auth/context/AuthContext';
import logo from '../../../assets/logo.png';
import { startLogout } from '../../store/auth/thunks';

export const NavBar = (props) => {

	const { user, logout } = useContext(AuthContext);
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const onLogout = () => {
		logout();
		navigate('/login', {
			replace: true,
		});
		dispatch(startLogout());
	}

	//Lo comento para que no este saliedno todo el tiempo: Ricardo Dimas - 04/05/2025
	// console.log(user?.permissions)

	return (
		<nav className="navbar bg-body-tertiary fixed-top" data-bs-theme="dark">
			<div className="container-fluid">
				<NavLink className={({ isActive }) => `navbar-brand ${isActive ? 'active' : ''}`} to="/home">
					<img src={logo} alt='logo' width="100" height="60" />
				</NavLink>

				<div className='d-flex'>
					<h6 className='text-body-emphasis me-4'> Bienvenido {user?.name} </h6>
					<button className="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar" aria-label="Toggle navigation">
						<span className="navbar-toggler-icon"></span>
					</button>
				</div>

				<div className="offcanvas offcanvas-end" tabIndex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
					<div className="offcanvas-header">
						<h5 className="offcanvas-title" id="offcanvasNavbarLabel">Menu</h5>
						<button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
					</div>
					<div className="offcanvas-body">
						<ul className="navbar-nav justify-content-end flex-grow-1 pe-3">
							<li className="nav-item">
								<NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/home">
									Home
								</NavLink>
							</li>

							<li className="nav-item dropdown">
								<a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
									Administracion
								</a>
								<ul className="dropdown-menu">
									{user?.permissions.includes("01800") && (
										<>
											<li className="nav-item dropdown">
												<a className="dropdown-item dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
													Transportes
												</a>
												<ul className="dropdown-menu-end">
													{/* {user?.permissions.includes("01806") && (
														<li className='nav-item'>
															<NavLink className={ ({isActive}) => `rounded-1 dropdown-item ${isActive?'active':''}` } to="/complementorutas">
																Complemento de Rutas
															</NavLink>
														</li>
													)} */}

													{user?.permissions.includes("01801") && (
														<li className='nav-item'>
															<NavLink className={({ isActive }) => `rounded-1 dropdown-item ${isActive ? 'active' : ''}`} to="/edicionRegistros">
																Edicion de registros
															</NavLink>
														</li>
													)}

													{/* {user?.permissions.includes("01806") && (
														<li className='nav-item'>
															<NavLink className={ ({isActive}) => `rounded-1 dropdown-item ${isActive?'active':''}` } to="/personalQuincenalTransportes">
																Personal Quincenal
															</NavLink>
														</li>
													)} */}

													{user?.permissions.includes("01802") && (
														<li className='nav-item'>
															<NavLink className={({ isActive }) => `rounded-1 dropdown-item ${isActive ? 'active' : ''}`} to="/presupuestoRutas">
																Presupuesto de rutas
															</NavLink>
														</li>
													)}

													{user?.permissions.includes("01803") && (
														<li className='nav-item'>
															<NavLink className={({ isActive }) => `rounded-1 dropdown-item ${isActive ? 'active' : ''}`} to="/proveedores">
																Proveedores
															</NavLink>
														</li>
													)}

													{user?.permissions.includes("01804") && (
														<li className='nav-item'>
															<NavLink className={({ isActive }) => `rounded-1 dropdown-item ${isActive ? 'active' : ''}`} to="/rutas">
																Rutas
															</NavLink>
														</li>
													)}

													{user?.permissions.includes("01805") && (
														<li className='nav-item'>
															<NavLink className={({ isActive }) => `rounded-1 dropdown-item ${isActive ? 'active' : ''}`} to="/vehiculos">
																Vehiculos
															</NavLink>
														</li>
													)}
												</ul>
											</li>
										</>
									)}

									{user?.permissions.includes("02350") && (
										<>
											<li className="nav-item dropdown">
												<a className="dropdown-item dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
													Activos Fijos
												</a>
												<ul className="dropdown-menu-end">

													{user?.permissions.includes("02351") && (
														<li className='nav-item'>
															<NavLink className={({ isActive }) => `rounded-1 dropdown-item ${isActive ? 'active' : ''}`} to="/activos">
																Catálogo de Activos Fijos
															</NavLink>
														</li>
													)}
													{user?.permissions.includes("02352") && (
													<li className='nav-item'>
														<NavLink className={({ isActive }) => `rounded-1 dropdown-item ${isActive ? 'active' : ''}`} to="/combustibles">
															Combustibles
														</NavLink>
													</li>
													)}
													{user?.permissions.includes("02353") && (
													<li className='nav-item'>
														<NavLink className={({ isActive }) => `rounded-1 dropdown-item ${isActive ? 'active' : ''}`} to="/catalogoChoferes">
															Catalogo de Choferes
														</NavLink>
													</li>
													)}
												</ul>
											</li>
										</>
									)}
								</ul>
							</li>


							<li className="nav-item dropdown">
								<a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
									Reportes
								</a>
								<ul className="dropdown-menu">
									{user?.permissions.includes("02300") && (
										<>
											<li className="nav-item dropdown">
												<a className="dropdown-item dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
													Acceso Vehicular
												</a>
												<ul className="dropdown-menu-end">
													{user?.permissions.includes("02301") && (
														<li className='nav-item'>
															<NavLink className={({ isActive }) => `rounded-1 dropdown-item ${isActive ? 'active' : ''}`} to="/reportes/reporteaccesovehicular">
																Reporte de Acceso Vehicular
															</NavLink>
														</li>
													)}
												</ul>
											</li>
											<hr />
										</>
									)}

									{user?.permissions.includes("01900") && (
										<>
											<li className="nav-item dropdown">
												<a className="dropdown-item dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
													Almacen de Empaque
												</a>
												<ul className="dropdown-menu-end">
													{user?.permissions.includes("01901") && (
														<li className='nav-item'>
															<NavLink className={({ isActive }) => `rounded-1 dropdown-item ${isActive ? 'active' : ''}`} to="/reportes/reporteexistencias">
																Reporte de Existencias
															</NavLink>
														</li>
													)}
												</ul>
											</li>
											<hr />
										</>
									)}

									{user?.permissions.includes("02000") && (
										<>
											<li className="nav-item dropdown">
												<a className="dropdown-item dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
													Comedores
												</a>
												<ul className="dropdown-menu-end">
													{user?.permissions.includes("02001") && (
														<li className='nav-item'>
															<NavLink className={({ isActive }) => `rounded-1 dropdown-item ${isActive ? 'active' : ''}`} to="/reportes/reporteusoapp">
																Reporte de uso de app
															</NavLink>
														</li>
													)}

													{user?.permissions.includes("02002") && (
														<li className='nav-item'>
															<NavLink className={({ isActive }) => `rounded-1 dropdown-item ${isActive ? 'active' : ''}`} to="/reportes/reportecomedorgeneral">
																Reporte general
															</NavLink>
														</li>
													)}
												</ul>
											</li>
											<hr />
										</>
									)}

									{user?.permissions.includes("91155") && (
										<>
											<li className="nav-item dropdown">
												<a className="dropdown-item dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
													Fitosanidad
												</a>
												<ul className="dropdown-menu-end">
													{user?.permissions.includes("91156") && (
														<li className='nav-item'>
															<NavLink className={({ isActive }) => `rounded-1 dropdown-item ${isActive ? 'active' : ''}`} to="/reportes/reportemonitoreo">
																Reporte de monitoreo
															</NavLink>
														</li>
													)}
												</ul>
											</li>
											<hr />
										</>
									)}

									{user?.permissions.includes("02100") && (
										<>
											<li className="nav-item dropdown">
												<a className="dropdown-item dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
													Recursos Humanos
												</a>
												<ul className="dropdown-menu-end">
													{user?.permissions.includes("02101") && (
														<li className='nav-item'>
															<NavLink className={({ isActive }) => `rounded-1 dropdown-item ${isActive ? 'active' : ''}`} to="/reportes/reportepruebarh">
																Reporte prueba
															</NavLink>
														</li>
													)}
												</ul>
											</li>
											<hr />
										</>
									)}

									{user?.permissions.includes("02200") && (
										<li className="nav-item dropdown">
											<a className="dropdown-item dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
												Transportes
											</a>
											<ul className="dropdown-menu-end">
												{/* <li className='nav-item'>
												<NavLink className={ ({isActive}) => `rounded-1 dropdown-item ${isActive?'active':''}` } to="/reportes/costoxRutayKm">
													Reporte Costos Por Ruta y KM
												</NavLink>
											</li> */}

												{user?.permissions.includes("02201") && (
													<li className='nav-item'>
														<NavLink className={({ isActive }) => `rounded-1 dropdown-item ${isActive ? 'active' : ''}`} to="/reportes/analisistransportes">
															Analisis de Transportes
														</NavLink>
													</li>
												)}

												{user?.permissions.includes("02202") && (
													<li className='nav-item'>
														<NavLink className={({ isActive }) => `rounded-1 dropdown-item ${isActive ? 'active' : ''}`} to="/reportes/dashboardtransportes">
															Dashboard de Transportes
														</NavLink>
													</li>
												)}

												{user?.permissions.includes("02203") && (
													<li className='nav-item'>
														<NavLink className={({ isActive }) => `rounded-1 dropdown-item ${isActive ? 'active' : ''}`} to="/reportes/registrostransportes">
															Registros de Transportes
														</NavLink>
													</li>
												)}

												{user?.permissions.includes("02204") && (
													<li className='nav-item'>
														<NavLink className={({ isActive }) => `rounded-1 dropdown-item ${isActive ? 'active' : ''}`} to="/reportes/reportebasetransportes">
															Reporte Base Transportes
														</NavLink>
													</li>
												)}

												{user?.permissions.includes("02206") && (
													<li className='nav-item'>
														<NavLink className={({ isActive }) => `rounded-1 dropdown-item ${isActive ? 'active' : ''}`} to="/reportes/reportebasecomplementario">
															Reporte Base Complementario
														</NavLink>
													</li>
												)}

												{user?.permissions.includes("02205") && (
													<li className='nav-item'>
														<NavLink className={({ isActive }) => `rounded-1 dropdown-item ${isActive ? 'active' : ''}`} to="/reportes/vehiculosporproveedor">
															Vehiculos por Proveedor
														</NavLink>
													</li>
												)}
											</ul>
										</li>
									)}

									{user?.permissions.includes("02400") && (
										<li className="nav-item dropdown">
											<a className="dropdown-item dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
												Combustibles
											</a>
											<ul className="dropdown-menu-end">
												{user?.permissions.includes("02401") && (
													<li className='nav-item'>
														<NavLink className={({ isActive }) => `rounded-1 dropdown-item ${isActive ? 'active' : ''}`} to="/reporteCombustibles">
															Registro de Combustibles
														</NavLink>
													</li>
												)}

											</ul>
										</li>
									)}
								</ul>
							</li>

							<li className="nav-item dropdown">
								<a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
									Nosotros
								</a>
								<ul className="dropdown-menu">
									<li className="dropdown-item">
										<NavLink className={({ isActive }) => `rounded-1 dropdown-item ${isActive ? 'active' : ''}`} to="/acercade">
											Acerda De
										</NavLink>
									</li>
									<li className="dropdown-item dropdown">
										<a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
											Redes Sociales
										</a>
										<ul className="dropdown-menu-end">
											<li><a className="dropdown-item" href="#">Facebook</a></li>
											<li><a className="dropdown-item" href="#">Instagram</a></li>
											<li><a className="dropdown-item" href="#">X</a></li>
										</ul>
									</li>
								</ul>
							</li>

						</ul>
						<button className="btn btn-outline-danger mt-5" onClick={onLogout}>Salir</button>
					</div>
				</div>
			</div>
		</nav>
	);
}
