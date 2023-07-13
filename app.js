const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MySQLAdapter = require('@bot-whatsapp/database/mysql')

const { enviarMail } = require('./sendEmail')
const { variable_step, pacientDatas, UpdateStep, cellUsedInChat, saveTypeDocument, saveIdDocument, saveName, saveEmail, saveCellPatient, saveTypeExam, saveJpgDoc, saveJpgAut, saveJpgHiCli, saveJpgExam } = require('./dataBase')
const { mediaMessageSHA256B64 } = require('@adiwajshing/baileys')


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

const flowFinalEmail = addKeyword(['']).addAnswer(['Fin'],
    { capture: true },

    async (ctx) => {

        let jpgHiCli = ctx.body
        // saveJpgHiCli(media, from),               // Guarda en la DB la imagen del Historia Clínica (Clinic Histpry)) 'jpgHiCli
        console.log(`Foto autorizacion: *${jpgHiCli}*`)
    },

    // [flowFinalEmail]
)

const flowCliHist = addKeyword(['', ' '])
    .addAnswer(
        ['Por favor *Tomar una Foto a la Historia Clínica* antes mencionado'],
        { capture: true },

        async (ctx) => {
            let jpgHiCli = ctx.body
            let from = ctx.from
            saveJpgHiCli(jpgHiCli, from),               // Guarda en la DB la imagen del Historia Clínica (Clinic Histpry)) 'jpgHiCli
                console.log(`Foto autorizacion: *${jpgHiCli}*`)

            pacientDatas(from, async function (datas) {
                console.log('[Array data-->]', datas)
                const patientData = await datas

                // Mensaje al usuario con sus datos como Nombre y Correo
                addAnswer([`Sr./Sra. *${patientData.name}*, ah creado su cita exitosamente: validaremos su infomacion y en breve se le notificara al correo asignado ${patientData.email}.`])
                addAnswer([`Validaremos su información y en 24 horas se le notificará al correo asignado`])

                // enviarMail(from)                        // Usa el numero del usuario en el chat para obtener sus datos y enviar un correo con sus datos para agendar la cita medica

                addAnswer(
                    [
                        '*Nota:* debe presentarse *30 minutos* antes de la hora de su cita para realizar el proceso de admisión. \n' +
                        'En caso de no poder cumplir, por favor cancelar la cita con un mínimo de 2 horas de anticipación a los siguientes \n' +
                        'números: 3176398945 – 3013712503. Comprenderá que ese espacio es vital para mí, porque puedo ayudar a otro usuario que lo necesite.'
                    ]
                )
            })
        },

        // [flowFinalEmail]
    )
    .addAnswer(
        [`Probando el consecutivo de los datos ${pacientDatas.name}`]
    )

const flowImgAut = addKeyword(['']).addAnswer(['Por favor *Tomar una Foto a la Autorización* antes mencionado'],
    { capture: true },

    async (ctx) => {

        let jpgAut = ctx.body
        let from = ctx.from
        saveJpgAut(jpgAut, from)                  // Guarda en la DB la imagen de la Autorizacion (Photo Autory) 'jpgAut'    
        console.log(`Foto autorizacion: *${jpgAut}*`)
    },

    [flowCliHist]
)

const flowImgOrd = addKeyword(['']).addAnswer(['Por favor *Tomar una Foto a la Orden medica* antes mencionado'],
    { capture: true },

    async (ctx) => {

        let jpgExam = ctx.body
        let from = ctx.from
        saveJpgExam(jpgExam, from)                 // Guarda en la DB la imagen del tipo de Examen (Photo Exam Typr) 'jpgExam' 
        console.log(`Foto autorizacion: *${jpgExam}*`)
    },

    [flowImgAut]
)

const flowExam = addKeyword(['', ' ']).addAnswer('Tenemos para ti una forma más fácil de gestionar tu solicitud, \n' +
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
        { capture: true },

        async (ctx) => {
            let msg = ctx.body
            examValoracion(msg)                     // varia ble que toma el nombre del tipo de examen con el switch

            function examValoracion() {
                switch (msg) {
                    case '1': return msg = 'Radiología simple'
                    case '2': return msg = 'Ecografías'
                    case '3': return msg = 'Densitometrías'
                    case '4': return msg = 'Tomografías'
                    case '5': return msg = 'Resonancias'
                    case '6': return msg = 'Mamografías'
                    case '7': return msg = 'Electrocardiogramas'
                    case '8': return msg = 'Monitoreo ambulatorio de presión arterial'
                    case '9': return msg = 'Holter dinámico en 24 horas'
                    case '10': return msg = 'Estudios bajo sedación'
                    case '11': return msg = 'Biopsias'
                    case '12': return msg = 'Pruebas de esfuerzos'
                    case '13': return msg = 'Ecocardiogramas'
                    case '14': return msg = 'Consulta por Cardiología'
                    default: break
                }
            }

            saveTypeExam(msg, cxt.from),                 // Guarda en la DB el tipo de Examen (Exam Typr) 'typeExam'
                console.log(`Estupendo *${msg}*! te dejo el resumen de tu formulario`)
        },
        [flowImgOrd]
    )

const flowCell = addKeyword([' ', ''])
    .addAnswer(
        ['Ingrese el *Numero telefonico* del Paciente.'],
        { capture: true },

        async (ctx) => {

            let cell = ctx.body
            console.log(`Telefono: *${cell}*`)
            saveCellPatient(cell, ctx.from)               // Guarda en la DB el Numero del cell del usuario (CellPatient) 'cellPatient' 

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
            saveEmail(email, ctx.from)                   // Guarda en la DB el correo (email) 'email' 

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
            saveName(namePatient, ctx.from)                    // Guarda en la DB el nombre typing por el usuario (name) 'name'

        },
        [flowCorreo]
    )

const flowImgOtro = addKeyword(['', ' ']).addAnswer(
    ['Por favor *Tomar una Foto al Documento de Identidad* antes mencionado'],
    { capture: true },

    async (ctx) => {

        let JpgDoc = ctx.body
        console.log('Img otro: ', JpgDoc)
        console.log(`otor: *${JpgDoc}*`)
        saveJpgDoc(JpgDoc, ctx.from)                  // Gaurda en la DB la img o foto tomada del (Doc Id) 'JpgDoc'

    },
    [flowFormPatient]
)

const flowIdOtro = addKeyword(['', ' ']).addAnswer(
    ['Digite el Documento anteriormente mencionado'],
    { capture: true },

    async (ctx) => {

        let idDoc = ctx.body
        console.log('NUMERO DE OTRO: ', idDoc)
        console.log(`numero otro: *${idDoc}*`)
        saveIdDocument(idDoc, ctx.from)              // Guarda en la DB el Numero del ID (Number Id) 'IdDocument' 

    },
    [flowImgOtro]
)

const flowFormOtro = addKeyword(['4', 'otro'])
    .addAnswer(
        ['Expesifique tipo de documento a ingresar'],
        { capture: true },

        (ctx) => {

            let TypeDocument = ctx.body
            console.log('typo de doc: ', TypeDocument)
            console.log(`otro: *${TypeDocument}*`)
            saveTypeDocument(TypeDocument, ctx.from)           // Guarda en la DB el tipo de documento (Document Type) 'typeDocument' : ,
        },
        [flowIdOtro]
    )

const flowImgTI = addKeyword(['', ' '])
    .addAnswer(
        ['Por favor *Tomar una Foto al Documento de Identidad* antes mencionado'],
        { capture: true },

        async (ctx) => {
            let JpgDoc = ctx.body
            console.log('img CC: ', JpgDoc)
            // console.log(`CC: *${idDoc}*`)
            saveJpgDoc(JpgDoc, ctx.from)                  // Gaurda en la DB la img o foto tomada del (Doc Id) 'JpgDoc'

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
            saveIdDocument(idDoc, ctx.from)              // Guarda en la DB el Numero del ID (Number Id) 'IdDocument' 

        },
        [flowImgTI]
    )

const flowImgCE = addKeyword(['', ' '])
    .addAnswer(
        ['Por favor *Tomar una Foto al Documento de Identidad* antes mencionado'],
        { capture: true },

        async (ctx) => {
            let JpgDoc = ctx.body
            console.log('img CE: ', JpgDoc)
            // console.log(`CC: *${idDoc}*`)
            saveJpgDoc(JpgDoc, ctx.from)                  // Gaurda en la DB la img o foto tomada del (Doc Id) 'JpgDoc'

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
            saveIdDocument(idDoc, ctx.from)              // Guarda en la DB el Numero del ID (Number Id) 'IdDocument' 

        },
        [flowImgCE]
    )

const flowImgCC = addKeyword(['', ' '])
    .addAnswer(
        ['Por favor *Tomar una Foto al Documento de Identidad* antes mencionado'],
        { capture: true },

        async (ctx) => {
            let JpgDoc = ctx.body
            console.log('img CC: ', JpgDoc, ctx.refSerialize)
            saveJpgDoc(ctx.refSerialize, ctx.from)                  // Gaurda en la DB la img o foto tomada del (Doc Id) 'JpgDoc'
            // console.log(`CC: *${idDoc}*`)
        },
        [flowFormPatient]
    )

const flowFormCC = addKeyword(['1', 'cc'])
    .addAnswer(
        ['Digite su Cédula de ciudadanía'],
        { capture: true },

        async (ctx) => {
            let idDoc = ctx.body
            console.log('NUMERO DE CC: ', idDoc, )
            await saveIdDocument(idDoc, ctx.from)              // Guarda en la DB el Numero del ID (Number Id) 'IdDocument' 

            // console.log(`CC: *${idDoc}*`)
        },
        [flowImgCC]
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
            TypeDocument = 'CC', console.log('NUMERO DE CC: ', TypeDocument)
        } else if (TypeDocument == '2') {
            TypeDocument = 'CE', console.log('NUMERO DE CC: ', TypeDocument)
        } else if (TypeDocument == '3') {
            TypeDocument = 'TI', console.log('NUMERO DE CC: ', TypeDocument)
        } else if (TypeDocument == '4') { TypeDocument = 'Otro', console.log('NUMERO DE CC: ', TypeDocument) }

        await saveTypeDocument(TypeDocument, ctx.from)           // Guarda en la DB el tipo de documento (Document Type) 'typeDocument' : ,

        // await flowDynamic(`Encantado tipo de documento *${TypeDocument}*, ctx: ${ctx.from}`)
    },
    [flowFormCC, flowFormCE, flowFormTI, flowFormOtro]
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
    { capture: true },

    async (ctx) => {
        console.log('cell-->: ', ctx.from)

        await cellUsedInChat(ctx.from)                        // Guarda en la BD el numero que es usado para contactar el chatBot.
    },
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
    { capture: true },

    async (ctx) => {
        console.log('cell-->: ', ctx.from)
        console.log('ctx-->: ', ctx)    
        console.log(' ')  
        console.log('ctx-->: ', ctx.message.messageContextInfo.deviceListMetadata) 
        console.log(' ')  
        console.log('ctx.message.imageMessage.fileSha256-->: ', ctx.message.imageMessage.fileSha256)
        console.log(' ')
        console.log('ctx.message.imageMessage.fileSha256-->: ', ctx.message.imageMessage.fileEncSha256)
        console.log(' ')
        console.log('ctx.message.imageMessage.fileSha256-->: ', ctx.message.imageMessage.jpegThumbnail)
        await cellUsedInChat(ctx.from)                        // Guarda en la BD el numero que es usado para contactar el chatBot.
    },
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
        { capture: true },

        async (ctx) => {
            console.log('cell-->: ', ctx.from)

            console.log('ctx-->: ', ctx)    
            console.log(' ')  
            console.log('message.imageMessage.scanLengths-->: ', ctx.message.imageMessage.scanLengths)
            console.log(' ') 
            console.log('message.imageMessage.fileSha256-->: ', ctx.message.imageMessage.fileSha256)
            console.log(' ')  
            console.log('message.imageMessage.fileLength-->: ', ctx.message.imageMessage.fileLength.low)
            console.log(' ')  
            console.log('message.imageMessage.mediaKey-->: ', ctx.message.imageMessage.mediaKey)
            console.log(' ')  
            console.log('message.imageMessage.fileEncSha256-->: ', ctx.message.imageMessage.fileEncSha256)
            console.log(' ')  
            console.log('message.imageMessage.mediaKeyTimestamp-->: ', ctx.message.imageMessage.mediaKeyTimestamp.low)
            console.log(' ') 
            console.log('message.imageMessage.scansSidecar-->: ', ctx.message.imageMessage.scansSidecar)
            console.log(' ')  
            console.log('message.imageMessage.midQualityFileSha256-->: ', ctx.message.imageMessage.midQualityFileSha256)
            console.log(' ')  
            console.log('messageContextInfo.MessageContextInfo.deviceListMetadata-->: ', ctx.message.messageContextInfo.deviceListMetadata) 
            console.log(' ')  
            console.log('ctx.mediaMessageSHA256B64-->: ', ctx.mediaMessageSHA256B64) 
            console.log(' ')
            // console.log('media-->: ', MediaElementAudioSourceNode) 
            console.log(' ')
            // console.log('media-->: ', media) 
            console.log(' ')
            console.log('MediaMetadata-->: ', ctx.data) 
            console.log('mediaMessageSHA256B64-->: ', ctx.mediaMessageSHA256B64)
            await cellUsedInChat(ctx.from)                        // Guarda en la BD el numero que es usado para contactar el chatBot.

            await saveJpgExam(ctx.body, ctx.from)


        },
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
