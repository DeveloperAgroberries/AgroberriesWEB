import logoImageUrl from '../../../assets/logoag.png'; // Ajusta la ruta según tu carpeta

export const AcercaDePage = () => {

    // const logoImageUrl = `/assets/logoag.png`;
  
    return (
        <>
            <hr/>
            <hr/>
            <hr/>

            <div id="pagesContainer" className="container-fluid h rounded-3 p-3 mt-5 animate__animated animate__fadeIn">
                <div className="container text-center ">
              		<img src={logoImageUrl} alt='logo'/>
			    </div>
        
            <div className="container-fluid overflow-auto" id="containerPagesTable">
                <h3 className="text-center mt-5">Pagina web desarrollada por el equipo de T.I.</h3>
                
                <div className="text-center mt-5">
                    <p>En caso de requerir apoyo favor de enviar un correo con su solicitud y/o informe a:</p>
                    <h5>aorozco@agroberries.mx</h5>
                    <h5>programador@agroberries.mx</h5>
                    <h5>auxsistemas@agroberries.mx</h5>
                </div>
                
            </div>

            <div className="text-center mt-5 bottom-100">
                <p>Todos los derechos reservados R® Inversiones Agricolas Expoberries 2024-2026</p>
            </div>
    </div>
    </>
  )
}
