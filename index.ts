import Server from './class/server'
import userRouter from './routes/usuario'
import mysql from 'mysql'
import bodyparser from 'body-parser'
import config from './configdatebase'
import VehiculosRouter from './routes/vehiculos'
import indexRouter from './routes/indexrouter'
const server = new Server()


// bODY PARSER
server.app.use(bodyparser.urlencoded({extended:true}))
server.app.use(bodyparser.json())
//levantar express

server.start((req:any,res:any)=>{
    console.log("servidor corriendo el puerto "+server.port)
})


//conectar mysql
const con = mysql.createConnection(config);

  con.connect(function(err:any) {
    if(err){
        console.log('Error connecting to Db');
        return;
      }
      console.log("Connected! con mysql :v");
  });

server.app.use('/',indexRouter)
server.app.use('/user', userRouter)
server.app.use('/vehiculos', VehiculosRouter)