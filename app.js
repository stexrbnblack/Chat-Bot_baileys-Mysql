const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const WebWhatsappProvider = require('@bot-whatsapp/provider/web-whatsapp')
const MySQLAdapter = require('@bot-whatsapp/database/mysql')

/**
 * Aqui declaramos los flujos hijos, los flujos se declaran de atras para adelante, es decir que si tienes un flujo de este tipo:
 *
 *          Menu Principal
 *           - SubMenu 1
 *             - Submenu 1.1
 *           - Submenu 2
 *             - Submenu 2.1
 *
 * Primero declaras los submenus 1.1 y 2.1, luego el 1 y 2 y al final el principal.
 */

const flowCliHist = addKeyword('').addAnswer(['Por favor *Tomar una Foto a la Historia Clínica* antes mencionado'],
   // saveJpgHiCli(media, resp)               // Guarda en la DB la imagen del Historia Clínica (Clinic Histpry)) 'jpgHiCli'
    // [flowExam]
)

const flowImgOrd = addKeyword('').addAnswer(['Por favor *Tomar una Foto a la Autorización* antes mencionado'],
   // saveJpgAut(media, resp)                  // Guarda en la DB la imagen de la Autorizacion (Photo Autory) 'jpgAut'     
    [flowCliHist]
)

const flowExam = addKeyword([ '2', 'addKeyword.length > 6']).addAnswer('`Sr./Sra. {name}, tenemos para ti una forma más fácil de gestionar tu solicitud, \n `' +
    'en el siguiente link: https://rmn.com.co/agendamiento/')
    .addAnswer('De lo contrario selecciona la opción que deseas realizar ver opciones: ')
    .addAnswer([
        '*1. Radiología simple*',
        '*2. Ecografías*',
        '*3. Densitometrías*',
        '*4. Tomografías*',
        '*5. Resonancias*',
        '*6. Mamografías*',
        '*7. Electrocardiogramas*',
        '*8. Monitoreo ambulatorio de presión arterial*',
        '*9. Holter dinámico en 24 horas*',
        '*10. Estudios bajo sedación*',
        '*11. Biopsias*',
        '*12. Pruebas de esfuerzos*',
        '*13. Ecocardiogramas*',
        '*14. Consulta por Cardiología*'
    ],
       // saveTypeExam(addKeyword, addAnswer)                 // Guarda en la DB el tipo de Examen (Exam Typr) 'typeExam' 
        [flowImgOrd]
    )

const flowCell = addKeyword([ '2', 'addKeyword.length > 6']).addAnswer(['Ingrese el *Numero telefonico* del Paciente.'],
    //saveCellPatient(addKeyword, addAnswer)               // Guarda en la DB el Numero del cell del usuario (CellPatient) 'cellPatient' 
    [flowExam]
)

const flowEmail = addKeyword([ '2', 'addKeyword.length > 6']).addAnswer(['Ingrese el *Correo electronico* del Paciente al cual desea resivir la validacion de la cita.'],
    //saveEmail(addKeyword, addAnswer)                   // Guarda en la DB el correo (email) 'email' 
    [flowCell]
)

const flowName = addKeyword([ '2', 'addKeyword.length > 6']).addAnswer(['Ingrese el *Nombre completo* del Paciente.'],
    //saveName(addKeyword, addAnswer)                    // Guarda en la DB el nombre typing por el usuario (name) 'name'
    [flowEmail]
)

const flowImgDoc = addKeyword([ '2', 'addKeyword.length > 6']).addAnswer(['Por favor *Tomar una Foto al Documento de Identidad* antes mencionado'],
    // media = addKeyword.downloadMedia(),
  //  saveJpgDoc(media, addAnswer)                  // Gaurda en la DB la img o foto tomada del (Doc Id) 'JpgDoc'
    [flowName]
)

const flowExp = addKeyword(['1', ('addKeyword.length > 6')]).addAnswer(['Digite su documento'],
  //  saveIdDocument(addKeyword, addAnswer)            // Guarda en la DB el Numero del ID (Number Id) 'IdDocument'
    [flowImgDoc]
)

const flowOtro = addKeyword(['4', 'otro']).addAnswer(['Expesifique tipo de documento a ingresar'],
  //  saveTypeDocument(addKeyword, addAnswer)           // Guarda en la DB el tipo de documento (Document Type) 'typeDocument' : ,
    [flowExp]
)

const flowTI = addKeyword(['3', 'ti']).addAnswer(['Digite su Tarjeta de Identidad'],
   // saveIdDocument(addKeyword, addAnswer)            // Guarda en la DB el Numero del ID (Number Id) 'IdDocument'
    [flowImgDoc]
)

const flowCE = addKeyword(['2', 'ce']).addAnswer(['Digite su Cédula de extranjería'],
   // saveIdDocument(addKeyword, addAnswer)            // Guarda en la DB el Numero del ID (Number Id) 'IdDocument'
    [flowImgDoc]
)

const flowCC = addKeyword(['1', 'cc']).addAnswer(['Digite su Cédula de ciudadanía'],
  //  saveIdDocument(addKeyword, addAnswer)            // Guarda en la DB el Numero del ID (Number Id) 'IdDocument'
    [flowImgDoc]
)

const flowAcep2 = addKeyword(['1', 'si', 'acepto']).addAnswer(
    [
        'Para el Agendamiento de Citas digita. ¿Cuál es el tipo de documento de identificación del usuario? \n',
        '1. CC (Cédula de ciudadanía),\n *digite 1*',
        '2. CE (Cédula de extranjería),\n *digite 2*',
        '3. TI (Tarjeta de idUserentidUserad),\n *digite 3*',
        '4. Otro, *digita 4*'
    ],
  //  saveTypeDocument(addKeyword, addAnswer)           // Guarda en la DB el tipo de documento (Document Type) 'typeDocument' : ,
    [flowCC, flowCE, flowTI, flowOtro]
)

const flowResult = addKeyword(['2', 'descargar', 'resultados']).addAnswer(
    [
        'Ingrese al siguiente link para descargar sus resultados: ' +
        '*https://rmn.actualpacs.com/patientportal/',
    ],
)

const flowAddCit = addKeyword(['1', 'si', 'cita']).addAnswer(
    [
        'Para continuar con nuestra solicitud debes aceptar la política de administración de datos personales del ' +
        '*CENTRO DE RESONANCIA MAGNETICA DEL NORTE*. Que puede ser consultada en el siguiente link: https://rmn.com.co/politica-habeas-data/',

        '*1. Si Acepto*',
        '*2. No Acepto*'
    ],
    null,
    null,
    [flowAcep2]
)

const flowAcep = addKeyword(['1', 'si', 'acepto']).addAnswer(
    [
    'Gracias por aceptar esta comunicación.',
    'Para avanzar en este chat solo debes digitar el *número* de la opción que necesitas ' +
    ' \nElige la opción que necesitas:',

    '*1. Agendar Cita*',
    '*2. Descarga de resultados*'
    ],
    null,
    null,
    [flowAddCit, flowResult]
)

const flowPrincipal = addKeyword(['hola', 'buenas', 'noche', 'dias', 'informacion'])
    .addAnswer('🙌 ¡Hola! Te damos la bienvenida al *Centro de Resonancia Magnética del Norte.* Para avanzar ' +
        'en este chat solo debes digitar el *número* de la opción que necesitas.')
    .addAnswer(
        [
            'Al utilizar este medio, aceptas los términos y condiciones de WhatsApp. Si quieres ' +
            'ampliar la información, ingresa aquí: https://www.whatsapp.com/legal',
            '👉 *1. Si Acepto*',
            '👉 *2. No Acepto*'
        ],
        null,
        null,
        [flowAcep]
    )

const main = async () => {
    const adapterDB = new MySQLAdapter({
        host: MYSQL_DB_HOST,
        user: MYSQL_DB_USER,
        database: MYSQL_DB_NAME,
        password: MYSQL_DB_PASSWORD,
        port: MYSQL_DB_PORT,
    })
    const adapterFlow = createFlow([flowPrincipal])
    const adapterProvider = createProvider(WebWhatsappProvider)
    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })
    QRPortalWeb()
}

main()
