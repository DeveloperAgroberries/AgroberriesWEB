import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getActivos, getSubFamilias, getCamposActivos } from "../../../store/slices/combustibles";
import { Alert, Badge, Spinner } from "react-bootstrap";

export const ActivosList = (familia = "") => { // Ahora puede recibir familia
	const dispatch = useDispatch();
	const { combustibles = [], isLoading, errorMessage } = useSelector((state) => state.combustibles);
	const campos = useSelector(state => state.combustibles.activosCampos);

	useEffect(() => {
		const fetchData = async () => {
			// Solo si hay una familia seleccionada disparamos la petición
			if (familia !== "") {
				await dispatch(getActivos(familia));
			}
			dispatch(getSubFamilias());
			// dispatch(getCamposActivos()); // Asegúrate de cargar los campos también si es necesario
		};
		fetchData();
	}, [dispatch, familia]); // Se vuelve a ejecutar cuando 'familia' cambia

	const formatDateString = (dateString) => {
		if (!dateString) return '';
		const date = new Date(dateString);
		return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
	};

	// 2. CORRECCIÓN CRUCIAL: Añadido el return dentro del useMemo
    const updatedData = useMemo(() => {
        // El safe check (combustibles || []) evita que truene si Redux devuelve undefined
        return (combustibles || []).map(item => {
            const campoEncontrado = (campos || []).find(campo => campo.cCodigoCam === item.cCodigoCam);

            return {
                cCodigoAfi: item.cNumeconAfi?.trim(),
                vNombreAfi: item.vNombreAfi?.trim(),
                activo: item.cActivoAfi?.trim(),
                vMarcaAfi: item.vMarcaAfi?.trim(),
                vModeloAfi: item.vModeloAfi?.trim(),
                vNumserieAfi: item.vNumserieAfi?.trim(),
                cCodigorelAfi: item.vPlacasAfi?.trim(),
                cNoDepreciarAfi: item.cNoDepreciarAfi?.trim(),
                cOperativoAfi: item.cOperativoAfi?.trim(),
                cRutafactAfi: item.cRutafactAfi?.trim(),
                vPlacasAfi: item.vPlacasAfi?.trim(),
                vNombreCam: campoEncontrado ? campoEncontrado.vNombreCam : null,
                idActivoAti: item.idActivoAti,
                cNumeconAfiExtra: item.cNumeconAfiExtra?.trim(),
                cReponsivaAti: item.cReponsivaAti?.trim(),
                cResponsableAti: item.cResponsableAti?.trim(),
                cCodigoCam: item.cCodigoCam?.trim(),
                vEmailAti: item.vEmailAti?.trim(),
                vPwdemailAti: item.vPwdemailAti?.trim(),
                vAntivirusAti: item.vAntivirusAti?.trim(),
                vOfficeAti: item.vOfficeAti?.trim(),
                vTipoAti: item.vTipoAti?.trim(),
                vMarcaAti: item.vMarcaAti?.trim(),
                vSerieAti: item.vSerieAti?.trim(),
                dFcompraAti: formatDateString(item.dFcompraAti),
                vNombrePrv: item.vNombrePrv?.trim(),
                nCostoAti: item.nCostoAti,
                dFgarantiaAti: formatDateString(item.dFgarantiaAti),
                vModeloAti: item.vModeloAti?.trim(),
                dFasignacionAti: formatDateString(item.dFasignacionAti),
                vVerwindowsAti: item.vVerwindowsAti?.trim(),
                vProcesadorAti: item.vProcesadorAti?.trim(),
                vMemoriaAti: item.vMemoriaAti?.trim(),
                vDiscoduroAti: item.vDiscoduroAti?.trim(),
                vUsreclipseAti: item.vUsreclipseAti?.trim(),
                vPwdeclipseAti: item.vPwdeclipseAti?.trim(),
                vUsrrdAti: item.vUsrrdAti?.trim(),
                vPwdremotoAti: item.vPwdremotoAti?.trim(),
                vComentariosAti: item.vComentariosAti?.trim(),
                vDocresponsivaAti: item.vDocresponsivaAti?.trim(),
                vDepartamentoAti: item.vDepartamentoAti?.trim(),
                vNombreEmpleado: item.vNombreEmpleado?.trim(),
            };
        });
    }, [combustibles, campos]);

	return {
		data: updatedData,
		isLoading,
		errorMessage,
	};
};