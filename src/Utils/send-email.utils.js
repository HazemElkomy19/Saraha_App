
import nodemailer from 'nodemailer'
import { EventEmitter } from 'node:events';
export const sendEmail = async (
  {
    to,
    cc='mtybjrgiaxayxxwygz@nespj.com',
    subject,
    content
  }
)=>{
    const transporter= nodemailer.createTransport({
      host:'smtp.gmail.com',
      port:465,
      secure:true,
      auth:{
        user:process.env.USER_EMAIL,
        pass:process.env.USER_PASSWORD
      }
      // tls:{
      //   rejectUnauthorized:false
      // }
    })

    const info = await transporter.sendMail({
      from: "elkomyhazem967@gmail.com",
      to,
      cc,
      subject,
      html:content,
      attachments:[
        {
          filename:"image.png",
          path:"image.png"
        }
      ]
    })
    console.log("info"," ",info);
    
    return info
} 

export const emitter = new EventEmitter ();

emitter.on('sendEmail', (args)=>{
  console.log("The sending email event is starting");
  
  sendEmail(args)
  
})