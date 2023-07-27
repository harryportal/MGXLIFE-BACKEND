export const complainEmailTemplate = (name:string, email:string, message:string)=>{
    return `
    <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>You have a new Question / Enquiry</title>
  <style>
    body {
      font-family: Arial, sans-serif;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
    }
    .box {
      background-color: #f2f2f2;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      padding: 20px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    h1 {
      color: #007bff;
      text-align: center;
    }
    p {
      margin-bottom: 10px;
    }
    .complaint-details {
      background-color: #fff;
      padding: 10px;
      border-radius: 5px;
    }
    .complaint-label {
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Complaint</h1>
    <div class="box complaint-details">
      <p class="complaint-label">FullName:${name}</p>
    </div>
    <div class="box complaint-details">
      <p class="complaint-label">User Email:${email}</p>
    </div>
    <div class="box complaint-details">
      <p class="complaint-label">User Message:</p>
      <p>${message}</p>
    </div>
  </div>
</body>
</html>

    `
}