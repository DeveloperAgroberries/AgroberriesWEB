import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCombustibles } from "../../../store/slices/combustiblesMod";

export const CombustiblesList = () => { // Ya no recibe openAddActivo como prop si solo devuelve datos
  const dispatch = useDispatch();
  const { combustibles = [], isLoading: isLoading, errorMessage: errorMessage } = useSelector((state) => state.combustiblesMod);
  // const { combustibles = [], isLoading: isLoading, errorMessage: errorMessage } = useSelector(state => state.combustiblesMod.combustibles);

  useEffect(() => {
    const fetchData = async () => {
      await dispatch(getCombustibles());
    };
    fetchData();
  }, [dispatch]);

  // console.log("combustibleList:", combustibles); // <---- ¿Qué se imprime aquí?

const combustibleData = combustibles.map(item => ({
    cNumeconAfi: item.cNumeconAfi?.trim() || '',
    dConsumoCom: item.dConsumoCom?.trim() || '',
    vNombreTra: item.vNombreTra?.trim() || '',
    nLitrosCom: item.nLitrosCom?.toString().trim() || '',
    cCodigoCam: item.campo?.trim() || '',
    cCodigoZon: item.zona?.trim() || '',
    cCodigoAct: item.actividad?.trim() || '',
}));

  return {
    data: combustibleData,
    isLoading: isLoading,
    errorMessage: errorMessage,
  };
};