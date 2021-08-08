# Serverless Framework AWS NodeJS Sign function

## Usage

### Generate the certificates
In order to sign the passbook, you'll need certificates from Apple. For the next step, I'll assume you have an Apple developper account.

1. Request a certificate from Apple
   1. Log in to the iOS Developer Center
   2. Go on [the identifier section](https://developer.apple.com/account/resources/identifiers/list/passTypeId), on the top right select the menu (should be App IDs) and select *Pass type IDs*
   4. Create a new one using the blue + sign
   5. Select *Pass Type IDs* and click continue.
   6. Fill a description. For the identifier, follow recommendation from Apple to reverse your domain.
   7. Once it's done, Go on [certificate section](https://developer.apple.com/account/resources/certificates/list)
   8. Create a new one using the blue + sign
   9. Under *Services*, select *Pass Type ID Certificate* and click continue.
   10. Enter a pass certificate name for your usage and select the pass type we just created on step 2-6, and click continue.
2. Creating your Certificate Sining Request
   1. Open keychain on your mac
   2. From the menu, select Keychain Access | Certificate Assistant | Request a Certificate from a Certificate Authority. In the Certificate Information window, enter the following:
      1. User Email Address: Enter the e-mail address associated with your iOS developer account.
      2. Common Name: Choose a name that relates to the Pass Type ID. This will be displayed next to the key in Keychain Access, so a common name that isn't specific enough can cause confusion.
      3. CA Email Address: Leave this field blank
      4. Request is: Choose Saved to Disk
      5. Save to your disk
3. Now back to the Apple Developer portal
   1. upload your request.
   2. Click on Generate and wait for the pass Type certificate to be generated.
   3. Once generated, click on Done and download your certificate.
4. Prepare your certificate for use it
   1. Open your downloaded certificate, which will launch Keychain Access and attach the certificate to the associated private key, which was created during the generation of the Certificate Signing Request
   2. The certificate and key pair should now be visible in Keychain Access. These now need to be converted into a format that can be used to correctly sign the Passes you will create. Select the certificate in Keychain Access, and from the menu choose File | Export Items, and choose an export location. You will be asked to provide a password to protect the exported items, you may also be asked for the administrator password as you are performing a task that requires administrator privileges.
   3. Use the following Terminal commands to generate a `certificate.pem` file and a `key.pem` file.
   ```
   openssl pkcs12 -in <Path to exported .p12> -clcerts -nokeys -out certificate.pem
   openssl pkcs12 -in <Path to exported .p12> -nocerts -out key.pem
   ```
   4. On generating the key.pem, you will be prompted to enter an import passport, which is the password that was set when exporting from Keychain Access. You will then be prompted for a pass phrase; this can be the same as the import password, but note that this pass phrase will need to provided when signing your Passes and so may form part of an automated script.

### Use your certificate
On the `handler.js` page, you need to paste your `certificate.pem` content on line 82 `const certificate = ...`.
As you can see, the `key.pem` content and the key passphrase will be put in deployment variable.


### Deployment

In order to deploy the example, you need to run the following command:

```
$ serverless deploy
```

After running deploy, you should see output similar to:

```bash
Serverless: Packaging service...
Serverless: Excluding development dependencies...
Serverless: Creating Stack...
Serverless: Checking Stack create progress...
........
Serverless: Stack create finished...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading artifacts...
Serverless: Uploading service aws-node.zip file to S3 (711.23 KB)...
Serverless: Validating template...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
.................................
Serverless: Stack update finished...
Service Information
service: aws-node
stage: dev
region: us-east-1
stack: aws-node-dev
resources: 6
functions:
  api: aws-node-dev-hello
layers:
  None
```

### Invocation

After successful deployment, you can invoke the deployed function by using the following command:

```bash
serverless invoke --function sign
```

Which should result in response similar to the following:

```json
{
    "statusCode": 200,
    "body": "{\n  \"message\": \"Go Serverless v2.0! Your function executed successfully!\",\n  \"input\": {}\n}"
}
```

### Local development

You can invoke your function locally by using the following command:

```bash
serverless invoke local --function sign
```

Which should result in response similar to the following:

```
{
    "statusCode": 200,
    "body": "{\n  \"message\": \"Go Serverless v2.0! Your function executed successfully!\",\n  \"input\": \"\"\n}"
}
```
