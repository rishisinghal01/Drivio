import nodemailer from "nodemailer"
const transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:process.env.Email,
        pass:process.env.Pass
    }
})

export const sendMail = async (to: string, subject: string, html: string) => {
  try {
    const info = await transporter.sendMail({
      from: `DRIVIO <${process.env.Email}>`,
      to,
      subject,
      html,
    });

    console.log("Mail sent:", info.response);
  } catch (error) {
    console.error("Mail Error:", error);
    throw error;
  }
};