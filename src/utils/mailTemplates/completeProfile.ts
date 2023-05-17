export const createprofileTemplate = (firstname:string, link:string)=>{
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
				color: #666666;
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
		<p>Dear ${firstname}</p>
		<p>Thank you for registering with SmeBud. We'd like to remind you to complete your profile by adding more information about yourself. This will help us better tailor our services to meet your needs.</p>
		<p>Here's the link to continue adding your profile:</p>
		<a href=${link} class="button">Continue Adding Profile</a>
		<p>If you have any questions or concerns, please don't hesitate to reach out to us.</p>
		<p>Thank you for your time.</p>
		<p>Best regards,</p>
		<p>The SmeBud Team</p>
	</div>
	</body>
	</html>
	
		
	`}