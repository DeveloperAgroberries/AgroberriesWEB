import jsPDF from "jspdf";
import logoag from '../../../assets/logoag.png';

const generarResponsivaPDF = (formData, searchEmpleado) => {
    const doc = new jsPDF();
    const PAGE_HEIGHT_LIMIT = 265;
    const FOOTER_Y_POS = 285;
    const FOOTER_TEXT_LEFT = "AGROBERRIES MEXICO";
    const FOOTER_TEXT_RIGHT = "Página";

    const {
        idActivoAti,
        cNumeconAfi,
        vTipoAti,
        vMarcaAti,
        vSerieAti,
        vModeloAti,
        dFcompraAti,
        vNombrePrv,
        nCostoAti,
        dFgarantiaAti,
        vVerwindowsAti,
        vAntivirusAti,
        vOfficeAti,
        vDiscoduroAti,
        vMemoriaAti,
        vDepartamentoAti
    } = formData;

    // Obtiene la fecha actual del sistema
    const currentDate = new Date();
    // Formatea la fecha en español
    const formattedDate = currentDate.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Función para agregar el encabezado (solo se usará una vez)
    const addHeader = (doc) => {
        const imgWidth = 100;
        const imgHeight = 20;
        const pageWidth = doc.internal.pageSize.getWidth();
        const xPos = (pageWidth / 2) - (imgWidth / 2);

        // ✅ Usa la variable del logo importada directamente aquí.
        doc.addImage(logoag, 'PNG', xPos, 12, imgWidth, imgHeight);

        return 35; // Retorna la nueva posición Y debajo del logo
    };

    // Función para agregar el pie de página
    const addFooter = (doc, currentPage) => {
        doc.setFontSize(8);
        doc.text(FOOTER_TEXT_LEFT, 14, FOOTER_Y_POS);
        doc.text(`${FOOTER_TEXT_RIGHT} ${currentPage}`, doc.internal.pageSize.getWidth() - 25, FOOTER_Y_POS);
    };

    // Función para dibujar texto y manejar saltos de página
    const drawTextAndHandlePageBreaks = (doc, text, yPos, x, maxWidth, isBold = false) => {
        if (isBold) doc.setFont(undefined, 'bold');
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.setFont(undefined, 'normal');
        doc.setFontSize(7);

        lines.forEach(line => {
            if (yPos > PAGE_HEIGHT_LIMIT) {
                // Obtiene el número de página actual antes de agregar la nueva
                const currentPage = doc.internal.getNumberOfPages();
                addFooter(doc, currentPage);

                doc.addPage();
                yPos = 20; // Reinicia la posición Y en la nueva página
            }
            if (isBold) {
                doc.setFont(undefined, 'bold');
                doc.text(line, x, yPos);
                doc.setFont(undefined, 'normal');
            } else {
                doc.text(line, x, yPos);
            }
            yPos += 3;
        });
        return yPos;
    };

    // Función auxiliar para formatear la fecha a YYYY-MM-DD
	const formatDateString = (dateString) => {
		if (!dateString) return '';

		// Crea un objeto de fecha
		const date = new Date(dateString);

		// Obtiene los componentes de la fecha
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');

		// Regresa la fecha en formato YYYY-MM-DD
		return `${day}-${month}-${year}`;
	};

    let yPos = addHeader(doc);
    const fieldX = 20; // Posición X para la columna de "Campo"
    const valueX = 70; // Posición X para la columna de "Valor"

    // ... (El resto del código de tu documento es el mismo) ...

    yPos = drawTextAndHandlePageBreaks(doc, "AGROBERRIES MEXICO", yPos, 14, 180, true);
    yPos = drawTextAndHandlePageBreaks(doc, "Responsiva de uso de Software y Hardware propiedad de la Compañía", yPos, 14, 180);

    yPos = drawTextAndHandlePageBreaks(doc, "Punto 1", yPos + 8, 14, 180, true);
    yPos = drawTextAndHandlePageBreaks(doc, `La compañía Inversiones Agrícolas Expoberries S de R.L. de C.V. que para los efectos legales de esta declaración se denominará en lo sucesivo "La Empresa", manifiesta que el equipo electrónico y o de cómputo cuyas características técnicas se describen en el "Anexo 1" es propiedad de "La Empresa" o lo tiene bajo contrato de Arrendamiento y que ha sido asignado al área de "${vDepartamentoAti}" para que sea utilizado como herramienta de trabajo en el desempeño de su puesto bajo la responsabilidad de ${searchEmpleado} quien en lo sucesivo será llamado "El Empleado".`, yPos, 14, 180);

    yPos = drawTextAndHandlePageBreaks(doc, "Punto 2", yPos + 5, 14, 180, true);
    yPos = drawTextAndHandlePageBreaks(doc, `"El Empleado" recibe y conviene en que el equipo objeto de esta responsiva se encuentra en perfecto funcionamiento y sus características corresponden con las detalladas en el documento anexo marcado con el título "Anexo 1" a nombre de su recepción. Además, características como número de línea, plan de voz y datos, accesorios y otros servicios para dispositivos móviles serán detallados en el mismo “Anexo 1” y que será firmado por "El Empleado".`, yPos, 14, 180);

    yPos = drawTextAndHandlePageBreaks(doc, "Punto 3", yPos + 5, 14, 180, true);
    yPos = drawTextAndHandlePageBreaks(doc, `"La Empresa" declara que proporcionará el mantenimiento preventivo y/o correctivo, así como las actualizaciones del equipo derivadas por el uso y desgaste normal del mismo o las que juzgue convenientes para garantizar el correcto desempeño de este directamente en el domicilio fiscal de “La Empresa”. "El Empleado" tiene el derecho y la obligación de reportar anomalías en el funcionamiento del equipo para que estas sean atendidas y resueltas por personal calificado a la brevedad posible para que no afecten sus labores diarias.`, yPos, 14, 180);

    yPos = drawTextAndHandlePageBreaks(doc, "Punto 4", yPos + 5, 14, 180, true);
    yPos = drawTextAndHandlePageBreaks(doc, `"El Empleado" a su vez se compromete a proporcionar el trato debido al equipo y a no realizar ningún tipo de instalación, modificación y/o actualización de hardware y/o software fuera de la información generada por el cumplimiento de sus obligaciones laborales bajo la pena de incurrir en sanciones de carácter administrativo o legal según sea el caso. Cualquier reparación no autorizada al equipo asignado en esta responsiva, será sancionada respecto a las políticas internas de la empresa.`, yPos, 14, 180);

    yPos = drawTextAndHandlePageBreaks(doc, "Punto 5", yPos + 5, 14, 180, true);
    yPos = drawTextAndHandlePageBreaks(doc, `Queda expresamente prohibido que "El Empleado" instale software tal como juegos, aplicaciones, programas, etcétera, de origen externo con respecto a los suministrados por "La Empresa" y detallados en el "Anexo 1" de este documento. De igual forma le está sancionado destinar el equipo a otra actividad diferente de la especificada o aún permitir que terceros procedan de la misma forma, siendo o no miembros de "La Empresa".`, yPos, 14, 180);
    yPos = drawTextAndHandlePageBreaks(doc, `Toda actualización o cambio será hecho por el personal de Sistemas de "La Empresa" o el personal que esta designe para tales efectos.`, yPos, 14, 180);

    yPos = drawTextAndHandlePageBreaks(doc, "Punto 6", yPos + 5, 14, 180, true);
    yPos = drawTextAndHandlePageBreaks(doc, `La gerencia de Sistemas de "La Empresa" se reserva el derecho de bloquear cualquier software que no esté autorizado por la misma. Cualquier software y/o dispositivo que "El Empleado" requiera que esté instalado en el equipo, deberá ser solicitado mediante un escrito, que esté justificado y autorizado por su jefe inmediato y el gerente del área de sistemas.`, yPos, 14, 180);

    yPos = drawTextAndHandlePageBreaks(doc, "Punto 7", yPos + 5, 14, 180, true);
    yPos = drawTextAndHandlePageBreaks(doc, `"El Empleado" se compromete a no hacer uso inadecuado, publicar y/o divulgar la información a que tenga acceso ni las características de su equipo a ninguna persona o institución ajena a "La Empresa".`, yPos, 14, 180);

    yPos = drawTextAndHandlePageBreaks(doc, "Punto 8", yPos + 5, 14, 180, true);
    yPos = drawTextAndHandlePageBreaks(doc, `Todo mal funcionamiento o los daños por uso inadecuado corren por parte del usuario, así como los derrames de líquidos sobre cualquier parte del equipo causarán sanciones administrativas y/o legales según el grado y tipo de la falta cometida. Para la determinación y aplicación de dichas sanciones "El Empleado" se somete al juicio de los Directivos de "La Empresa" y/o las autoridades correspondientes.`, yPos, 14, 180);

    yPos = drawTextAndHandlePageBreaks(doc, "Punto 9", yPos + 5, 14, 180, true);
    yPos = drawTextAndHandlePageBreaks(doc, `No está permitida la contraseña de arranque de computadora, solo de usuario de Windows. Además, deberá hacer del conocimiento del personal del área de Sistemas de "La Empresa", aquellas claves de seguridad que se consideren necesarias para poder brindarle soporte y mantenimiento.`, yPos, 14, 180);

    yPos = drawTextAndHandlePageBreaks(doc, "Punto 10", yPos + 5, 14, 180, true);
    yPos = drawTextAndHandlePageBreaks(doc, `Queda prohibido que "El Empleado" substraiga equipo de cómputo o componentes de las instalaciones de "La Empresa", excepto aquellas áreas o personas que para poder realizar su trabajo así lo requieran y que tengan asignado un dispositivo móvil, ya sea equipo de cómputo o teléfono celular, y no deberá quitar o maltratar etiquetas de control existentes en el equipo como son números de serie o modelo de los equipos. Solo el gerente del área de Sistemas de "La Empresa" tiene la facultad de autorizar cualquier cambio al equipo.`, yPos, 14, 180);

    yPos = drawTextAndHandlePageBreaks(doc, "Punto 11", yPos + 5, 14, 180, true);
    yPos = drawTextAndHandlePageBreaks(doc, `El responsable del área de Sistemas o cualquiera de sus colaboradores podrá efectuar revisiones periódicas al equipo en forma aleatoria con el fin de verificar la integridad de este reportando cualquier anomalía encontrada.`, yPos, 14, 180);

    yPos = drawTextAndHandlePageBreaks(doc, "Punto 12", yPos + 5, 14, 180, true);
    yPos = drawTextAndHandlePageBreaks(doc, `En lo que respecta al uso de Internet, este servicio se otorga por parte de "La Empresa", estando dentro de la misma y con excepciones para el personal que viaja, al cual se le podrá contratar algún servicio adicional o por medio de algún dispositivo móvil, siempre con el fin de aprovechar el potencial de negocios que aporta a la operación. Su uso es solo para personal autorizado por "La empresa" mientras que para el resto del personal de confianza se limitará únicamente a la utilización de un buzón de correo electrónico empresarial.`, yPos, 14, 180);

    yPos = drawTextAndHandlePageBreaks(doc, "Punto 13", yPos + 5, 14, 180, true);
    yPos = drawTextAndHandlePageBreaks(doc, `Queda expresamente prohibido recibir y/o difundir mediante internet información tal como cartas cadena, promociones, archivos, imágenes, propaganda o cualesquiera otros tipos de forma de almacenamiento de datos no relacionada con el desempeño de las labores de “El Empleado”. “El empleado” que sea sorprendido haciendo mal uso de estas herramientas se hará acreedor a la cancelación total e inmediata del mismo, así como a las sanciones administrativas y penales que se generen.`, yPos, 14, 180);

    yPos = drawTextAndHandlePageBreaks(doc, "Punto 14", yPos + 5, 14, 180, true);
    yPos = drawTextAndHandlePageBreaks(doc, `Queda estrictamente prohibido el instalar cualquier aplicación de Internet para descargar o escuchar música, así como sintonizar estaciones de radio. El uso de mensajería instantánea deberá ser autorizado por las gerencias de cada área para que pueda ser instalado. Está prohibido el uso de cualquier red social que no esté debidamente autorizada por el jefe directo de cada área y solo deberá ser utilizada para fines empresariales. “El empleado” que sea sorprendido haciendo mal uso de estas herramientas se hará acreedor a las sanciones administrativas que se generen.`, yPos, 14, 180);

    yPos = drawTextAndHandlePageBreaks(doc, "Punto 15", yPos + 5, 14, 180, true);
    yPos = drawTextAndHandlePageBreaks(doc, `El usuario y contraseña asignados para uso del equipo de cómputo y/o cualquier sistema informático de la empresa es personal, por lo que, cualquier forma de compartición del mismo con otros usuarios para realizar tareas en nombre del titular, será sancionado de acuerdo a los reglamentos de la empresa a través del departamento de recursos humanos.`, yPos, 14, 180);

    yPos = drawTextAndHandlePageBreaks(doc, "Punto 16", yPos + 5, 14, 180, true);
    yPos = drawTextAndHandlePageBreaks(doc, `Establecidas las bases de esta responsiva "El Empleado" se da por enterado de sus derechos y obligaciones y firma de conformidad sometiéndose a las autoridades competentes para la interpretación de la presente en el caso de los puntos no considerados en la misma. Las impresiones posteriores de este mismo documento sustituyen las anteriores siempre y cuando ambas partes las firmen de conformidad.`, yPos, 14, 180);

    const centerX = doc.internal.pageSize.getWidth() / 2;
    const centerXemp = doc.internal.pageSize.getWidth() / 2.3;
    const centerXnuevFirma = doc.internal.pageSize.getWidth() / 2.15;
    const letreroEmpresa = doc.internal.pageSize.getWidth() / 2.1;
    const centerXfecha = doc.internal.pageSize.getWidth() / 2.35;
    const centerXempresa = doc.internal.pageSize.getWidth() / 2.65;
    const centerXdepTI = doc.internal.pageSize.getWidth() / 2.3;
    const signatureLine = "________________________________________________";
    const signatureLineWidth = doc.getStringUnitWidth(signatureLine) * doc.internal.getFontSize();

    yPos += 20;
    yPos = drawTextAndHandlePageBreaks(doc, signatureLine, yPos, centerX - (signatureLineWidth / 5.8), 180, false);
    yPos = drawTextAndHandlePageBreaks(doc, `"Nombre y firma del Empleado"`, yPos, centerXemp, 180, false);
    // yPos = drawTextAndHandlePageBreaks(doc, `${searchEmpleado}`, yPos, centerXnombre, 180, false);
    // yPos = drawTextAndHandlePageBreaks(doc, `viernes, 29 de diciembre de 2023`, yPos, centerXfecha, 180, false);
    yPos = drawTextAndHandlePageBreaks(doc, formattedDate, yPos, centerXfecha, 180, false, 'center'); // <--- Y aquí


    doc.addPage();
    yPos = addHeader(doc);
    yPos = drawTextAndHandlePageBreaks(doc, "Anexo 1", yPos, 14, 180, true);
    yPos = drawTextAndHandlePageBreaks(doc, `Inversiones Agrícolas Expoberries S de R.L. de C.V. que en lo sucesivo se denominará "La Empresa", ha dispuesto el equipo y programas de cómputo detallados en este documento como herramientas de trabajo para el uso y servicio de "El Empleado" del área de Producción, quién a su vez lo recibe en completo funcionamiento y lo acepta de conformidad de acuerdo al siguiente inventario:`, yPos, 14, 180);

    yPos += 10;
    yPos = drawTextAndHandlePageBreaks(doc, "EQUIPO DE CÓMPUTO", yPos, 14, 180, true);

    // Dibuja cada fila de la tabla
    yPos += 3;
    doc.text("Tipo:", fieldX, yPos);
    doc.text(vTipoAti, valueX, yPos);

    yPos += 3;
    doc.text("Marca:", fieldX, yPos);
    doc.text(vMarcaAti, valueX, yPos);

    yPos += 3;
    doc.text("Modelo:", fieldX, yPos);
    doc.text(vModeloAti, valueX, yPos);

    yPos += 3;
    doc.text("Serie:", fieldX, yPos);
    doc.text(vSerieAti, valueX, yPos);

    yPos += 3;
    doc.text("Memoria/Disco Duro:", fieldX, yPos);
    doc.text(`${vMemoriaAti}, ${vDiscoduroAti}`, valueX, yPos);

    yPos += 3;
    doc.text("Software preinstalado:", fieldX, yPos);
    doc.text(`${vVerwindowsAti}, ${vAntivirusAti}, ${vOfficeAti}`, valueX, yPos);

    yPos += 3;
    doc.text("Costo de Equipo:", fieldX, yPos);
    doc.text(`$${nCostoAti}`, valueX, yPos);

    yPos += 3;
    doc.text("Fecha de compra:", fieldX, yPos);
    doc.text(formatDateString(dFcompraAti), valueX, yPos);

    yPos += 3;
    doc.text("Fecha de garantía:", fieldX, yPos);
    doc.text(formatDateString(dFgarantiaAti), valueX, yPos);

    yPos += 3;
    doc.text("Número de activo:", fieldX, yPos);
    doc.text(cNumeconAfi, valueX, yPos);

    //Extras de equipo asignado
    // yPos += 10;
    // yPos = drawTextAndHandlePageBreaks(doc, "EQUIPO DE TELEFONÍA MÓVIL", yPos, 14, 180, true);
    // yPos = drawTextAndHandlePageBreaks(doc, `Marca: Motorola`, yPos, 14, 180);
    // yPos = drawTextAndHandlePageBreaks(doc, `Modelo: Moto G50`, yPos, 14, 180);
    // yPos = drawTextAndHandlePageBreaks(doc, `Número asignado: +52 333.405.6740`, yPos, 14, 180);
    // yPos = drawTextAndHandlePageBreaks(doc, `Serie: ZY22FDLJ8W`, yPos, 14, 180);
    // yPos = drawTextAndHandlePageBreaks(doc, `Costo de Equipo: 4481.9`, yPos, 14, 180);

    yPos += 10;
    yPos = drawTextAndHandlePageBreaks(doc, `EQUIPOS ADICIONALES ASIGNADOS AL USUARIO`, yPos, 14, 180, true);

    yPos += 5;
    yPos = drawTextAndHandlePageBreaks(doc, `Nota: Esta responsiva inhabilita cualquier otra responsiva previa.`, yPos, 14, 180, true);

    const signatureLineAnexo = "_________________________________________";
    const signatureLineAnexoWidth = doc.getStringUnitWidth(signatureLineAnexo) * doc.internal.getFontSize();

    yPos += 20;
    yPos = drawTextAndHandlePageBreaks(doc, signatureLineAnexo, yPos, centerX - (signatureLineAnexoWidth / 5.8), 180, false, 'left');
    yPos = drawTextAndHandlePageBreaks(doc, `"Nombre y firma del Empleado"`, yPos, centerXemp, 180, false);
    // yPos = drawTextAndHandlePageBreaks(doc, `${searchEmpleado}`, yPos, centerXnombre, 180, false, 'center');
    yPos = drawTextAndHandlePageBreaks(doc, formattedDate, yPos, centerXfecha, 180, false, 'center'); // <--- Y aquí

    yPos += 10;
    yPos = drawTextAndHandlePageBreaks(doc, signatureLineAnexo, yPos, centerX - (signatureLineAnexoWidth / 5.8), 180, false, 'left');
    yPos = drawTextAndHandlePageBreaks(doc, `"Jefe Directo"`, yPos, letreroEmpresa, 180, false, 'center');
    yPos = drawTextAndHandlePageBreaks(doc, `"Nombre y Firma"`, yPos, centerXnuevFirma, 180, false);
    yPos = drawTextAndHandlePageBreaks(doc, formattedDate, yPos, centerXfecha, 180, false, 'center'); // <--- Y aquí

    yPos += 10;
    yPos = drawTextAndHandlePageBreaks(doc, signatureLineAnexo, yPos, centerX - (signatureLineAnexoWidth / 5.8), 180, false, 'left');
    yPos = drawTextAndHandlePageBreaks(doc, `"La Empresa"`, yPos, letreroEmpresa, 180, false, 'center');
    yPos = drawTextAndHandlePageBreaks(doc, `Inversiones Agrícolas Expoberries S de RL de CV`, yPos, centerXempresa, 180, false, 'center');

    yPos += 10;
    yPos = drawTextAndHandlePageBreaks(doc, signatureLineAnexo, yPos, centerX - (signatureLineAnexoWidth / 5.8), 180, false, 'left');
    yPos = drawTextAndHandlePageBreaks(doc, `Departamento de Sistemas`, yPos, centerXdepTI, 180, false, 'center');

    // Finaliza el PDF agregando el pie de página a todas las hojas
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addFooter(doc, i);
    }

    doc.save(`Responsiva_${searchEmpleado}.pdf`);
};

export default generarResponsivaPDF;