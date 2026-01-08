import jsPDF from "jspdf";
import logoag from '../../../assets/logoag.png';

const generarCartaBienvenidaPDF = (formData, searchEmpleado) => {
    const doc = new jsPDF();
    const PAGE_HEIGHT_LIMIT = 275;
    const FOOTER_Y_POS = 285;
    const MARGIN_X = 20;
    const MAX_WIDTH = 170;

    const {
        vEmailAti,
        vPwdemailAti,
        vUsreclipseAti,
        vPwdeclipseAti,
        vUsrrdAti,
        vPwdremotoAti
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

    // Función para el Encabezado
    const addHeader = (doc) => {
        const imgWidth = 60; // Más pequeño para carta
        const imgHeight = 12;
        const pageWidth = doc.internal.pageSize.getWidth();
        const xPos = (pageWidth / 2) - (imgWidth / 2);
        doc.addImage(logoag, 'PNG', xPos, 10, imgWidth, imgHeight);
        return 30;
    };

    // Función para el Pie de página
    const addFooter = (doc, currentPage) => {
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text("AGROBERRIES MÉXICO - Departamento de T.I.", MARGIN_X, FOOTER_Y_POS);
        doc.text(`Página ${currentPage}`, doc.internal.pageSize.getWidth() - 30, FOOTER_Y_POS);
    };

    // Manejador de texto con saltos de página
    const writeText = (text, y, fontSize = 9, isBold = false, align = 'left') => {
        doc.setFontSize(fontSize);
        doc.setFont(undefined, isBold ? 'bold' : 'normal');

        // 👇 AGREGA ESTA LÍNEA AQUÍ PARA FORZAR EL NEGRO
        doc.setTextColor(0);

        const lines = doc.splitTextToSize(text, MAX_WIDTH);
        lines.forEach(line => {
            if (y > PAGE_HEIGHT_LIMIT) {
                const currentPage = doc.internal.getNumberOfPages();
                addFooter(doc, currentPage);
                doc.addPage();
                y = addHeader(doc);

                // 👇 TAMBIÉN AQUÍ: Después de agregar una página, 
                // jsPDF puede resetear estilos, aseguremos el negro otra vez.
                doc.setTextColor(0);
                doc.setFontSize(fontSize);
                doc.setFont(undefined, isBold ? 'bold' : 'normal');
            }
            doc.text(line, align === 'center' ? doc.internal.pageSize.getWidth() / 2 : MARGIN_X, y, { align });
            y += 5;
        });
        return y + 2;
    };

    let yPos = addHeader(doc);

    // --- CONTENIDO DE LA CARTA ---
    // --- TEXTO LITERAL ---
    yPos = writeText(`Estimad@ ${searchEmpleado}:`, yPos, 10, true);

    yPos = writeText("El departamento de Tecnologías de la Información de Agroberries México, te da la más cordial bienvenida a la empresa y aprovechamos este espacio para informarte los servicios que nuestro departamento te puede ofrecer como usuari@ de los sistemas informáticos de la empresa.", yPos);

    yPos = writeText("Servicios del área de Infraestructura y soporte técnico", yPos, 9, true);
    yPos = writeText("Soporte técnico en sitio y de manera remota (vía ANYDESK/Teamviewer) a tu equipo de cómputo, teléfono celular, impresora o cualquier otro dispositivo electrónico asignado por nuestro departamento.", yPos);
    yPos = writeText("Soporte técnico en el uso de los programas informáticos utilizados en la empresa y que se encuentran previamente instalados en tu(s) dispositivo(s).", yPos);
    yPos = writeText("Mantenimiento preventivo y correctivo a los dispositivos electrónicos asignados por el departamento. Nota: La limpieza y conservación de los dispositivos en buen estado es responsabilidad de cada usuario.", yPos);
    yPos = writeText("Asignación y configuración de correo electrónico con firma electrónica.", yPos);
    yPos = writeText("Asignación y desbloqueo de contraseñas para los sistemas informáticos de la empresa.", yPos);
    yPos = writeText("Configuración de sistemas de seguridad (antivirus, vpn, entre otros) en el equipo de cómputo asignado.", yPos);

    yPos = writeText("Servicios del área funcional y programación", yPos, 9, true);
    yPos = writeText("Soporte técnico con los sistemas administrativos de la empresa como son Eclipse y el sistema de inteligencia de negocios.", yPos);

    yPos = writeText("Red Inalámbrica", yPos, 9, true);
    yPos = writeText("Por lo regular, la empresa cuenta con 1 red inalámbrica llamada Agroberries México para tu uso interno en laptops de la empresa, para los celulares la red de conexión es la red de invitados. La contraseña de las redes te la proporcionará el administrador de T.I. del área y/o la generalista de recursos humanos de la ubicación donde te encuentres.", yPos);

    yPos = writeText("Internet", yPos, 9, true);
    yPos = writeText("Para tu conocimiento, se tienen algunas restricciones de uso de Internet por seguridad de la información y por el tipo de internet que se tiene en algunas ubicaciones, por lo que en dado caso de que alguna página o información que desees consultar a través de este medio se encuentre bloqueada, te pedimos que nos lo hagas saber para determinar la causa. Además, te pedimos que no hagas mal uso del servicio tratando de descargar software, música o videos ya que afectas el desempeño de otros usuarios y pones en riesgo la seguridad de la información de la empresa.", yPos);

    yPos = writeText("Correo Electrónico, chat empresarial y almacenamiento en nube con OneDrive", yPos, 9, true);
    yPos = writeText("Tu cuenta de correo electrónico empresarial tiene asignada una capacidad de almacenamiento en la nube de 100 Gb, la cuota máxima para el envío de archivos adjuntos es de no más de 30 Mb. Así mismo te solicitamos que tengas precaución al revisar correos electrónicos que NO solicitaste o que para ti parecen sospechosos ya que pueden ser VIRUS y al abrirlos pones en riesgo tu información y la de toda la empresa. Ante cualquier duda favor de preguntar al departamento de T.I.", yPos);
    yPos = writeText("Es obligatorio utilizar el sistema OneDrive para guardar y organizar tus archivos de manera local tal y como lo haces con la carpeta de mis documentos o mis imágenes, la ventaja que tenemos con este sistema es que de manera automática la información que deposites en el será enviada a la nube respaldándose para el caso de alguna contingencia con tu equipo de cómputo. Para más información envíanos un correo para explicarte más a fondo.", yPos);

    yPos = writeText("Solicitud de soporte", yPos, 9, true);
    yPos = writeText("Toda solicitud de apoyo o soporte técnico que requieras del departamento de T.I., deberá ser canalizada a través de un correo electrónico a la cuenta soporteagroberries@agroberries.mx y/o vía telefónica a Ing. De Soporte 331.408.3699 (asistencia técnica), Ricardo Domínguez 331.84.50.274 (programación / asistencia técnica) o Armando Orozco 341.11.97.130 (asistencia técnica).", yPos);
    yPos = writeText("A continuación, te presento al equipo de Tecnologías de la Información que estará a tu disposición para atender tus solicitudes de servicio:", yPos);
    yPos = writeText("Vacante – Soporte técnico.", yPos);
    yPos = writeText("Ricardo Domínguez Dimas – Desarrollador T.I. / Soporte técnico", yPos);
    yPos = writeText("Armando Israel Orozco Camarillo – Gerente del departamento de Tecnologías de la Información.", yPos);
    yPos = writeText("Para cualquier queja sobre el desempeño de los integrantes del departamento o de los servicios en general puedes hacerlo vía correo electrónico a aorozco@agroberries.mx o eduran@agroberries.mx con gusto estaremos atentos a darle una solución a la brevedad.", yPos);

    yPos = writeText("Política de uso de equipos de cómputo.", yPos, 9, true);
    yPos = writeText("Se cuenta con una política corporativa para el buen uso de equipos de cómputo la cual, está disponible a través de un archivo adjunto a este correo o de los canales oficiales de la empresa. En caso de no contar con ella, la puedes solicitar directamente con el departamento de T.I. para que tengas conocimiento de ella y evites caer en un cobro por mal uso de los equipos de cómputo de la empresa.", yPos);

    yPos = writeText("Nota: Para evitar daños en las bisagras de los equipos laptop, es recomendable que la pantalla se abra por la PARTE CENTRAL ya que el tratar de abrirla por los costados o las esquinas, puede provocar daños que causarán un costo para el usuario dependiendo la gravedad del desperfecto.", yPos, 9, true);

    yPos = writeText("Credenciales de acceso", yPos, 10, true);
    yPos = writeText("A continuación, se muestran las credenciales de acceso para los sistemas que se tienen en la empresa para tu conocimiento. Estas, no deberán de ser compartidas en ninguna circunstancia con ningún otro usuario o compañero, a menos que sea personal del departamento de T.I.", yPos);

    // --- BLOQUES DE CREDENCIALES ---

    // Nueva página para Credenciales si queda poco espacio
    if (yPos > 200) {
        addFooter(doc, doc.internal.getNumberOfPages());
        doc.addPage();
        yPos = addHeader(doc);
    }

    yPos = writeText("CREDENCIALES DE ACCESO", yPos, 11, true, 'center');
    yPos += 5;

    // Función para dibujar bloques de credenciales
    const drawCreds = (titulo, user, pass, extra = "") => {
        doc.setDrawColor(200);
        doc.rect(MARGIN_X - 2, yPos - 4, MAX_WIDTH + 4, 20); // Recuadro
        yPos = writeText(titulo, yPos, 9, true);
        yPos = writeText(`Usuario: ${user}   |   Contraseña: ${pass}`, yPos);
        if (extra) yPos = writeText(extra, yPos, 8);
        yPos += 5;
    };

    // Función para dibujar dos accesos en un solo recuadro
    const drawDoubleCreds = (titulo, item1, item2) => {
        doc.setDrawColor(200);
        doc.setLineWidth(0.1);
        doc.rect(MARGIN_X - 2, yPos - 4, MAX_WIDTH + 4, 25); // Recuadro un poco más alto (25)

        yPos = writeText(titulo, yPos, 9, true); // Título del recuadro

        // Línea 1 (Escritorio Remoto)
        doc.setFont(undefined, 'bold');
        doc.text(item1.label, MARGIN_X, yPos);
        doc.setFont(undefined, 'normal');
        doc.text(`Usuario: ${item1.user}  |  Contraseña: ${item1.pass}`, MARGIN_X + 25, yPos);

        yPos += 6; // Espacio entre items

        // Línea 2 (Eclipse)
        doc.setFont(undefined, 'bold');
        doc.text(item2.label, MARGIN_X, yPos);
        doc.setFont(undefined, 'normal');
        doc.text(`Usuario: ${item2.user}  |  Contraseña: ${item2.pass}`, MARGIN_X + 25, yPos);

        yPos += 10; // Espacio para el siguiente bloque
    };

    drawCreds("Outlook / Office 365 / OneDrive", vEmailAti, vPwdemailAti, "Acceso: https://www.office.com");
    drawDoubleCreds(
        "Accesos a Sistemas (Escritorio Remoto / Eclipse)",
        { label: "Eclipse:", user: vUsreclipseAti, pass: vPwdeclipseAti },
        { label: "Escritorio:", user: vUsrrdAti, pass: vPwdremotoAti }
    );

    yPos += 10;
    yPos = writeText("Nuevamente te damos la más cordial bienvenida. Esperamos exceder tus expectativas.", yPos, 10, false, 'center');
    yPos = writeText("Atentamente: Departamento de T.I.", yPos + 5, 10, true, 'center');

    addFooter(doc, doc.internal.getNumberOfPages());
    doc.save(`Bienvenida_${searchEmpleado}.pdf`);
};

export default generarCartaBienvenidaPDF;