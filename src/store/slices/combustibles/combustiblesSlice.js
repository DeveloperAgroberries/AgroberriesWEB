import { createSlice } from '@reduxjs/toolkit';

export const combustiblesSlice = createSlice({
    name: 'combustible',
    initialState: {
        combustibles: [],
        isLoading: false,
        errorMessage: null,
        subfamilias: [],
        isLoadingSubfamilias: false,
        errorMessageSubfamilias: null,
        codeResponse: null,
        isLoadingCode: false,
        errorCode: null,
        proveedores: [],
        isLoadingProveedores: false,
        errorMessageProveedores: null,

        empresas: [],
        isLoadingEmpresas: false,
        errorMessageEmpresas: null,

        departamentos: [],
        isLoadingDepartamentos: false,
        errorMessageDepartamentos: null,
        // Nuevos estados para lotes y actividades
        actividadesFijas: [],
        isLoadingActividadesFijas: false,
        errorMessageActividadesFijas: null,
        lotesActivos: [],
        isLoadingLotesActivos: false,
        errorMessageLotesActivos: null,
        activosCampos: [],
        isLoadingCamposActivos: false,
        errorMessageCamposActivos: null,
        activoF: [],
        //List choferes
        isLoadingChoferes: false,
        errorMessageChoferes: null,
        choferes: []
    },
    reducers: {
        checkingIsLoading: (state) => {
            state.isLoading = true;
        },
        checkingIsLoadingSubfamilias: (state) => {
            state.isLoadingSubfamilias = true;
        },
        checkingIsLoadingCode: (state) => {
            state.isLoadingCode = true;
            state.codeResponse = null;
            state.errorCode = null;
        },
        checkingIsLoadingProveedores: (state) => {
            state.isLoadingProveedores = true;
            state.proveedores = [];
            state.errorMessageProveedores = null;
        },
        checkingIsLoadingEmpresas: (state) => {
            state.isLoadingEmpresas = true;
            state.empresas = [];
            state.errorMessageEmpresas = null;
        },
        checkingIsLoadingDepartamentos: (state) => {
            state.isLoadingDepartamentos = true;
            state.departamentos = [];
            state.errorMessageDepartamentos = null;
        },
        // Nuevos estados de carga para actividades fijas y lotes activos
        checkingIsLoadingActividadesFijas: (state) => {
            state.isLoadingActividadesFijas = true;
            state.actividadesFijas = [];
            state.errorMessageActividadesFijas = null;
        },
        checkingIsLoadingLotesActivos: (state) => {
            state.isLoadingLotesActivos = true;
            state.lotesActivos = [];
            state.errorMessageLotesActivos = null;
        },
        setActivos: (state, action) => {
            state.combustibles = action.payload.activos;
            state.isLoading = false;
        },
        setSubFamilias: (state, action) => {
            state.subfamilias = action.payload;
            state.isLoadingSubfamilias = false;
            state.errorMessageSubFamilias = null;
        },
        setCodeData: (state, action) => {
            state.codeResponse = action.payload;
            state.isLoadingCode = false;
            state.errorCode = null;
        },
        setProveedores: (state, action) => {
            state.isLoadingProveedores = false;
            state.proveedores = action.payload;
            state.errorMessageProveedores = null;
        },
        setEmpresas: (state, action) => {
            state.isLoadingEmpresas = false;
            state.empresas = action.payload;
            state.errorMessageEmpresas = null;
        },
        setDepartamentos: (state, action) => {
            state.isLoadingDepartamentos = false;
            state.departamentos = action.payload;
            state.errorMessageDepartamentos = null;
        },
        // Nuevas acciones para setear actividades fijas y lotes activos
        setActividadesFijas: (state, action) => {
            state.isLoadingActividadesFijas = false;
            state.actividadesFijas = action.payload;
            state.errorMessageActividadesFijas = null;
        },
        setLotesActivos: (state, action) => {
            state.isLoadingLotesActivos = false;
            state.lotesActivos = action.payload;
            state.errorMessageLotesActivos = null;
        },
        setError: (state, action) => {
            state.errorMessage = action.payload;
            state.isLoading = false;
        },
        setErrorSubFamilias: (state, action) => {
            state.errorMessageSubFamilias = action.payload;
            state.isLoadingSubfamilias = false;
        },
        setErrorCode: (state, action) => {
            state.errorCode = action.payload;
            state.isLoadingCode = false;
            state.codeResponse = null;
        },
        setErrorProveedores: (state, action) => {
            state.isLoadingProveedores = false;
            state.errorMessageProveedores = action.payload;
            state.proveedores = [];
        },
        setErrorEmpresas: (state, action) => {
            state.isLoadingEmpresas = false;
            state.errorMessageEmpresas = action.payload;
            state.empresas = [];
        },
        setErrorDepartamentos: (state, action) => {
            state.isLoadingDepartamentos = false;
            state.errorMessageDepartamentos = action.payload;
            state.departamentos = [];
        },
        // Nuevas acciones para setear errores de actividades fijas y lotes activos
        setErrorActividadesFijas: (state, action) => {
            state.isLoadingActividadesFijas = false;
            state.errorMessageActividadesFijas = action.payload;
            state.actividadesFijas = [];
        },
        setErrorLotesActivos: (state, action) => {
            state.isLoadingLotesActivos = false;
            state.errorMessageLotesActivos = action.payload;
            state.lotesActivos = [];
        },
        //ADD ACTIVO FIJO
        addNewActivoFijo: (state, action) => {
			state.activoF.push(action.payload.activoF);
			state.isLoading = false;
			state.errorMessage = action.payload?.errorMessage || null;
		},
        //CAMPOS ************
        setCamposActivos: (state, action) => {
            state.isLoadingCamposActivos = false;
            state.activosCampos = action.payload;
            state.errorMessageCamposActivos = null;
        },
        setErrorCamposActivos: (state, action) => {
            state.isLoadingCamposActivos = false;
            state.errorMessageCamposActivos = action.payload;
            state.activosCampos = [];
        },

        checkingIsLoadingChoferes: (state) => {
            state.isLoadingChoferes = true;
            state.choferes = [];
            state.errorMessageChoferes = null;
        },
        setChoferes: (state, action) => {
            state.isLoadingChoferes = false;
            state.choferes = action.payload;
            state.errorMessageChoferes = null;
        },
        setErrorChoferes: (state, action) => {
            state.isLoadingChoferes = false;
            state.errorMessageChoferes = action.payload;
            state.choferes = [];
        },
        // ********************
    },
});

export const {
    checkingIsLoading,
    setActivos,
    setError,
    checkingIsLoadingSubfamilias,
    setSubFamilias,
    setErrorSubFamilias,
    checkingIsLoadingCode,
    setCodeData,
    setErrorCode,
    checkingIsLoadingProveedores,
    setProveedores,
    setErrorProveedores,
    checkingIsLoadingEmpresas,
    setEmpresas,
    setErrorEmpresas,
    checkingIsLoadingDepartamentos,
    setDepartamentos,
    setErrorDepartamentos,
    // Exporta las nuevas acciones para lotes y actividades
    checkingIsLoadingActividadesFijas,
    setActividadesFijas,
    setErrorActividadesFijas,
    checkingIsLoadingLotesActivos,
    setLotesActivos,
    setErrorLotesActivos,
    addNewActivoFijo, //insert activo
    setCamposActivos,
    setErrorCamposActivos, //CAMPOS
    //Choferes
    checkingIsLoadingChoferes,
    setChoferes,
    setErrorChoferes
} = combustiblesSlice.actions;

export default combustiblesSlice.reducer;