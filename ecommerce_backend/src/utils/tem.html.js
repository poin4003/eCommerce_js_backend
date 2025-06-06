"use strict";

const htmlEmailToken = () => {
  return `
      <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>YourVibes - OTP Verification</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            background-color: #f0f2f5;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            color: #333;
        }
        .otp-container {
            background: #ffffff;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
            text-align: center;
            max-width: 400px;
            width: 100%;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 20px;
        }
        h1 {
            font-size: 24px;
            color: #2c3e50;
            margin-bottom: 20px;
            font-weight: 600;
        }
        .otp-code {
            font-size: 36px;
            font-weight: bold;
            color: #2980b9;
            background: #eef7ff;
            padding: 15px 25px;
            border-radius: 8px;
            letter-spacing: 6px;
            display: inline-block;
            margin: 10px 0;
        }
        p {
            font-size: 14px;
            color: #666;
            margin-top: 20px;
        }
        @media screen and (max-width: 480px) {
            .otp-container {
                padding: 25px;
                margin: 10px;
            }
            .logo {
                font-size: 24px;
            }
            h1 {
                font-size: 20px;
            }
            .otp-code {
                font-size: 28px;
                padding: 12px 20px;
                letter-spacing: 4px;
            }
            p {
                font-size: 13px;
            }
        }
    </style>
</head>
<body>
    <div class="otp-container">
        <div class="logo">YourVibes</div>
        <h1>OTP Verification</h1>
        <div class="otp-code">{{.link_verify}}</div>
        <p>Please use this One-Time Password to complete your verification. It will expire in 10 minutes.</p>
    </div>
</body>
</html>
  `;
};

module.exports = {
  htmlEmailToken
}
