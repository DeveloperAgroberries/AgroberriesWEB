import { phytosanitaryApi } from "../../../api/phytosanitaryApi";
import { setLots, setPests, setPhytosanitaryRecords, setTunnelTable } from "./phytosanitarySlice";

export const getPhytosanitaryRecords = () =>{
    return async( dispatch ) => {

        const { data } = await phytosanitaryApi.get('/ListPhytosanitaryRecords');
        dispatch( setPhytosanitaryRecords({ phytosanitaryRecords: data.response }) );
    
    }
}

export const getTunnelTable = () =>{
    return async( dispatch ) => {

        const { data } = await phytosanitaryApi.get('/ListTunnelTable');
        dispatch( setTunnelTable({ tunnelTable: data.response }) );
    
    }
}

export const getPests = () =>{
    return async( dispatch ) => {

        const { data } = await phytosanitaryApi.get('/ListPests');
        dispatch( setPests({ pests: data.response }) );
    
    }
}

export const getLots = () =>{
    return async( dispatch ) => {

        const { data } = await phytosanitaryApi.get('/ListLots/05');
        dispatch( setLots({ lots: data.response }) );
    
    }
}
