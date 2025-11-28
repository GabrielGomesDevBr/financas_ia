import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'Assistente Financeiro <onboarding@resend.dev>'; // Use default Resend domain for testing

interface EmailResult {
  success: boolean;
  error?: any;
}

export async function sendEmail(to: string, subject: string, html: string): Promise<EmailResult> {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Exception sending email:', error);
    return { success: false, error };
  }
}

export async function sendInviteEmail(email: string, inviteLink: string, inviterName: string) {
  const subject = `${inviterName} convidou você para a família no Assistente Financeiro`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Convite para Família</h2>
      <p>Olá!</p>
      <p><strong>${inviterName}</strong> convidou você para participar da família no Assistente Financeiro.</p>
      <p>Juntos vocês poderão organizar as finanças, criar orçamentos e alcançar metas.</p>
      <br/>
      <a href="${inviteLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Aceitar Convite</a>
      <br/><br/>
      <p style="color: #666; font-size: 14px;">Se o botão não funcionar, copie e cole este link no seu navegador:</p>
      <p style="color: #666; font-size: 14px;">${inviteLink}</p>
    </div>
  `;
  return sendEmail(email, subject, html);
}

export async function sendPasswordChangeEmail(email: string, name: string) {
  const subject = 'Sua senha foi alterada - Assistente Financeiro';
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Senha Alterada</h2>
      <p>Olá, ${name}.</p>
      <p>A senha da sua conta no Assistente Financeiro foi alterada recentemente.</p>
      <p>Se foi você quem fez essa alteração, pode ignorar este e-mail.</p>
      <p style="color: #dc2626;"><strong>Se NÃO foi você, entre em contato conosco imediatamente ou recupere sua senha.</strong></p>
    </div>
  `;
  return sendEmail(email, subject, html);
}

export async function sendBudgetAlertEmail(email: string, name: string, category: string, amount: number, limit: number) {
  const subject = `⚠️ Alerta de Orçamento: ${category}`;
  const percentage = Math.round((amount / limit) * 100);
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Limite de Orçamento Excedido</h2>
      <p>Olá, ${name}.</p>
      <p>Você ultrapassou o limite do orçamento para a categoria <strong>${category}</strong>.</p>
      <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 4px 0;">Gasto Atual: <strong>R$ ${amount.toFixed(2)}</strong></p>
        <p style="margin: 4px 0;">Limite: <strong>R$ ${limit.toFixed(2)}</strong></p>
        <p style="margin: 4px 0;">Uso: <strong style="color: #dc2626;">${percentage}%</strong></p>
      </div>
      <p>Recomendamos revisar seus gastos nesta categoria.</p>
    </div>
  `;
  return sendEmail(email, subject, html);
}

export async function sendGoalAlertEmail(email: string, name: string, goalName: string, currentAmount: number, targetAmount: number) {
  const subject = `🎯 Atualização de Meta: ${goalName}`;
  const percentage = Math.round((currentAmount / targetAmount) * 100);
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #16a34a;">Progresso na Meta!</h2>
      <p>Olá, ${name}.</p>
      <p>Você fez um progresso importante na meta <strong>${goalName}</strong>.</p>
      <div style="background-color: #f0fdf4; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 4px 0;">Acumulado: <strong>R$ ${currentAmount.toFixed(2)}</strong></p>
        <p style="margin: 4px 0;">Alvo: <strong>R$ ${targetAmount.toFixed(2)}</strong></p>
        <p style="margin: 4px 0;">Concluído: <strong style="color: #16a34a;">${percentage}%</strong></p>
      </div>
      <p>Continue assim!</p>
    </div>
  `;
  return sendEmail(email, subject, html);
}

export async function sendTransactionAlertEmail(email: string, name: string, transaction: any) {
  const isExpense = transaction.type === 'expense';
  const color = isExpense ? '#dc2626' : '#16a34a';
  const typeLabel = isExpense ? 'Nova Despesa' : 'Nova Receita';
  const subject = `${isExpense ? '💸' : '💰'} ${typeLabel}: ${transaction.description}`;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>${typeLabel} Registrada</h2>
      <p>Olá, ${name}.</p>
      <p>Uma nova transação foi registrada na sua conta:</p>
      <div style="border-left: 4px solid ${color}; padding-left: 16px; margin: 16px 0;">
        <p style="font-size: 18px; font-weight: bold; margin: 4px 0;">${transaction.description}</p>
        <p style="font-size: 24px; color: ${color}; margin: 8px 0;">R$ ${Number(transaction.amount).toFixed(2)}</p>
        <p style="color: #666; margin: 4px 0;">${new Date(transaction.date).toLocaleDateString('pt-BR')}</p>
      </div>
    </div>
  `;
  return sendEmail(email, subject, html);
}

export async function sendFamilyAlertEmail(email: string, name: string, message: string) {
  const subject = '👥 Atualização da Família';
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Atividade na Família</h2>
      <p>Olá, ${name}.</p>
      <p>${message}</p>
    </div>
  `;
  return sendEmail(email, subject, html);
}

export async function sendWaitlistNotificationEmail(userEmail: string, userName: string) {
  const subject = 'Você está na lista de espera - Assistente Financeiro'
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Bem-vindo à Lista de Espera! ⏳</h2>
      <p>Olá${userName ? `, ${userName}` : ''}!</p>
      <p>Obrigado por se cadastrar no <strong>Assistente Financeiro</strong>.</p>
      <p>Sua conta foi criada e está aguardando aprovação. Você receberá um e-mail assim que seu acesso for liberado.</p>
      <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 16px 0;">
        <p style="margin: 0; color: #1e40af;">
          💡 <strong>Dica:</strong> Isso geralmente leva menos de 24 horas!
        </p>
      </div>
      <p style="color: #666; font-size: 14px;">
        Enquanto isso, se tiver alguma dúvida, entre em contato conosco em: <a href="mailto:${process.env.SUPPORT_EMAIL}">${process.env.SUPPORT_EMAIL}</a>
      </p>
    </div>
  `
  return sendEmail(userEmail, subject, html)
}

export async function sendAdminNewUserNotification(adminEmail: string, newUserEmail: string, newUserName: string) {
  const subject = '🔔 Novo usuário na waitlist - Assistente Financeiro'
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Novo Usuário Aguardando Aprovação</h2>
      <p>Um novo usuário se cadastrou e está aguardando aprovação:</p>
      <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <p style="margin: 4px 0;"><strong>Nome:</strong> ${newUserName || 'Não informado'}</p>
        <p style="margin: 4px 0;"><strong>E-mail:</strong> ${newUserEmail}</p>
        <p style="margin: 4px 0;"><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
      </div>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/users" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 16px;">
        Ver no Painel Admin
      </a>
    </div>
  `
  return sendEmail(adminEmail, subject, html)
}
