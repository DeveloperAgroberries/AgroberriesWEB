import React from 'react'

export const ReporteKilometrajeDiario = () => {

    return (
        <>
            <br />
            <br />

            <div id="pagesContainer" className="container-fluid h rounded-3 p-3 mt-5 animate__animated animate__fadeIn" style={{ position: 'relative', width: '100%', height: '100%' }}>
                <div className="rounded-3" style={{ background: '#7c30b8', color: 'white', fontSize: '35px', textAlign: 'center' }}>
                    <strong>Reporte Diario de Kilometraje</strong>
                </div>

                <div style={{ marginTop: '15px' }}>
                    <label className="form-label m-1">Consulta de información del kilometraje diariamente registrado.</label>
                </div>


            </div>
        </>
    )
}
