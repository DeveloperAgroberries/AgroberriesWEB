import { useState } from 'react';

export const useForm = ( initialForm = {} ) => {
  
    const [ formState, setFormState ] = useState( initialForm );

    const onInputChange = ({ target }) => {
        const { name, value, type, checked } = target;
        setFormState({
            ...formState,
            // [ name ]: value
            [name]: type === 'checkbox' ? (checked ? 1 : 0) : value

        });
    }

    const onResetForm = () => {
        setFormState( initialForm );
    }

    return {
        ...formState,
        formState,
        onInputChange,
        onResetForm,
    }
}