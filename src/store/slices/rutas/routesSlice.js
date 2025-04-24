import { createSlice } from '@reduxjs/toolkit';

export const routeSlice = createSlice({
	name: 'route',
	initialState: {
		routes: [],
		isLoading: false,
		errorMessage: null
	},
	reducers:{
		setRoutes: (state, action) => {
			state.routes = action.payload.routes;
			state.isLoading = false;
			state.errorMessage = null;
		},
		addNewRoute:(state, action)=>{
			state.routes.push(action.payload.route);
			state.isLoading = false;
			state.errorMessage = action.payload?.errorMessage || null;
		},
		updateRoute: (state, action) => {
			const updatedRoute = action.payload.route;
			state.routes = state.routes.map(route => 
			   route.cControlRut === updatedRoute.cControlRut ? updatedRoute : route
			);
			state.isLoading = false;
			state.errorMessage = action.payload?.errorMessage || null;
		 },
		 deleteRouteById:(state, action)=>{
			const routeId = action.payload.id;
			state.routes = state.routes.filter(route => route.cControlRut !== routeId);
			state.isLoading = false;
			state.errorMessage = null;
		 },
		 checkingIsLoading:(state)=>{
			state.isLoading = true;
		 }
	}
});

export const {setRoutes, addNewRoute, updateRoute, deleteRouteById, checkingIsLoading } = routeSlice.actions;