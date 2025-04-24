import { CostoRutaKmList } from "../../components"


export const CostoxRutayKm = () => {
  return (
    <>
      <hr/>
      <hr/>
      <hr/>

      <div id="pagesContainer" className="container-fluid h rounded-3 p-3 mt-5 animate__animated animate__fadeIn">
        <h1 className='text-center text-black text text'> Costo Por Rutas y Kilometraje</h1>
        <div className="container-fluid overflow-auto" id="containerPagesTable">
          <table className="table table-bordered table-dark table-striped-columns table-hover" >
            <thead>
              <tr>
                <th scope="col">No.</th>
                <th scope="col">Proveedor</th>
                <th scope="col">Placas</th>
                <th scope="col">Capacidad</th>
                <th scope="col">Tipo</th>
                <th scope="col">Ruta</th>
                <th scope="col">Distancia</th>
                <th scope="col">Costo</th>
                <th scope="col">Costo/KM</th>
              </tr>
            </thead>
            <tbody>
              <CostoRutaKmList/>
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
