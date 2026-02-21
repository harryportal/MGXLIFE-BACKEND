export const notifyCustomerSubscription = (firstname:string, link:string)=>{
    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                margin: 0;
                padding: 0;
                font-family: Arial, sans-serif;
                font-size: 16px;
                line-height: 1.5;
                background-color: #f5f5f5;
            }
            h1 {
                font-size: 36px;
                font-weight: bold;
                color: #333333;
                margin-top: 20px;
                margin-bottom: 10px;
            }
            p {
                color: #333333;
                font-size: 18px;
                margin-bottom: 10px;

            }
            .highlight {
                color: #2c3e50;
                font-weight: bold;
            }
            .button {
                display: inline-block;
                padding: 8px 15px;
                background-color: #3498db;
                color: #ffffff;
                font-size: 18px;
                font-weight: bold;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 10px;
                margin-bottom: 10px;
                transition: background-color 0.3s ease;
            }
            .button:hover {
                background-color: #2980b9;
            }
            .button:focus {
                color: #ffffff;
            }
        </style>
    </head>
    <body>
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <p>Hello ${firstname}</p>
        <p>This is to inform you that your annual subscription was successful.<p>
		<p>Here's the link to view your payment and manage your invoices:</p>
		<a href="${link}" class="button">Login to your Payment Dashboard</a>
		<p>If the link has expired, sign in to your distributor doashboard to veiw payment details</p>
        <p>Best regards,</p>
        <p>The MGXLIFE Team</p>	</div>
        </body>
	</html>
`}