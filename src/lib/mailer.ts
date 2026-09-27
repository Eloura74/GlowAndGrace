export async function sendPasswordResetEmail(email: string, resetLink: string) {
  // TODO: Implémenter le véritable envoi d'email via un service externe (Resend, Nodemailer, etc.)
  console.log("=========================================");
  console.log(`[MAILER MOCK] Email de réinitialisation envoyé à : ${email}`);
  console.log(`[MAILER MOCK] Lien de réinitialisation : ${resetLink}`);
  console.log("=========================================");
}
