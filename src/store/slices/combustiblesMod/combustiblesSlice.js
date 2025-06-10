// import { createSlice } from '@reduxjs/toolkit';

// export const combustiblesSlice = createSlice({
//     name: 'combustible',
//     initialState: {
//         combustiblesF: [],
//         isLoading: false,
//         errorMessage: null
//     },
//     reducers: {

//         checkingIsLoadingCombustibles: (state) => {
//             state.isLoading = true;
//             state.combustiblesF = [];
//             state.errorMessage = null;
//         },

//         setCombustibles: (state, action) => {
//     state.isLoading = false;
//     state.combustiblesF = action.payload.combustiblesF; // <<< CAMBIADO AQUÍ
//     state.errorMessage = null;
// },

//         setErrorCombustibles: (state, action) => {
//             state.isLoading = false;
//             state.errorMessage = action.payload;
//             state.combustiblesF = [];
//         }
//     },
// });

// export const {
//     checkingIsLoadingCombustibles,
//     setCombustibles,
//     setErrorCombustibles
// } = combustiblesSlice.actions; //CAMPOS

// // export const {combustiblesSlice} = combustiblesSlice.actions;
import { createSlice } from '@reduxjs/toolkit';

export const combustibleModSlice = createSlice({
	name: 'combustiblesMod',
	initialState: {
		combustibles: [],
		isLoading: false,
		errorMessage: null,

		campos: [],
		isLoadingCampos: false,
		errorMessageCampos: null,

		trabajador: [],
		isLoadingTrabajador: false,
		errorMessageTrabajador: null,

		activo: [],
		isLoadingActivo: false,
		errorMessageActivo: null,

		reporte: [],
		isLoadingReporte: false,
		errorMessageReporte: null
	},
	reducers: {
		setCombustibles: (state, action) => {
			state.combustibles = action.payload.combustibles;
			state.isLoading = false;
			state.errorMessage = null;
		},
		setCampos: (state, action) => {
			state.campos = action.payload.campos;
			state.isLoadingCampos = false;
			state.errorMessageCampos = null;
		},
		//************************  Nombre Trabajador  ************************* */
		checkingIsLoadingTrabajador: (state) => {
            state.isLoadingTrabajador = true;
            state.trabajador = [];
            state.errorMessageTrabajador = null;
        },
		setTrabajador: (state, action) => {
            state.isLoadingTrabajador = false;
            state.trabajador = action.payload;
            state.errorMessageTrabajador = null;
        },
		setErrorTrabajador: (state, action) => {
            state.isLoadingTrabajador = false;
            state.errorMessageTrabajador = action.payload;
            state.trabajador = [];
        },
		//******************************************************** */

		//************************  Nombre Activo  ************************* */
		checkingIsLoadingActivo: (state) => {
            state.isLoadingActivo = true;
            state.activo = [];
            state.errorMessageActivo = null;
        },
		setActivo: (state, action) => {
            state.isLoadingActivo = false;
            state.activo = action.payload;
            state.errorMessageActivo = null;
        },
		setErrorActivo: (state, action) => {
            state.isLoadingActivo = false;
            state.errorMessageActivo = action.payload;
            state.activo = [];
        },
		//******************************************************** */

		//************************  Reporte Combustible  ************************* */
		checkingIsLoadingReporte: (state) => {
            state.isLoadingReporte = true;
            state.reporte = [];
            state.errorMessageReporte = null;
        },
		setReporte: (state, action) => {
            state.isLoadingReporte = false;
            state.reporte = action.payload;
            state.errorMessageReporte = null;
        },
		setErrorReporte: (state, action) => {
            state.isLoadingActivo = false;
            state.errorMessageActivo = action.payload;
            state.activo = [];
        },
		//******************************************************** */

		addNewRegistro: (state, action) => {
			state.combustibles.push(action.payload);
			state.isLoading = false;
			state.errorMessage = action.payload?.errorMessage || null;
		},
		checkingIsLoading: (state) => {
			state.isLoading = true;
		}
	}
});

// Action creators are generated for each case reducer function
export const { setCombustibles, setCampos, addNewRegistro, setActivo, setTrabajador, setErrorTrabajador, setErrorActivo, checkingIsLoadingActivo, checkingIsLoadingTrabajador, checkingIsLoading, checkingIsLoadingReporte, setReporte, setErrorReporte } = combustibleModSlice.actions;