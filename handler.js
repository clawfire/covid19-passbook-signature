'use strict';
const { execSync } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');

module.exports.sign = async (event) => {
    const manifest = event.body;
    const corsDomain = 'https://covid19passbook.netlify.app';
    const headers = {
        'Access-Control-Allow-Origin': corsDomain,
        'Access-Control-Allow-Credentials': true
    };

    try {
        const parsedManifest = JSON.parse(manifest);

        // validate manifest
        if (typeof parsedManifest !== 'object') {
            return {
                statusCode: 400,
                headers: headers,
                body: 'manifest is malformed',
            };
        }
        const keys = Object.keys(parsedManifest).sort()
        const refKeys = ["icon.png", "icon@2x.png", "pass.json", "thumbnail.png", "thumbnail@2x.png"]

        if (JSON.stringify(keys) !== JSON.stringify(refKeys)) {
            return {
                statusCode: 400,
                headers: headers,
                body: 'manifest is malformed',
            };
        }
        keys.forEach(e => {
            if ((typeof e !== "string") || e.length !== 0) {
                return {
                    statusCode: 400,
                    headers: headers,
                    body: 'manifest is malformed',
                };
            }
        });
    } catch (e) {
        return {
            statusCode: 400,
            headers: headers,
            body: 'manifest is malformed',
        };
    }

    const wwdr = `-----BEGIN CERTIFICATE-----
MIIEIjCCAwqgAwIBAgIIAd68xDltoBAwDQYJKoZIhvcNAQEFBQAwYjELMAkGA1UE
BhMCVVMxEzARBgNVBAoTCkFwcGxlIEluYy4xJjAkBgNVBAsTHUFwcGxlIENlcnRp
ZmljYXRpb24gQXV0aG9yaXR5MRYwFAYDVQQDEw1BcHBsZSBSb290IENBMB4XDTEz
MDIwNzIxNDg0N1oXDTIzMDIwNzIxNDg0N1owgZYxCzAJBgNVBAYTAlVTMRMwEQYD
VQQKDApBcHBsZSBJbmMuMSwwKgYDVQQLDCNBcHBsZSBXb3JsZHdpZGUgRGV2ZWxv
cGVyIFJlbGF0aW9uczFEMEIGA1UEAww7QXBwbGUgV29ybGR3aWRlIERldmVsb3Bl
ciBSZWxhdGlvbnMgQ2VydGlmaWNhdGlvbiBBdXRob3JpdHkwggEiMA0GCSqGSIb3
DQEBAQUAA4IBDwAwggEKAoIBAQDKOFSmy1aqyCQ5SOmM7uxfuH8mkbw0U3rOfGOA
YXdkXqUHI7Y5/lAtFVZYcC1+xG7BSoU+L/DehBqhV8mvexj/avoVEkkVCBmsqtsq
Mu2WY2hSFT2Miuy/axiV4AOsAX2XBWfODoWVN2rtCbauZ81RZJ/GXNG8V25nNYB2
NqSHgW44j9grFU57Jdhav06DwY3Sk9UacbVgnJ0zTlX5ElgMhrgWDcHld0WNUEi6
Ky3klIXh6MSdxmilsKP8Z35wugJZS3dCkTm59c3hTO/AO0iMpuUhXf1qarunFjVg
0uat80YpyejDi+l5wGphZxWy8P3laLxiX27Pmd3vG2P+kmWrAgMBAAGjgaYwgaMw
HQYDVR0OBBYEFIgnFwmpthhgi+zruvZHWcVSVKO3MA8GA1UdEwEB/wQFMAMBAf8w
HwYDVR0jBBgwFoAUK9BpR5R2Cf70a40uQKb3R01/CF4wLgYDVR0fBCcwJTAjoCGg
H4YdaHR0cDovL2NybC5hcHBsZS5jb20vcm9vdC5jcmwwDgYDVR0PAQH/BAQDAgGG
MBAGCiqGSIb3Y2QGAgEEAgUAMA0GCSqGSIb3DQEBBQUAA4IBAQBPz+9Zviz1smwv
j+4ThzLoBTWobot9yWkMudkXvHcs1Gfi/ZptOllc34MBvbKuKmFysa/Nw0Uwj6OD
Dc4dR7Txk4qjdJukw5hyhzs+r0ULklS5MruQGFNrCk4QttkdUGwhgAqJTleMa1s8
Pab93vcNIx0LSiaHP7qRkkykGRIZbVf1eliHe2iK5IaMSuviSRSqpd1VAKmuu0sw
ruGgsbwpgOYJd+W+NKIByn/c4grmO7i77LpilfMFY0GCzQ87HUyVpNur+cmV6U/k
TecmmYHpvPm0KdIBembhLoz2IYrF+Hjhga6/05Cdqa3zr/04GpZnMBxRpVzscYqC
tGwPDBUf
-----END CERTIFICATE-----`;

    const certificate = `-----BEGIN CERTIFICATE-----
MIIF+jCCBOKgAwIBAgIICtoLos2NYvQwDQYJKoZIhvcNAQEFBQAwgZYxCzAJBgNV
BAYTAlVTMRMwEQYDVQQKDApBcHBsZSBJbmMuMSwwKgYDVQQLDCNBcHBsZSBXb3Js
ZHdpZGUgRGV2ZWxvcGVyIFJlbGF0aW9uczFEMEIGA1UEAww7QXBwbGUgV29ybGR3
aWRlIERldmVsb3BlciBSZWxhdGlvbnMgQ2VydGlmaWNhdGlvbiBBdXRob3JpdHkw
HhcNMjEwNjEwMjE0NjEwWhcNMjIwNjEwMjE0NjA5WjCBnjEsMCoGCgmSJomT8ixk
AQEMHHBhc3MuY29tLnRoaWJhdWx0bWlsYW4uY292aWQxMzAxBgNVBAMMKlBhc3Mg
VHlwZSBJRDogcGFzcy5jb20udGhpYmF1bHRtaWxhbi5jb3ZpZDETMBEGA1UECwwK
NDY5OVFHRDRVUTEXMBUGA1UECgwOVGhpYmF1bHQgTWlsYW4xCzAJBgNVBAYTAlVT
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwWSMfAYjakGgecDQ3nOz
bu+bKk8dhBoIxY9wxp+MgBv/t7Fsz/AxViupOpfZIdwSDzoG9y3EEd7aKPZWYmvo
B1Iw6dNw+euzJ1zTVuC5iujbQMFYgDhm4RYlB17Pr8LzubLEvSkqhm+Wr2hGqcNI
pmL8JW7FAHDUxO2Zvs5utI153zrwBN+gg8eX3ZQ3Dy1xuL3QMNQyZQPPsB/BVFBL
6lQjXYailGs6kKnYRL+pBUssbNSiG9PqJJTjJiuzyFkGfuGMQMmxjwILcjYXyMdG
BAAgnE/qFJt3SuBrtc8ZcrbgQ6xF90DXxoAVNd8YvB4aRm7EMH1XnlJXO+DLGVyJ
+wIDAQABo4ICQDCCAjwwCQYDVR0TBAIwADAfBgNVHSMEGDAWgBSIJxcJqbYYYIvs
67r2R1nFUlSjtzA9BggrBgEFBQcBAQQxMC8wLQYIKwYBBQUHMAGGIWh0dHA6Ly9v
Y3NwLmFwcGxlLmNvbS9vY3NwLXd3ZHIwMzCCAQ8GA1UdIASCAQYwggECMIH/Bgkq
hkiG92NkBQEwgfEwKQYIKwYBBQUHAgEWHWh0dHA6Ly93d3cuYXBwbGUuY29tL2Fw
cGxlY2EvMIHDBggrBgEFBQcCAjCBtgyBs1JlbGlhbmNlIG9uIHRoaXMgY2VydGlm
aWNhdGUgYnkgYW55IHBhcnR5IGFzc3VtZXMgYWNjZXB0YW5jZSBvZiB0aGUgdGhl
biBhcHBsaWNhYmxlIHN0YW5kYXJkIHRlcm1zIGFuZCBjb25kaXRpb25zIG9mIHVz
ZSwgY2VydGlmaWNhdGUgcG9saWN5IGFuZCBjZXJ0aWZpY2F0aW9uIHByYWN0aWNl
IHN0YXRlbWVudHMuMB4GA1UdJQQXMBUGCCsGAQUFBwMCBgkqhkiG92NkBA4wMAYD
VR0fBCkwJzAloCOgIYYfaHR0cDovL2NybC5hcHBsZS5jb20vd3dkcmNhLmNybDAd
BgNVHQ4EFgQUOGiq369Sa2+Rn12oEyFkRKaU2qQwCwYDVR0PBAQDAgeAMBAGCiqG
SIb3Y2QGAwIEAgUAMCwGCiqGSIb3Y2QGARAEHgwccGFzcy5jb20udGhpYmF1bHRt
aWxhbi5jb3ZpZDANBgkqhkiG9w0BAQUFAAOCAQEAK8UvbQmCwftHBGiu6YeLBgSD
iVR7arhhn7d/rWDU52pduAj4h9F89YI+QDu6ZV5FbVq2/uGRHlj5nmqEolJU2cv4
Shtg+9gXD79kqodN5h8chQ8qcTBNsf7zU92DJq5xkNhAdAFc4aCigWOi8ujK/466
zicUZmq4DfSffSkiE14wLWJxfp7fikedp5GBowwwkQIQyX8C5fZg9doFqIM0m7Cw
/euE2QV+EcE5nfOtGApEmA67POSEw4TuVg7O7l0ZQqQVMbhqNrcwKQ9RBHlmwYwo
VZeQa5t+2IRuXZlavaWohlGhcAjiXTVdKDe76IZ5TALyWOGrUZy5hJjUL5EiKg==
-----END CERTIFICATE-----`;
    const passphrase = process.env.KEY_PASSPHRASE;
    const key = process.env.KEY;

    // /tmp acts as a cache when the lambda is "hot"
    // It's automatically flushed when the lambda is cold (±30min w/o access)
    if (!fs.existsSync('/tmp/certificate.pem')) {
        fs.writeFileSync('/tmp/certificate.pem', certificate);
        fs.writeFileSync('/tmp/wwdr.pem', wwdr);
        fs.writeFileSync('/tmp/key.pem', key.replace(/\\n/g, "\n"));
    }

    const hash = crypto.createHash('sha1').update(manifest).digest('hex');
    const manifestFile = `/tmp/manifest.${hash}.json`;
    if (!fs.existsSync(manifestFile)) {
        fs.writeFileSync(manifestFile, manifest)
    }
    const command = `openssl smime -binary -sign -md SHA1 -certfile /tmp/wwdr.pem -signer /tmp/certificate.pem -inkey /tmp/key.pem -in ${manifestFile} -outform DER -passin pass:${passphrase}`
    try {
        const stdout = execSync(command);
        const base64data = stdout.toString('base64');

        return {
            statusCode: 200,
            headers: headers,
            body: base64data,
        };

    } catch (error) {
        console.log(`Status Code: ${error.status} with '${error.message}'`);
        return {
            statusCode: 500,
            headers: headers,
            body: error.status + error.message,
        };
    }
}
