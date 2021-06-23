'use strict';
const {
    execSync
} = require('child_process');
const crypto = require('crypto');
const fs = require('fs');


module.exports.sign = async (event) => {
    const manifest = event.body;

    try {
        const parsedManifest = JSON.parse(manifest);

        // validate manifest
        if (typeof parsedManifest !== 'object') {
            return {
                statusCode: 400,
                body: 'manifest is malformed',
            };        
        }
        const keys = Object.keys(parsedManifest).sort()
        const refKeys = [ "icon.png", "icon@2x.png", "pass.json", "thumbnail.png", "thumbnail@2x.png" ]

        if (JSON.stringify(keys) !== JSON.stringify(refKeys)) {
            return {
                statusCode: 400,
                body: 'manifest is malformed',
            };         
        }
        keys.forEach(e => {
            if ((typeof e !== "string") || e.length !== 0) {
                return {
                    statusCode: 400,
                    body: 'manifest is malformed',
                };             
            }
        });
    } catch(e) {
        return {
            statusCode: 400,
            body: 'manifest is malformed',
        };         
    }


    const wwdr = `-----BEGIN CERTIFICATE-----
MIIEUTCCAzmgAwIBAgIQfK9pCiW3Of57m0R6wXjF7jANBgkqhkiG9w0BAQsFADBi
MQswCQYDVQQGEwJVUzETMBEGA1UEChMKQXBwbGUgSW5jLjEmMCQGA1UECxMdQXBw
bGUgQ2VydGlmaWNhdGlvbiBBdXRob3JpdHkxFjAUBgNVBAMTDUFwcGxlIFJvb3Qg
Q0EwHhcNMjAwMjE5MTgxMzQ3WhcNMzAwMjIwMDAwMDAwWjB1MUQwQgYDVQQDDDtB
cHBsZSBXb3JsZHdpZGUgRGV2ZWxvcGVyIFJlbGF0aW9ucyBDZXJ0aWZpY2F0aW9u
IEF1dGhvcml0eTELMAkGA1UECwwCRzMxEzARBgNVBAoMCkFwcGxlIEluYy4xCzAJ
BgNVBAYTAlVTMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2PWJ/KhZ
C4fHTJEuLVaQ03gdpDDppUjvC0O/LYT7JF1FG+XrWTYSXFRknmxiLbTGl8rMPPbW
BpH85QKmHGq0edVny6zpPwcR4YS8Rx1mjjmi6LRJ7TrS4RBgeo6TjMrA2gzAg9Dj
+ZHWp4zIwXPirkbRYp2SqJBgN31ols2N4Pyb+ni743uvLRfdW/6AWSN1F7gSwe0b
5TTO/iK1nkmw5VW/j4SiPKi6xYaVFuQAyZ8D0MyzOhZ71gVcnetHrg21LYwOaU1A
0EtMOwSejSGxrC5DVDDOwYqGlJhL32oNP/77HK6XF8J4CjDgXx9UO0m3JQAaN4LS
VpelUkl8YDib7wIDAQABo4HvMIHsMBIGA1UdEwEB/wQIMAYBAf8CAQAwHwYDVR0j
BBgwFoAUK9BpR5R2Cf70a40uQKb3R01/CF4wRAYIKwYBBQUHAQEEODA2MDQGCCsG
AQUFBzABhihodHRwOi8vb2NzcC5hcHBsZS5jb20vb2NzcDAzLWFwcGxlcm9vdGNh
MC4GA1UdHwQnMCUwI6AhoB+GHWh0dHA6Ly9jcmwuYXBwbGUuY29tL3Jvb3QuY3Js
MB0GA1UdDgQWBBQJ/sAVkPmvZAqSErkmKGMMl+ynsjAOBgNVHQ8BAf8EBAMCAQYw
EAYKKoZIhvdjZAYCAQQCBQAwDQYJKoZIhvcNAQELBQADggEBAK1lE+j24IF3RAJH
Qr5fpTkg6mKp/cWQyXMT1Z6b0KoPjY3L7QHPbChAW8dVJEH4/M/BtSPp3Ozxb8qA
HXfCxGFJJWevD8o5Ja3T43rMMygNDi6hV0Bz+uZcrgZRKe3jhQxPYdwyFot30ETK
XXIDMUacrptAGvr04NM++i+MZp+XxFRZ79JI9AeZSWBZGcfdlNHAwWx/eCHvDOs7
bJmCS1JgOLU5gm3sUjFTvg+RTElJdI+mUcuER04ddSduvfnSXPN/wmwLCTbiZOTC
NwMUGdXqapSqqdv+9poIZ4vvK7iqF0mDr8/LvOnP6pVxsLRFoszlh6oKw0E6eVza
UDSdlTs=
-----END CERTIFICATE-----`;
    const certificate = `Bag Attributes
    friendlyName: Pass Type ID: pass.com.thibaultmilan.covid
    localKeyID: 38 68 AA DF AF 52 6B 6F 91 9F 5D A8 13 21 64 44 A6 94 DA A4
subject=/UID=pass.com.thibaultmilan.covid/CN=Pass Type ID: pass.com.thibaultmilan.covid/OU=4699QGD4UQ/O=Thibault Milan/C=US
issuer=/C=US/O=Apple Inc./OU=Apple Worldwide Developer Relations/CN=Apple Worldwide Developer Relations Certification Authority
-----BEGIN CERTIFICATE-----
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
        console.log('files do not exist, creating them...')
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
    console.log(command)
    try {
        const stdout = execSync(command);
        console.log('rulez');
        const base64data = stdout.toString('base64');
        console.log('result', base64data);

        return {
            statusCode: 200,
            body: base64data,
        };

    } catch (error) {
        console.log(`Status Code: ${error.status} with '${error.message}'`);
        return {
            statusCode: 500,
            body: error.status + error.message,
        };
    }
}
