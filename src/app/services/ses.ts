import {
  SESv2Client,
  SendEmailCommand,
  SendEmailCommandInput,
} from '@aws-sdk/client-sesv2';
import { SESClientInterface } from '../types/ses';

class SESClient implements SESClientInterface {
  private client: SESv2Client;

  constructor(accessId: string, secretKey: string) {
    this.client = new SESv2Client({
      region: 'sa-east-1',
      credentials: {
        accessKeyId: accessId,
        secretAccessKey: secretKey,
      },
    });
  }

  async sendEmailOrder(email: string, orderId: string) {
    const html: string = `<!DOCTYPE html>
                          <html lang="en">
                          <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Orden</title>
                            <style>
                              body {
                                font-family: Arial, sans-serif;
                                background-color: #f4f4f4;
                                color: #333333;
                                padding: 20px;
                              }
                              .container {
                                max-width: 600px;
                                margin: 0 auto;
                                background-color: #ffffff;
                                padding: 20px;
                                border-radius: 8px;
                                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                              }
                              h1 {
                                color: #4CAF50;
                              }
                              p {
                                font-size: 16px;
                                line-height: 1.5;
                              }
                              .footer {
                                margin-top: 20px;
                                text-align: center;
                                font-size: 12px;
                                color: #777777;
                              }
                            </style>
                          </head>
                          <body>
                            <div class="container">
                              <h1>Tu entrada</h1>
                              <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${orderId}" alt="QR Code">
                              <p>Saludos,<br>La Crypta</p>
                              <div class="footer">
                                <p>&copy; 2024 La Crypta. 2024 La Crypta. Todos los derechos reservados.</p>
                              </div>
                            </div>
                          </body>
                          </html>
                          `;

    const input: SendEmailCommandInput = {
      FromEmailAddress: 'ticketing@lacrypta.ar',
      Destination: {
        ToAddresses: [email],
      },
      ReplyToAddresses: ['ticketing@lacrypta.ar'],
      Content: {
        Simple: {
          Subject: {
            Data: 'Esta es tu entrada para el evento',
          },
          Body: {
            Text: {
              Data: 'Testo de previsualizacion?',
            },
            Html: {
              Data: html,
            },
          },
        },
      },
    };

    const command = new SendEmailCommand(input);

    return await this.client.send(command);
  }

  async sendEmailNewsletter(email: string) {
    const html: string = `<!DOCTYPE html>
                        <html lang="en">
                        <head>
                          <meta charset="UTF-8">
                          <meta name="viewport" content="width=device-width, initial-scale=1.0">
                          <title>Newsletter</title>
                          <style>
                            body {
                              font-family: Arial, sans-serif;
                              background-color: #f4f4f4;
                              color: #333333;
                              padding: 20px;
                            }
                            .container {
                              max-width: 600px;
                              margin: 0 auto;
                              background-color: #ffffff;
                              padding: 20px;
                              border-radius: 8px;
                              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                            }
                            h1 {
                              color: #4CAF50;
                            }
                            p {
                              font-size: 16px;
                              line-height: 1.5;
                            }
                            .footer {
                              margin-top: 20px;
                              text-align: center;
                              font-size: 12px;
                              color: #777777;
                            }
                          </style>
                        </head>
                        <body>
                          <div class="container">
                            <h1>El newsletter</h1>
                            <p>Gracias por subscribirte. 🎉<p>
                            <p>Saludos,<br>La Crypta</p>
                            <div class="footer">
                              <p>&copy; 2024 La Crypta. Todos los derechos reservados.</p>
                            </div>
                          </div>
                        </body>
                        </html>
                        `;

    const input: SendEmailCommandInput = {
      FromEmailAddress: 'ticketing@lacrypta.ar',
      Destination: {
        ToAddresses: [email],
      },
      ReplyToAddresses: ['ticketing@lacrypta.ar'],
      Content: {
        Simple: {
          Subject: {
            Data: 'Te subscribiste al newsletter de La Crypta',
          },
          Body: {
            Text: {
              Data: 'Texto de previsualizacion?',
            },
            Html: {
              Data: html,
            },
          },
        },
      },
    };

    const command = new SendEmailCommand(input);

    return await this.client.send(command);
  }
}

export const ses: SESClientInterface = new SESClient(
  process.env.AWS_KEY_ID!,
  process.env.AWS_SECRET_KEY!
);
