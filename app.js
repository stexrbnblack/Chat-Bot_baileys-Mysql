const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MySQLAdapter = require('@bot-whatsapp/database/mysql')

require("dotenv").config()
/**
 * Declaramos las conexiones de MySQL
 */
const MYSQL_DB_HOST = process.env.MYSQL_DB_HOST
const MYSQL_DB_USER = process.env.MYSQL_DB_USER
const MYSQL_DB_PASSWORD = process.env.MYSQL_DB_PASSWORD
const MYSQL_DB_NAME = process.env.MYSQL_DB_NAME
const MYSQL_DB_PORT = process.env.MYSQL_DB_PORT

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
    // saveJpgHiCli(media, resp),               // Guarda en la DB la imagen del Historia Clínica (Clinic Histpry)) 'jpgHiCli
    null,
    null,
    // [flowExam]
)

const flowImgOrd = addKeyword('').addAnswer(['Por favor *Tomar una Foto a la Autorización* antes mencionado'],
    // saveJpgAut(media, resp),                  // Guarda en la DB la imagen de la Autorizacion (Photo Autory) 'jpgAut'    
    null,
    null,
    [flowCliHist]
)

const flowExam = addKeyword(['',' ']).addAnswer('`Sr./Sra. {name}, tenemos para ti una forma más fácil de gestionar tu solicitud, \n `' +
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
        // saveTypeExam(addKeyword, addAnswer),                 // Guarda en la DB el tipo de Examen (Exam Typr) 'typeExam' 
        null,
        null,
        [flowImgOrd]
    )

const flowCell = addKeyword([' ', ''])
    .addAnswer(
        ['Ingrese el *Numero telefonico* del Paciente.'],
        { capture: true },

        async (ctx) => {
            
            let cell = ctx.body

            console.log(`Estupendo *${namePatient}*! te dejo el resumen de tu formulario
            \n- Nombre y apellidos: *${namePatient}*
            \n- ID: *${idDoc}*
            \n- Telefono: *${cell}*
            \n- Correo: *${email}*`)
        },
        [flowExam]
    )

const flowCorreo = addKeyword([' ', ''])
    .addAnswer(
        ['Ingrese el *Correo electronico* del Paciente al cual desea resivir la validacion de la cita.'],
        { capture: true },

        async (ctx) => {

            let email = ctx.body

            console.log(`Email: *${email}*`)
        },
        [flowCell]
    )

const flowFormPatient = addKeyword([' ', ''])
    .addAnswer(
        ['Ingrese el *Nombre completo* del Paciente.'],
        { capture: true },

        (ctx) => {
            let namePatient

            namePatient = ctx.body
            console.log(`Nombre: *${namePatient}*`)
        },
        [flowCorreo]
    )

const flowFormOtro = addKeyword(['4', 'otro'])
    .addAnswer(
        ['Digite el Tipo de Documento de ciudadanía'],
        { capture: true },

        (ctx) => {

            let TypeDocument = ctx.body
            console.log('typo de doc: ', TypeDocument)
            console.log(`CC: *${TypeDocument}*`)
        }
    ).addAnswer(
        ['Digite el Documento anteriormente mencionado'],
        { capture: true },

        async (ctx) => {

            let idDoc = ctx.body
            console.log('NUMERO DE CC: ', idDoc)
            console.log(`CC: *${idDoc}*`)
        },
        [flowFormPatient]
    )

const flowFormTI = addKeyword(['3', 'ti'])
    .addAnswer(
        ['Digite su Targeta de Identidad'],
        { capture: true },

        async (ctx) => {

            let idDoc = ctx.body
            console.log('NUMERO DE TI: ', idDoc)
            console.log(`TI: *${idDoc}*`)
        },
        [flowFormPatient]
    )

const flowFormCE = addKeyword(['2', 'ce'])
    .addAnswer(
        ['Digite su Cédula de Extrangeria'],
        { capture: true },

        async (ctx) => {

            let idDoc = ctx.body
            console.log('NUMERO DE CE: ', idDoc)
            console.log(`CE: *${idDoc}*`)
        },
        [flowFormPatient]
    )

const flowFormCC = addKeyword(['1', 'cc'])
    .addAnswer(
        ['Digite su Cédula de ciudadanía'],
        { capture: true },

        async (ctx) => {
            let idDoc = ctx.body
            console.log('NUMERO DE CC: ', idDoc)
            // console.log(`CC: *${idDoc}*`)
        },
        [flowFormPatient]
    )

const flowAcep2 = addKeyword(['1', 'si', 'acepto']).addAnswer(
    [
        'Para el Agendamiento de Citas digita. ¿Cuál es el tipo de documento de identificación del usuario? \n',
        '1. CC (Cédula de ciudadanía),\n *digite 1*',
        '2. CE (Cédula de extranjería),\n *digite 2*',
        '3. TI (Tarjeta de idUserentidUserad),\n *digite 3*',
        '4. Otro, *digita 4*'
    ],
    { capture: true },

    async (ctx) => {
        let TypeDocument = ctx.body

        if (TypeDocument == '1') {
            TypeDocument = 'CC'
        } else if (TypeDocument == '2') {
            TypeDocument = 'CE'
        }
        else if (TypeDocument == '3') {
            TypeDocument = 'TI'
        }
        else if (TypeDocument == '4') { TypeDocument = 'TI' }

        // await flowDynamic(`Encantado tipo de documento *${TypeDocument}*, ctx: ${ctx.from}`)
    },
    [flowFormCC, flowFormCE, flowFormTI, flowFormOtro]
    //  saveTypeDocument(addKeyword, addAnswer)           // Guarda en la DB el tipo de documento (Document Type) 'typeDocument' : ,
)

const flowResult = addKeyword(['2', 'descargar', 'resultados']).addAnswer(
    [
        'Ingrese al siguiente link para descargar sus resultados: ' +
        '*https://rmn.actualpacs.com/patientportal/',
    ],
    null,
    null,
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
        'Elige la opción que necesitas:',

        '*1. Agendar Cita*',
        '*2. Descarga de resultados*'
    ],
    // (ctx) => {
    // console.log('addKeyword: ', addKeyword, '\n' + 'addAnswer: ', addKeyword.addAnswer)
    // console.log('ctx.body: ', ctx.body, '\n' + 'ctxbody: ', ctx)},
    null,
    null,
    [flowAddCit, flowResult]
)

// const flowPrincipal = addKeyword(['hola', 'ole', 'alo'])
//     .addAnswer('🙌 Hola bienvenido a este *Chatbot*')
//     .addAnswer(
//         [
//             'te comparto los siguientes links de interes sobre el proyecto',
//             '👉 *doc* para ver la documentación',
//             '👉 *gracias*  para ver la lista de videos',
//             '👉 *discord* unirte al discord',
//         ],
//         null,
//         null,
//         [flowDocs, flowGracias, flowTuto, flowDiscord]
//     )
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
    const adapterProvider = createProvider(BaileysProvider)
    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })
    QRPortalWeb()
}

main()
